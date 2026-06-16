"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CursorSeal } from "./CursorSeal";
import { SourceChip } from "./SourceChip";
import { reveal, revealStagger, couldntVerify } from "@/lib/motion";
import type { Claim } from "@/lib/types";

const PROOF_CLAIMS: Claim[] = [
  {
    id: "h1",
    text: "Markets itself as the tool for modern software product development.",
    confidence: "high",
    source: { title: "Linear — homepage", url: "https://linear.app", quote: "The tool for modern product development." },
  },
  {
    id: "h2",
    text: "Free tier plus paid per-seat plans, billed monthly or annually.",
    confidence: "high",
    source: { title: "Linear — Pricing", url: "https://linear.app/pricing" },
  },
  {
    id: "h3",
    text: "Most-praised quality in reviews is raw interaction speed.",
    confidence: "medium",
    source: { title: "Linear reviews — G2", url: "https://www.g2.com/products/linear/reviews" },
  },
];

export function LiveProof() {
  const reduce = useReducedMotion();

  return (
    <div className="relative">
      {/* The dossier card — the product, proven */}
      <motion.div
        variants={reduce ? undefined : revealStagger}
        initial={reduce ? undefined : "hidden"}
        animate={reduce ? undefined : "show"}
        className="relative rounded-[16px] border border-border-strong bg-paper-2/80 backdrop-blur-sm shadow-[var(--shadow-lift)] overflow-hidden"
      >
        {/* header */}
        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-rule">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber/60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
          </span>
          <span className="t-micro text-ink-faint">RECEIPTS · LIVE</span>
          <span className="ml-auto t-micro rounded-full border border-border px-2.5 py-0.5 text-ink-muted">
            ↳ Linear
          </span>
        </div>

        {/* streaming claims */}
        <ul className="px-5 py-3">
          {PROOF_CLAIMS.map((c, i) => (
            <motion.li
              key={c.id}
              variants={reduce ? undefined : reveal}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-2.5 border-b border-rule last:border-0"
            >
              <span className="t-small text-ink leading-snug flex-1 min-w-[60%]">
                {c.confidence === "high" ? (
                  <span className="mark-amber is-marked">
                    <span>{c.text}</span>
                  </span>
                ) : (
                  c.text
                )}
              </span>
              <SourceChip source={c.source} confidence={c.confidence} index={i} />
            </motion.li>
          ))}
        </ul>

        {/* the honesty peek */}
        <motion.div
          variants={reduce ? undefined : couldntVerify}
          className="flex items-center gap-3 px-5 py-3 bg-paper-sunk border-t border-border"
        >
          <span aria-hidden className="h-3 w-7 shrink-0 rounded-[2px] bg-redact" />
          <span className="t-small text-ink-muted">
            <span className="t-micro text-ink-faint mr-1.5">COULDN&apos;T VERIFY</span>
            exact ARR — not disclosed publicly.
          </span>
        </motion.div>
      </motion.div>

      {/* the live object — wax seal pressed into the corner */}
      <div className="absolute -right-5 -top-9 w-24 sm:w-32 drop-shadow-[var(--shadow-lift)]">
        <CursorSeal />
      </div>
    </div>
  );
}
