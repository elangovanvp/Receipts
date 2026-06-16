"use client";

import { useRef, useState } from "react";
import { Eyebrow } from "./primitives";
import { TeardownInput } from "./TeardownInput";
import { LiveProof } from "./LiveProof";
import { TeardownView } from "./TeardownView";
import { ShareBar } from "./ShareBar";
import { runTeardown } from "@/lib/run";
import type { Teardown } from "@/lib/types";

type Status = "idle" | "running" | "done" | "error";

export function Landing() {
  const [status, setStatus] = useState<Status>("idle");
  const [target, setTarget] = useState("");
  const [statusLabel, setStatusLabel] = useState("Gathering evidence…");
  const [teardown, setTeardown] = useState<Teardown | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToResults = () =>
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );

  const onRun = (t: string) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setTarget(t);
    setTeardown(null);
    setErrorMsg("");
    setStatusLabel("Finding the official site…");
    setStatus("running");
    scrollToResults();

    runTeardown(t, {
      signal: ac.signal,
      onStatus: (label) => setStatusLabel(label),
      onDone: (td) => {
        setTeardown(td);
        setStatus("done");
        scrollToResults();
      },
      onError: (message) => {
        setErrorMsg(message);
        setStatus("error");
        scrollToResults();
      },
    });
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
              No login · anything it can&apos;t source goes to{" "}
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
        {status === "running" && (
          <section className="border-t border-rule bg-paper-2/40">
            <div className="mx-auto w-full max-w-[46rem] px-6 py-20">
              <Gathering target={target} label={statusLabel} />
            </div>
          </section>
        )}

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

        {status === "error" && (
          <section className="border-t border-rule bg-paper-2/40">
            <div className="mx-auto w-full max-w-[44rem] px-6 py-20 text-center">
              <Eyebrow className="justify-center">No source, no claim</Eyebrow>
              <h2 className="t-h2 mt-4 text-ink">Couldn&apos;t back it up.</h2>
              <p className="t-body text-ink-muted mt-4 max-w-[48ch] mx-auto">
                {errorMsg}
              </p>
              <button
                onClick={() => onRun("Linear")}
                className="mt-6 t-small text-amber-ink underline underline-offset-2 hover:no-underline"
              >
                Try a sample teardown of Linear →
              </button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

/** Live "evidence engine" — surfaces the agent's real tool calls as it works. */
function Gathering({ target, label }: { target: string; label: string }) {
  return (
    <div className="mx-auto max-w-[34rem]">
      <Eyebrow>Gathering evidence · {target}</Eyebrow>
      <div className="mt-6 rounded-[14px] border border-border bg-paper p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber/60 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber" />
          </span>
          <span className="t-body text-ink">{label}</span>
        </div>
        <div className="mt-5 space-y-2.5">
          <Bar w="92%" />
          <Bar w="76%" />
          <Bar w="84%" />
        </div>
        <p className="t-micro text-ink-faint mt-5">
          READING REAL PAGES · ATTACHING A SOURCE TO EVERY CLAIM
        </p>
      </div>
    </div>
  );
}

function Bar({ w }: { w: string }) {
  return (
    <div className="h-2 rounded-full bg-paper-sunk overflow-hidden" style={{ width: w }}>
      <div className="h-full w-1/3 bg-border-strong/40 animate-pulse" />
    </div>
  );
}
