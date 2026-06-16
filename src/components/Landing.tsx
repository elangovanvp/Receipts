"use client";

import { useRef, useState } from "react";
import { Eyebrow } from "./primitives";
import { TeardownInput } from "./TeardownInput";
import { LiveProof } from "./LiveProof";
import { TeardownView } from "./TeardownView";
import { ShareBar } from "./ShareBar";
import { SAMPLE_LINEAR } from "@/lib/sample";
import type { Teardown } from "@/lib/types";

type Status = "idle" | "running" | "done" | "preview";

export function Landing() {
  const [status, setStatus] = useState<Status>("idle");
  const [target, setTarget] = useState("");
  const [teardown, setTeardown] = useState<Teardown | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const onRun = (t: string) => {
    setTarget(t);
    setStatus("running");
    // NOTE: live agent API wired in the next build step. The preview ships the
    // real, source-backed Linear teardown; other targets show an honest state.
    window.setTimeout(() => {
      if (t.trim().toLowerCase() === "linear") {
        setTeardown(SAMPLE_LINEAR);
        setStatus("done");
      } else {
        setTeardown(null);
        setStatus("preview");
      }
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 650);
  };

  return (
    <>
      {/* ---- Nav ---- */}
      <header className="mx-auto w-full max-w-[72rem] px-6 py-6 flex items-center justify-between">
        <span className="t-chip text-ink flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber" />
          RECEIPTS
        </span>
        <a href="#how" className="t-micro text-ink-faint hover:text-ink transition-colors">
          HOW IT WORKS
        </a>
      </header>

      {/* ---- Hero ---- */}
      <section className="mx-auto w-full max-w-[72rem] px-6 pt-10 pb-20 sm:pt-16 sm:pb-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div>
            <Eyebrow>Evidence-first competitive intel</Eyebrow>
            <h1 className="t-display mt-5 text-ink text-balance">
              Competitive teardowns that{" "}
              <span className="italic text-amber-ink">show their receipts.</span>
            </h1>
            <p className="t-body-lg text-ink-muted mt-6 max-w-[46ch]">
              Paste any product. In under a minute, one agent reads its real
              homepage, pricing, and changelog — and writes a sharp teardown
              where <span className="text-ink">every claim links to its source.</span>{" "}
              No hallucinated fairy tales.
            </p>

            <div className="mt-9 max-w-[34rem]">
              <TeardownInput onRun={onRun} busy={status === "running"} />
            </div>

            <p className="t-small text-ink-faint mt-5">
              No login · ~40 seconds · anything it can&apos;t source goes to{" "}
              <span className="text-ink-muted">“Couldn&apos;t verify.”</span>
            </p>
          </div>

          <div className="lg:pl-6">
            <LiveProof />
          </div>
        </div>
      </section>

      {/* ---- Results ---- */}
      <div ref={resultsRef} className="scroll-mt-8">
        {status === "done" && teardown && (
          <section className="border-t border-rule bg-paper-2/40">
            <div className="mx-auto w-full max-w-[46rem] px-6 py-16 sm:py-24">
              <TeardownView
                teardown={teardown}
                showShare={<ShareBar teardown={teardown} />}
              />
            </div>
          </section>
        )}

        {status === "preview" && (
          <section className="border-t border-rule bg-paper-2/40">
            <div className="mx-auto w-full max-w-[46rem] px-6 py-20 text-center">
              <Eyebrow className="justify-center">Design preview</Eyebrow>
              <h2 className="t-h2 mt-4 text-ink">
                The live agent comes online with the deployed build.
              </h2>
              <p className="t-body text-ink-muted mt-4 max-w-[48ch] mx-auto">
                You searched{" "}
                <span className="text-ink font-medium">“{target}”</span>. In this
                preview the source-fetching agent isn&apos;t wired yet — run{" "}
                <button
                  onClick={() => onRun("Linear")}
                  className="text-amber-ink underline underline-offset-2 hover:no-underline"
                >
                  Linear
                </button>{" "}
                to see a full, real, source-backed teardown.
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
