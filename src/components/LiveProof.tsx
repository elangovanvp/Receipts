"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
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

const SPRING = { stiffness: 150, damping: 17, mass: 0.4 };

export function LiveProof() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Cursor-driven 3D tilt — the card orients toward the pointer, springs back
  // to flat on leave (no perpetual loop; render-stable at rest).
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, SPRING);
  const sry = useSpring(ry, SPRING);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 9);
    rx.set(-py * 9);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div
      className="relative"
      style={{ perspective: 1100 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {/* The dossier card — the product, proven, with a receipt on every line */}
      <motion.div
        ref={ref}
        variants={reduce ? undefined : revealStagger}
        initial={reduce ? undefined : "hidden"}
        animate={reduce ? undefined : "show"}
        style={{ rotateX: reduce ? 0 : srx, rotateY: reduce ? 0 : sry, transformStyle: "preserve-3d" }}
        className="relative rounded-[16px] border border-border-strong bg-paper-2 shadow-[var(--shadow-lift)] overflow-hidden will-change-transform"
      >
        {/* header */}
        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-rule">
          <span className="relative grid place-items-center h-2.5 w-2.5">
            <span className="absolute h-2.5 w-2.5 rounded-full bg-amber/25" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-amber" />
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

      {/* the live object — wax seal pressed into the corner, reacting to the cursor */}
      <div className="absolute -right-6 -top-10 w-28 sm:w-36 drop-shadow-[var(--shadow-lift)]">
        <CursorSeal cards={false} />
      </div>
    </div>
  );
}
