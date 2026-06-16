"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Unverified } from "@/lib/types";
import { couldntVerify, revealStagger } from "@/lib/motion";

export function CouldntVerify({ items }: { items: Unverified[] }) {
  const reduce = useReducedMotion();
  if (!items?.length) return null;

  return (
    <motion.section
      aria-labelledby="cv-heading"
      variants={revealStagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-[14px] border border-border-strong bg-paper-sunk overflow-hidden"
    >
      {/* Quiet header — reads as a classified-file stamp, not a flourish. */}
      <div className="flex items-center gap-3 px-5 py-3 bg-redact text-redact-label">
        <RedactionGlyph />
        <h3 id="cv-heading" className="t-chip text-paper/90">
          Couldn&apos;t verify
        </h3>
        <span className="t-micro text-redact-label ml-auto">
          {String(items.length).padStart(2, "0")} ITEMS · NOT ASSERTED
        </span>
      </div>

      <div className="px-5 py-4">
        <p className="t-small text-ink-muted mb-4 max-w-[52ch]">
          We went looking for these and couldn&apos;t back them with a real
          source. So we don&apos;t state them as fact — we show you the gap
          instead.
        </p>
        <ul className="space-y-3">
          {items.map((item, i) => (
            <motion.li
              key={i}
              variants={reduce ? undefined : couldntVerify}
              className="flex gap-3"
            >
              <span
                aria-hidden
                className="mt-1.5 h-3 w-8 shrink-0 rounded-[2px] bg-redact/90"
              />
              <div>
                <p className="t-body text-ink leading-snug">{item.text}</p>
                {item.reason && (
                  <p className="t-small text-ink-faint mt-0.5">{item.reason}</p>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}

function RedactionGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1" y="3" width="14" height="2.4" rx="1" fill="currentColor" />
      <rect x="1" y="7" width="9" height="2.4" rx="1" fill="currentColor" />
      <rect x="1" y="11" width="12" height="2.4" rx="1" fill="currentColor" />
    </svg>
  );
}
