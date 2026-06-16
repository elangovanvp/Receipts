"use client";

import { useState } from "react";
import type { Teardown } from "@/lib/types";
import { Button } from "./primitives";
import { trackGoalShare, teardownToMarkdown } from "@/lib/track";

type Done = "link" | "md" | null;

export function ShareBar({
  teardown,
  permalink,
}: {
  teardown: Teardown;
  permalink?: string;
}) {
  const [done, setDone] = useState<Done>(null);

  const flash = (k: Done) => {
    setDone(k);
    setTimeout(() => setDone(null), 1800);
  };

  const copyLink = async () => {
    const url =
      permalink ??
      (typeof window !== "undefined" ? window.location.href : "");
    try {
      await navigator.clipboard.writeText(url);
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
    const url =
      permalink ??
      (typeof window !== "undefined" ? window.location.href : "");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Receipts — teardown: ${teardown.target}`,
          text: teardown.tagline ?? `A sourced teardown of ${teardown.target}.`,
          url,
        });
        trackGoalShare("web_share", { target: teardown.target });
      } catch {
        /* user dismissed */
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button onClick={nativeShare} className="px-6">
        Share this teardown
      </Button>
      <Button variant="ghost" onClick={copyLink}>
        {done === "link" ? "Link copied ✓" : "Copy link"}
      </Button>
      <Button variant="ghost" onClick={copyMarkdown}>
        {done === "md" ? "Markdown copied ✓" : "Export Markdown"}
      </Button>
    </div>
  );
}
