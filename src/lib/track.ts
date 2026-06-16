import type { Teardown } from "./types";

type PendoLike = {
  track?: (event: string, meta?: Record<string, unknown>) => void;
  trackAgent?: (
    eventType: string,
    properties?: Record<string, unknown>,
    eventProperties?: Record<string, unknown>,
  ) => void;
};

declare global {
  interface Window {
    pendo?: PendoLike;
  }
}

/**
 * The single conversion the hackathon (and Novus) cares about:
 * the user shared or exported a teardown. Safe no-op until Novus is installed.
 */
export function trackGoalShare(action: string, meta: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    window.pendo?.track?.("teardown_shared_or_exported", { action, ...meta });
  } catch {
    /* analytics must never break the product */
  }
}

/** Render a teardown to clean, source-carrying Markdown for export/paste. */
export function teardownToMarkdown(t: Teardown): string {
  const lines: string[] = [];
  lines.push(`# Receipts — teardown: ${t.target}`);
  if (t.tagline) lines.push(`\n_${t.tagline}_`);
  if (t.canonicalUrl) lines.push(`\nSource of record: ${t.canonicalUrl}`);
  for (const f of t.facets) {
    lines.push(`\n## ${f.exhibit}. ${f.label}`);
    for (const c of f.claims) {
      const conf = c.confidence === "high" ? "corroborated" : "single source";
      lines.push(`- ${c.text}  \n  ↳ [${c.source.title}](${c.source.url}) (${conf})`);
    }
  }
  if (t.unverified.length) {
    lines.push(`\n## Couldn't verify (not asserted)`);
    for (const u of t.unverified) {
      lines.push(`- ${u.text}${u.reason ? `  \n  ↳ ${u.reason}` : ""}`);
    }
  }
  lines.push(`\n---\nGenerated with Receipts — no source, no claim.`);
  return lines.join("\n");
}
