import type { StreamEvent, Teardown } from "./types";
import { trackAgent } from "./track";

const MODELS = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b"];

/** Consume the /api/teardown SSE stream and dispatch typed callbacks. */
export async function runTeardown(
  target: string,
  cb: {
    onStatus?: (label: string) => void;
    onToolCall?: (tool: "web_search" | "fetch_url", label: string) => void;
    onClaim?: (facet: import("./types").Facet, claim: import("./types").Claim) => void;
    onDone?: (t: Teardown) => void;
    onError?: (message: string) => void;
    signal?: AbortSignal;
  },
) {
  // Novus: a conversation turn begins.
  trackAgent("prompt", { target, surface: "teardown" });
  const tools = { web_search: 0, fetch_url: 0 };

  let res: Response;
  try {
    res = await fetch("/api/teardown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target }),
      signal: cb.signal,
    });
  } catch {
    trackAgent("agent_response", { target, status: "error", reason: "unreachable" });
    cb.onError?.("Couldn't reach the agent. Check your connection and retry.");
    return;
  }

  if (!res.ok || !res.body) {
    trackAgent("agent_response", { target, status: "error", reason: "unavailable" });
    cb.onError?.("The agent is unavailable right now. Please try again.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const dataLine = frame.split("\n").find((l) => l.startsWith("data: "));
      if (!dataLine) continue;
      let evt: StreamEvent;
      try {
        evt = JSON.parse(dataLine.slice(6));
      } catch {
        continue;
      }
      if (evt.type === "status") {
        if (evt.tool === "web_search" || evt.tool === "fetch_url") tools[evt.tool]++;
        cb.onToolCall?.(evt.tool, evt.label);
        cb.onStatus?.(evt.label);
      } else if (evt.type === "claim") {
        cb.onClaim?.({ key: evt.facet.key, label: evt.facet.label, exhibit: evt.facet.exhibit, claims: [] }, evt.claim);
      } else if (evt.type === "done") {
        const claims = evt.teardown.facets.reduce((n, f) => n + f.claims.length, 0);
        trackAgent("agent_response", {
          target,
          status: "completed",
          toolsUsed: tools,
          toolCalls: tools.web_search + tools.fetch_url,
          claims,
          unverified: evt.teardown.unverified.length,
          agentModelsUsed: MODELS,
        });
        cb.onDone?.(evt.teardown);
      } else if (evt.type === "error") {
        trackAgent("agent_response", { target, status: "unsupported", reason: evt.message });
        cb.onError?.(evt.message);
      }
    }
  }
}
