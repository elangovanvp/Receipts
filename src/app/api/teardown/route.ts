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
const LLM_KEY = process.env.LLM_API_KEY || process.env.GROQ_API_KEY || "";
const JINA_KEY = process.env.JINA_API_KEY || "";

const FACET_KEYS = ["positioning", "icp", "pricing", "recent", "strengths", "weaknesses"] as const;

const SYSTEM = `You are Receipts — a ruthless but fair competitive-intelligence analyst. Your entire reputation rests on ONE discipline:

  NO SOURCE, NO CLAIM.

Given a product (a name or URL), produce a sharp, specific teardown across six facets: positioning, who-it's-for (icp), pricing, what-shipped-recently (recent), where-it's-strong (strengths), where-it's-weak (weaknesses).

HOW TO WORK:
1. Call web_search to find the product's real pages (homepage, pricing, changelog/release notes) and third-party reviews.
2. Call fetch_url on the most relevant URLs to read their ACTUAL content.
3. Only after reading real pages, finish by calling emit_teardown exactly once.

HARD RULES — non-negotiable:
- Every factual claim you assert MUST be backed by a page you actually fetched, with the real source URL and a short verbatim quote from that page.
- If you cannot back a claim with a fetched source, DO NOT assert it. Put it in the "unverified" list with a one-line reason. Never guess pricing, customer counts, funding, or dates.
- Be specific and opinionated — no hype, no filler. One crisp sentence per claim.
- confidence = "high" only when two+ independent sources agree or it's on the company's own page; otherwise "medium".
- Keep total tool calls efficient (aim for ~3-6 searches/fetches), then emit.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web. Returns a list of {title, url, snippet}.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Search query." } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_url",
      description: "Fetch and read the readable text of a single web page.",
      parameters: {
        type: "object",
        properties: { url: { type: "string", description: "Absolute URL to read." } },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "emit_teardown",
      description: "Emit the final structured teardown. Call exactly once, last.",
      parameters: {
        type: "object",
        properties: {
          target: { type: "string" },
          canonicalUrl: { type: "string" },
          tagline: { type: "string", description: "One sharp sentence read of the product." },
          facets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string", enum: [...FACET_KEYS] },
                label: { type: "string" },
                exhibit: { type: "string", description: "A..F" },
                claims: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      confidence: { type: "string", enum: ["high", "medium"] },
                      source: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          url: { type: "string" },
                          quote: { type: "string", description: "Verbatim quote from the fetched page." },
                        },
                        required: ["title", "url", "quote"],
                      },
                    },
                    required: ["text", "confidence", "source"],
                  },
                },
              },
              required: ["key", "label", "exhibit", "claims"],
            },
          },
          unverified: {
            type: "array",
            items: {
              type: "object",
              properties: { text: { type: "string" }, reason: { type: "string" } },
              required: ["text", "reason"],
            },
          },
        },
        required: ["target", "canonicalUrl", "tagline", "facets", "unverified"],
      },
    },
  },
];

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
  const hits = (j.data ?? []).slice(0, 6).map((d) => ({
    title: d.title ?? "",
    url: d.url ?? "",
    snippet: (d.description ?? "").slice(0, 200),
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
  return text.slice(0, 6000);
}

// ---- LLM (OpenAI-compatible) ----------------------------------------------

type ToolCall = { id: string; function: { name: string; arguments: string } };
type Msg = Record<string, unknown>;

async function chat(messages: Msg[]) {
  const r = await fetch(`${LLM_BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_KEY}` },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      temperature: 0.3,
      max_tokens: 4096,
    }),
    signal: AbortSignal.timeout(55000),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`LLM ${r.status}: ${body.slice(0, 200)}`);
  }
  const data = (await r.json()) as {
    choices: Array<{ message: { content?: string; tool_calls?: ToolCall[] } }>;
  };
  return data.choices[0].message;
}

function toTeardown(input: Record<string, unknown>): Teardown {
  const facets = ((input.facets as Facet[]) ?? []).filter((f) => f && f.key);
  facets.forEach((f) => {
    f.claims = (f.claims ?? [])
      .filter((c) => c && c.text && c.source?.url)
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

        const messages: Msg[] = [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Tear down this product: ${clean}` },
        ];

        let teardown: Teardown | null = null;
        let nudges = 0;

        for (let turn = 0; turn < 10 && !teardown; turn++) {
          const msg = await chat(messages);
          const calls = msg.tool_calls ?? [];

          if (calls.length === 0) {
            if (nudges < 2) {
              nudges++;
              messages.push({ role: "assistant", content: msg.content ?? "" });
              messages.push({
                role: "user",
                content:
                  "Call emit_teardown now with everything you verified. Route anything you couldn't source into the unverified list.",
              });
              continue;
            }
            break;
          }

          // record the assistant turn (with its tool calls) before results
          messages.push({ role: "assistant", content: msg.content ?? "", tool_calls: calls });

          for (const call of calls) {
            const name = call.function.name;
            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(call.function.arguments || "{}");
            } catch {
              /* leave empty */
            }

            if (name === "emit_teardown") {
              teardown = toTeardown(args);
              messages.push({ role: "tool", tool_call_id: call.id, content: "ok" });
              break;
            } else if (name === "web_search") {
              send(controller, { type: "status", tool: "web_search", label: `Searching: ${String(args.query ?? "").slice(0, 60)}` });
              const out = await jinaSearch(String(args.query ?? clean));
              messages.push({ role: "tool", tool_call_id: call.id, content: out });
            } else if (name === "fetch_url") {
              const url = String(args.url ?? "");
              send(controller, { type: "status", tool: "fetch_url", label: `Reading ${url.replace(/^https?:\/\//, "").slice(0, 48)}…` });
              const out = await jinaFetch(url);
              messages.push({ role: "tool", tool_call_id: call.id, content: out });
            } else {
              messages.push({ role: "tool", tool_call_id: call.id, content: "unknown tool" });
            }
          }
        }

        if (!teardown) {
          send(controller, {
            type: "error",
            message: `Couldn't assemble a sourced teardown for “${clean}”. Try a more specific product name or URL.`,
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
