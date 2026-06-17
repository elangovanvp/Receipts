import type { Teardown, Claim, StreamEvent, Facet } from "@/lib/types";
import { SAMPLES } from "@/lib/sample";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Provider-agnostic, 100% free stack (no credit card):
 *  - LLM via any OpenAI-compatible endpoint. Default: Groq + open Llama 3.3 70B.
 *    (Google Gemini's free tier works too — just change the three LLM_* envs.)
 *  - Web search + fetch via Jina (s.jina.ai / r.jina.ai) — free, keyless.
 */
const LLM_BASE = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
const LLM_MODEL = process.env.LLM_MODEL || "llama-3.3-70b-versatile";
// Synthesis (the writing) uses a stronger open model for sharper prose.
const SYNTH_MODEL = process.env.SYNTH_MODEL || "openai/gpt-oss-120b";
const LLM_KEY = process.env.LLM_API_KEY || process.env.GROQ_API_KEY || "";
const JINA_KEY = process.env.JINA_API_KEY || "";

const FACET_KEYS = ["positioning", "icp", "pricing", "recent", "strengths", "weaknesses"] as const;

// Phase 1 — research via a tiny TEXT protocol (model-agnostic; avoids the flaky
// native tool-calling that open models like Llama mis-format on Groq).
const RESEARCH_SYSTEM = `You are a competitive-intelligence researcher gathering evidence about a product: its positioning, who it's for, pricing, recent releases, strengths, and weaknesses.

You have two tools. To use one, reply with EXACTLY one line and nothing else:
  SEARCH: <query>
  FETCH: <absolute url>
After I return results, send your next line. Aim for 3-5 FETCHes: the official site, a pricing page, a changelog/release-notes page, AND one credible third-party review or "<product> limitations/complaints" page — that last one is where real weaknesses come from. When you have enough, reply with exactly:
  DONE
Always start by searching for the product's official website.`;

// Phase 2 — synthesis. Plain JSON output (no tools), which open models do reliably.
const SYNTH_SYSTEM = `You are Receipts — a ruthless but fair competitive analyst. Your reputation rests on ONE rule: NO SOURCE, NO CLAIM.

You are given research notes: the verbatim text of pages that were actually fetched, each prefixed with its SOURCE url. Using ONLY those notes, output a teardown as a single JSON object — no prose, no markdown.

VOICE: Write like a sharp analyst briefing a busy founder. Every claim is ONE concrete, specific, falsifiable sentence with a point of view — name the actual feature, price, number, or move. No marketing fluff, no hedging, no filler words, no restating the product's own tagline as insight.

WEAKNESSES MUST BITE: mine the notes for real soft spots — recurring complaints in reviews, features users keep asking for, pricing friction, a thin or stale changelog, gaps versus competitors. "Could be improved" is worthless; "no native offline mode despite years of user requests" is the job. If the notes contain no honest critical signal, leave weaknesses EMPTY and add an unverified note — never invent or soften a weakness. NEVER treat a fetch error, a 404, an empty page, or a missing URL as a weakness — those are research artifacts, not product flaws.

HARD RULES (absolute):
- Every claim's source.url MUST be one of the SOURCE urls in the notes, and source.quote MUST be a short verbatim string copied from that page's text.
- If you cannot back something with the notes, DO NOT assert it. Put it in "unverified" with a one-line reason. Never invent pricing, counts, funding, dates, or URLs, and never fabricate or paraphrase a quote.
- NEVER write a claim whose text just says information is missing or wasn't found. A facet with no support gets an EMPTY claims array.
- confidence "high" only when the company's own page states it or two notes agree; else "medium".
- A quote must read as human prose — NEVER a navigation menu, link list, or bullet fragments like "* Design * Engineering * Product". If the only supporting text is a menu, skip the claim.
- For positioning, do NOT echo the tagline back as the claim. State the distinct stance it stakes out or who it's implicitly fighting (e.g. not "calls itself the collaborative design tool" but "bets on real-time multiplayer as the wedge against Sketch's single-player files").

JSON shape:
{
  "target": string, "canonicalUrl": string, "tagline": string (one sharp sentence),
  "facets": [ { "key": one of ${JSON.stringify(FACET_KEYS)}, "label": string, "exhibit": "A".."F",
    "claims": [ { "text": string, "confidence": "high"|"medium",
      "source": { "title": string, "url": string, "quote": string } } ] } ],
  "unverified": [ { "text": string, "reason": string } ]
}
Include all six facets in that order (exhibits A-F). A facet with no support gets an empty claims array.`;

// ---- Free tools (Jina) -----------------------------------------------------

async function jinaSearch(query: string): Promise<string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Respond-With": "no-content",
  };
  if (JINA_KEY) headers.Authorization = `Bearer ${JINA_KEY}`;
  const r = await fetch(`https://s.jina.ai/?q=${encodeURIComponent(query)}`, {
    headers,
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) return `search failed (${r.status})`;
  const j = (await r.json()) as { data?: Array<{ title?: string; url?: string; description?: string }> };
  const hits = (j.data ?? []).slice(0, 4).map((d) => ({
    title: d.title ?? "",
    url: d.url ?? "",
    snippet: (d.description ?? "").slice(0, 120),
  }));
  return JSON.stringify(hits);
}

