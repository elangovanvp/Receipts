"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { Claim } from "@/lib/types";
import { reveal } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { SourceChip } from "./SourceChip";

export function ClaimLine({ claim, index }: { claim: Claim; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [marked, setMarked] = useState(false);
  const [wordsVisible, setWordsVisible] = useState(reduce ? true : false);
  const isHigh = claim.confidence === "high";

  // Highlighter swipe lands ~120ms after the line settles (corroborated claims only).
  useEffect(() => {
    if (!isHigh) return;
    if (reduce) { setMarked(true); return; }
    if (inView) {
      const t = setTimeout(() => setMarked(true), 120);
      return () => clearTimeout(t);
    }
  }, [inView, isHigh, reduce]);

  // Word-by-word reveal: trigger on first scroll-into-view.
  useEffect(() => {
    if (reduce) { setWordsVisible(true); return; }
    if (inView) {
      const t = setTimeout(() => setWordsVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [inView, reduce]);

  const words = claim.text.split(" ");

  return (
    <motion.li
      ref={ref}
      variants={reveal}
      className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5 py-3 border-b border-rule last:border-0"
    >
      <span className="t-body text-ink leading-relaxed">
        {isHigh ? (
          <span className={cn("mark-amber", marked && "is-marked")}>
            <span>
              {wordsVisible
                ? words.map((word, i) => (
                    <motion.span
                      key={i}
                      initial={reduce ? false : { opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: i * 0.025, ease: [0.16, 1, 0.3, 1] }}
                      style={{ display: "inline" }}
                    >
                      {word}
                      {i < words.length - 1 ? " " : ""}
                    </motion.span>
                  ))
                : claim.text}
            </span>
          </span>
        ) : (
          wordsVisible
            ? words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.025, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: "inline" }}
                >
                  {word}
                  {i < words.length - 1 ? " " : ""}
                </motion.span>
              ))
            : claim.text
        )}
      </span>
      <span className="shrink-0">
        <SourceChip source={claim.source} confidence={claim.confidence} index={index} />
      </span>
    </motion.li>
  );
}
