import type { StreamEvent, Teardown } from "./types";

/** Consume the /api/teardown SSE stream and dispatch typed callbacks. */
export async function runTeardown(
  target: string,
  cb: {
    onStatus?: (label: string) => void;
    onDone?: (t: Teardown) => void;
    onError?: (message: string) => void;
    signal?: AbortSignal;
  },
) {
  let res: Response;
  try {
    res = await fetch("/api/teardown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target }),
      signal: cb.signal,
    });
  } catch {
    cb.onError?.("Couldn't reach the agent. Check your connection and retry.");
    return;
  }

  if (!res.ok || !res.body) {
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
      if (evt.type === "status") cb.onStatus?.(evt.label);
      else if (evt.type === "done") cb.onDone?.(evt.teardown);
      else if (evt.type === "error") cb.onError?.(evt.message);
    }
  }
}
