import Anthropic from "@anthropic-ai/sdk";
import type { Teardown, Claim, StreamEvent } from "@/lib/types";
import { SAMPLES } from "@/lib/sample";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = "claude-opus-4-8";

const FACET_KEYS = [
  "positioning",
  "icp",
  "pricing",
  "recent",
  "strengths",
  "weaknesses",
] as const;

/** The agent's single job. Honesty is the architecture. */
const SYSTEM = `You are Receipts — a ruthless but fair competitive-intelligence analyst. Your entire reputation rests on ONE discipline:

  NO SOURCE, NO CLAIM.

You are given a product (a name or URL). Produce a sharp, specific teardown across six facets: positioning, who-it's-for (icp), pricing, what-shipped-recently (recent), where-it's-strong (strengths), where-it's-weak (weaknesses).

HARD RULES — non-negotiable:
1. Use the web_search and web_fetch tools to gather REAL evidence. Read the product's actual homepage, pricing page, changelog/release notes, and third-party reviews.
2. Every factual claim you assert MUST be backed by a page you actually fetched, with the real source URL and a short verbatim quote from that page.
3. If you cannot back a claim with a real fetched source, DO NOT assert it. Put it in the "unverified" list instead, with a one-line reason. It is far better to show a gap than to invent a fact. Never guess pricing, customer counts, funding, or dates.
4. Be specific and opinionated — no hype, no filler, no "Kabuki-theater certainty". One crisp sentence per claim.
5. confidence = "high" only when two or more independent sources agree OR it's stated on the company's own page; otherwise "medium".

When you have gathered enough evidence, finish by calling the emit_teardown tool exactly once with the structured result. Resolve a bare product name to its canonical site and say which one you chose in the tagline if ambiguous.`;

const EMIT_TOOL = {
  name: "emit_teardown",
  description:
    "Emit the final structured teardown. Call this exactly once, last, after gathering real sourced evidence.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      target: { type: "string" },
      canonicalUrl: { type: "string" },
      tagline: { type: "string", description: "One sharp sentence read of the product." },
      facets: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            key: { type: "string", enum: [...FACET_KEYS] },
            label: { type: "string" },
            exhibit: { type: "string", description: "A..F" },
            claims: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  text: { type: "string" },
                  confidence: { type: "string", enum: ["high", "medium"] },
                  source: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      title: { type: "string" },
                      url: { type: "string" },
                      quote: {
                        type: "string",
                        description: "Verbatim quote from the fetched page.",
                      },
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
          additionalProperties: false,
          properties: {
            text: { type: "string" },
            reason: { type: "string" },
          },
          required: ["text", "reason"],
        },
      },
    },
    required: ["target", "canonicalUrl", "tagline", "facets", "unverified"],
  },
} as unknown as Anthropic.Tool;

const TOOLS = [
  { type: "web_search_20260209", name: "web_search" },
  { type: "web_fetch_20260209", name: "web_fetch" },
  EMIT_TOOL,
] as unknown as Anthropic.ToolUnion[];

/** Shape the raw tool input into our Teardown (assign stable claim ids). */
function toTeardown(input: Record<string, unknown>): Teardown {
  const facets = (input.facets as Teardown["facets"]) ?? [];
  facets.forEach((f) => {
    f.claims = (f.claims ?? []).map(
      (c, i) => ({ ...c, id: `${f.key}-${i}` }) as Claim,
    );
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
  const send = (
    controller: ReadableStreamDefaultController,
    e: StreamEvent,
  ) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (!clean) {
          send(controller, { type: "error", message: "Name a product to tear down." });
          controller.close();
          return;
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;
        // Offline fallback: ships the real, source-backed Linear sample so the
        // product is demoable without a key. Any other target needs the agent.
        if (!apiKey) {
          const sample = SAMPLES[clean.toLowerCase()];
          if (sample) {
            send(controller, { type: "status", tool: "web_search", label: "Finding the official site…" });
            send(controller, { type: "status", tool: "fetch_url", label: "Reading pricing & changelog…" });
            send(controller, { type: "done", teardown: sample });
          } else {
            send(controller, {
              type: "error",
              message:
                "The live agent isn't connected here (no ANTHROPIC_API_KEY). Try “Linear” or “Notion” for a bundled sample, or deploy with a key.",
            });
          }
          controller.close();
          return;
        }

        const client = new Anthropic({ apiKey });
        const messages: Anthropic.MessageParam[] = [
          { role: "user", content: `Tear down this product: ${clean}` },
        ];

        let teardown: Teardown | null = null;
        let nudges = 0;

        for (let turn = 0; turn < 8 && !teardown; turn++) {
          const ms = client.messages.stream({
            model: MODEL,
            max_tokens: 16000,
            thinking: { type: "adaptive" },
            output_config: { effort: "medium" },
            system: SYSTEM,
            tools: TOOLS,
            messages,
          } as unknown as Anthropic.MessageStreamParams);

          ms.on("streamEvent", (event) => {
            if (event.type !== "content_block_start") return;
            const block = event.content_block as { type?: string; name?: string };
            if (block.type !== "server_tool_use") return;
            if (block.name === "web_search")
              send(controller, { type: "status", tool: "web_search", label: "Searching the web for sources…" });
            else if (block.name === "web_fetch")
              send(controller, { type: "status", tool: "fetch_url", label: "Reading a source page…" });
          });

          const msg = await ms.finalMessage();

          const emit = msg.content.find(
            (b): b is Anthropic.ToolUseBlock =>
              b.type === "tool_use" && b.name === "emit_teardown",
          );
          if (emit) {
            teardown = toTeardown(emit.input as Record<string, unknown>);
            break;
          }

          if ((msg.stop_reason as string) === "pause_turn") {
            messages.push({ role: "assistant", content: msg.content });
            continue;
          }

          // Finished without emitting — nudge it to produce the structured result.
          if (nudges < 2) {
            nudges++;
            messages.push({ role: "assistant", content: msg.content });
            messages.push({
              role: "user",
              content:
                "Now call emit_teardown exactly once with everything you verified. Route anything you could not source into the unverified list.",
            });
            continue;
          }
          break;
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
        const message =
          err instanceof Anthropic.APIError
            ? `Agent error (${err.status}): ${err.message}`
            : "The agent hit an unexpected error. Please try again.";
        send(controller, { type: "error", message });
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
