"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Teardown } from "@/lib/types";
import { Button, Magnetic } from "./primitives";
import { trackGoalShare, teardownToMarkdown } from "@/lib/track";

type Done = "link" | "md" | "share" | null;

export function ShareBar({
  teardown,
  permalink,
}: {
  teardown: Teardown;
  permalink?: string;
}) {
  const [done, setDone] = useState<Done>(null);
  const reduce = useReducedMotion();

  const claimCount = teardown.facets.reduce((n, f) => n + f.claims.length, 0);

  const shareUrl = () => {
    if (permalink) return permalink;
    if (typeof window === "undefined") return "";
    const u = `${window.location.origin}/t/${encodeURIComponent(teardown.target)}?c=${claimCount}&u=${teardown.unverified.length}`;
    return u;
  };

  const flash = (k: Done) => {
    setDone(k);
    setTimeout(() => setDone(null), 1900);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
    } catch {}
    trackGoalShare("copy_link", { target: teardown.target });
    flash("link");
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(teardownToMarkdown(teardown));
    } catch {}
    trackGoalShare("copy_markdown", { target: teardown.target });
    flash("md");
  };

  const nativeShare = async () => {
    const url = shareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Receipts — teardown: ${teardown.target}`,
          text: teardown.tagline ?? `A sourced teardown of ${teardown.target}.`,
          url,
        });
        trackGoalShare("web_share", { target: teardown.target });
        flash("share");
      } catch {
        /* user dismissed */
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Magnetic>
        <Button onClick={nativeShare} className="px-6">
          <span className="relative flex items-center gap-2">
            Share this teardown
            <AnimatePresence>
              {done === "share" && <Tick key="s" reduce={!!reduce} />}
            </AnimatePresence>
          </span>
        </Button>
      </Magnetic>
      <Button variant="ghost" onClick={copyLink}>
        <span className="flex items-center gap-1.5">
          {done === "link" ? "Link copied" : "Copy link"}
          <AnimatePresence>{done === "link" && <Tick key="l" reduce={!!reduce} />}</AnimatePresence>
        </span>
      </Button>
      <Button variant="ghost" onClick={copyMarkdown}>
        <span className="flex items-center gap-1.5">
          {done === "md" ? "Markdown copied" : "Export Markdown"}
          <AnimatePresence>{done === "md" && <Tick key="m" reduce={!!reduce} />}</AnimatePresence>
        </span>
      </Button>
    </div>
  );
}

/** A receipt stamp pressing down — the satisfying confirmation of the goal action. */
function Tick({ reduce }: { reduce: boolean }) {
  return (
    <motion.span
      aria-hidden
      initial={reduce ? { opacity: 0 } : { scale: 0, rotate: -25, opacity: 0 }}
      animate={reduce ? { opacity: 1 } : { scale: 1, rotate: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 600, damping: 16 }}
      className="inline-grid place-items-center h-4 w-4 rounded-full bg-amber/20"
    >
      <svg width="11" height="11" viewBox="0 0 12 12">
        <path d="M2.5 6.3l2.2 2.2L9.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-amber-ink" />
      </svg>
    </motion.span>
  );
}