async function jinaFetch(url: string): Promise<string> {
  const headers: Record<string, string> = {};
  if (JINA_KEY) headers.Authorization = `Bearer ${JINA_KEY}`;
  const r = await fetch(`https://r.jina.ai/${url}`, {
    headers,
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) return `fetch failed (${r.status})`;
  const text = await r.text();
  // Empty / soft-404 / JS-blocked pages come back tiny — treat as failed so the
  // model can't read "the page is basically empty" as evidence of a weakness.
  if (text.trim().length < 200) return "fetch failed (empty page)";
  return text.slice(0, 3500);
}

// ---- LLM (OpenAI-compatible) ----------------------------------------------

type ToolCall = { id: string; function: { name: string; arguments: string } };
type Msg = Record<string, unknown>;

type ChatOpts = { tools?: unknown[]; jsonMode?: boolean; model?: string };

async function chat(messages: Msg[], opts: ChatOpts = {}) {
  const body: Record<string, unknown> = {
    model: opts.model ?? LLM_MODEL,
    messages,
    temperature: 0.3,
    max_tokens: 4096,
  };
  if (opts.tools) {
    body.tools = opts.tools;
    body.tool_choice = "auto";
  }
  if (opts.jsonMode) body.response_format = { type: "json_object" };

  const call = () =>
    fetch(`${LLM_BASE}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_KEY}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(55000),
    });

  let r = await call();
  if (r.status === 429) {
    // free-tier TPM window — wait the suggested time (capped) and retry once
    const ra = Number(r.headers.get("retry-after")) || 10;
    await new Promise((res) => setTimeout(res, Math.min(ra, 20) * 1000));
    r = await call();
  }
  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    throw new Error(`LLM ${r.status}: ${errText.slice(0, 200)}`);
  }
  const data = (await r.json()) as {
    choices: Array<{ message: { content?: string; tool_calls?: ToolCall[] } }>;
  };
  return data.choices[0].message;
}

const normUrl = (u: string) => u.trim().replace(/\/+$/, "").toLowerCase();

function toTeardown(input: Record<string, unknown>, allowed: Set<string>): Teardown {
  const facets = ((input.facets as Facet[]) ?? []).filter((f) => f && f.key);
  facets.forEach((f) => {
    f.claims = (f.claims ?? [])
      // server-enforced honesty: a claim must carry a verbatim quote AND cite a
      // page we actually fetched OK — otherwise it isn't a receipt.
      .filter((c) => c && c.text && c.source?.url && c.source?.quote && allowed.has(normUrl(c.source.url)))
      .map((c, i) => ({ ...c, id: `${f.key}-${i}` }) as Claim);
  });
  return {
    target: String(input.target ?? ""),
    canonicalUrl: input.canonicalUrl ? String(input.canonicalUrl) : undefined,
    tagline: input.tagline ? String(input.tagline) : undefined,
    facets,
    unverified: (input.unverified as Teardown["unverified"]) ?? [],
    generatedAt: "live",
  };
}

export async function POST(req: Request) {
  const { target } = (await req.json().catch(() => ({}))) as { target?: string };
  const clean = (target ?? "").trim();

  const encoder = new TextEncoder();
  const send = (c: ReadableStreamDefaultController, e: StreamEvent) =>
    c.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (!clean) {
          send(controller, { type: "error", message: "Name a product to tear down." });
          controller.close();
          return;
        }

        // Offline / no-key fallback: bundled real samples so it always demos.
        if (!LLM_KEY) {
          const sample = SAMPLES[clean.toLowerCase()];
          if (sample) {
            send(controller, { type: "status", tool: "web_search", label: "Finding the official site…" });
            send(controller, { type: "status", tool: "fetch_url", label: "Reading pricing & changelog…" });
            send(controller, { type: "done", teardown: sample });
          } else {
            send(controller, {
              type: "error",
              message:
                "The live agent isn't connected here (no LLM_API_KEY). Try “Linear” or “Notion” for a bundled sample, or add a free Groq key.",
            });
          }
          controller.close();
          return;
        }

        // ---- Phase 1: research via the text protocol; stash fetched pages in `notes` ----
        const messages: Msg[] = [
          { role: "system", content: RESEARCH_SYSTEM },
          { role: "user", content: `Research this product: ${clean}\nReply with your first line.` },
        ];
        const notes: string[] = []; // "SOURCE: <url>\n<content>"
        const sources: string[] = []; // urls fetched OK — the ONLY citable set

        for (let turn = 0; turn < 8 && notes.length < 5; turn++) {
          const msg = await chat(messages);
          const text = (msg.content ?? "").trim();
          messages.push({ role: "assistant", content: text });

          const m = text.match(/\b(SEARCH|FETCH|DONE)\b\s*:?[ \t]*([^\n]*)/i);
          const verb = (m?.[1] ?? "DONE").toUpperCase();
          const arg = (m?.[2] ?? "").trim().replace(/^["'<]+|["'>.,]+$/g, "");
          if (verb === "DONE" || !arg) break;

          if (verb === "SEARCH") {
            send(controller, { type: "status", tool: "web_search", label: `Searching: ${arg.slice(0, 60)}` });
            const out = await jinaSearch(arg);
            messages.push({ role: "user", content: `RESULTS:\n${out}\nYour next line (SEARCH/FETCH/DONE):` });
          } else {
            send(controller, { type: "status", tool: "fetch_url", label: `Reading ${arg.replace(/^https?:\/\//, "").slice(0, 48)}…` });
            const body = await jinaFetch(arg);
            if (body.startsWith("fetch failed")) {
              // a failed fetch must NEVER become citable "evidence"
              messages.push({ role: "user", content: `That page couldn't be read (${body}). Try a different URL. Your next line (SEARCH/FETCH/DONE):` });
            } else {
              notes.push(`SOURCE: ${arg}\n${body}`); // full text kept only here, not in the loop
              sources.push(arg);
              messages.push({ role: "user", content: `Fetched (${body.length} chars), saved. Your next line (SEARCH/FETCH/DONE):` });
            }
          }
        }

        // ---- Phase 2: synthesize a sourced teardown as plain JSON ----
        let teardown: Teardown | null = null;
        if (notes.length) {
          send(controller, { type: "status", tool: "fetch_url", label: "Writing the sourced teardown…" });
          const allowed = new Set(sources.map(normUrl));
          const corpus = notes.join("\n\n---\n\n").slice(0, 9000);
          const synth = await chat(
            [
              { role: "system", content: SYNTH_SYSTEM },
              { role: "user", content: `Product: ${clean}\n\nRESEARCH NOTES:\n${corpus}` },
            ],
            { jsonMode: true, model: SYNTH_MODEL },
          );
          try {
            teardown = toTeardown(JSON.parse(synth.content ?? "{}"), allowed);
          } catch {
            teardown = null;
          }
        }

        if (!teardown) {
          send(controller, {
            type: "error",
            message: `Couldn't gather enough public material to tear down “${clean}” fairly. Try a more specific product name or its URL.`,
          });
        } else if (!teardown.facets.some((f) => f.claims.length)) {
          send(controller, {
            type: "error",
            message: `Not enough public signal to tear down “${clean}” fairly — so I won't fake it.`,
          });
        } else {
          send(controller, { type: "done", teardown });
        }
        controller.close();
      } catch (err) {
        send(controller, {
          type: "error",
          message:
            err instanceof Error ? `Agent error: ${err.message}` : "The agent hit an unexpected error.",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
