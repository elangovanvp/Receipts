"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { motion, useReducedMotion } from "framer-motion";
import type { Source, Confidence } from "@/lib/types";
import { domainOf, cn } from "@/lib/utils";
import { stampIn } from "@/lib/motion";

export function SourceChip({
  source,
  confidence,
  index,
}: {
  source: Source;
  confidence: Confidence;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const domain = domainOf(source.url);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <motion.button
          type="button"
          aria-label={`Source: ${source.title} (${domain})`}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          variants={reduce ? undefined : stampIn}
          className={cn(
            "group/chip relative inline-flex items-center gap-1.5 align-middle",
            "rounded-[var(--radius-stamp)] border px-1.5 py-0.5 t-micro",
            "border-border-strong/70 text-ink-muted bg-paper-2/70",
            "hover:border-amber hover:text-amber-ink transition-colors duration-150",
            "cursor-pointer",
          )}
        >
          <Stamp confidence={confidence} />
          <span className="normal-case tracking-normal font-mono text-[11px]">
            {domain}
          </span>
        </motion.button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 w-[min(20rem,90vw)] outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="rounded-[10px] border border-border-strong bg-paper shadow-[var(--shadow-lift)] overflow-hidden">
            <div className="px-4 pt-3 pb-2.5">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="t-micro text-ink-faint">
                  EXHIBIT · SOURCE {String(index + 1).padStart(2, "0")}
                </span>
                <ConfidenceTag confidence={confidence} />
              </div>
              <p className="t-small font-medium text-ink leading-snug">
                {source.title}
              </p>
              {source.quote && (
                <p className="mt-2 t-small text-ink-muted italic border-l-2 border-amber/60 pl-3">
                  “{source.quote}”
                </p>
              )}
            </div>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 px-4 py-2.5 bg-paper-2 border-t border-rule hover:bg-paper-sunk transition-colors group/link"
            >
              <span className="font-mono text-[11px] text-ink-muted truncate">
                {domain}
              </span>
              <span className="t-micro text-amber-ink flex items-center gap-1">
                VIEW SOURCE
                <span className="transition-transform duration-150 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">
                  ↗
                </span>
              </span>
            </a>
          </div>
          <Popover.Arrow className="fill-[var(--color-border-strong)]" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Tiny rubber-stamp glyph: filled amber ring (high) / hollow (medium). */
function Stamp({ confidence }: { confidence: Confidence }) {
  const high = confidence === "high";
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
      <circle
        cx="6"
        cy="6"
        r="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        className={high ? "text-amber" : "text-ink-faint"}
      />
      {high && (
        <path
          d="M3.6 6.2l1.6 1.6L8.6 4.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber"
        />
      )}
    </svg>
  );
}

function ConfidenceTag({ confidence }: { confidence: Confidence }) {
  return (
    <span
      className={cn(
        "t-micro px-1.5 py-0.5 rounded-[3px] border leading-none",
        confidence === "high"
          ? "text-verified border-verified/40"
          : "text-ink-faint border-border",
      )}
    >
      {confidence === "high" ? "CORROBORATED" : "SINGLE SOURCE"}
    </span>
  );
}
