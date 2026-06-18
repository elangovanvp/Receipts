"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Eyebrow } from "./primitives";
import { TeardownInput } from "./TeardownInput";
import { LiveProof } from "./LiveProof";
import { TeardownView } from "./TeardownView";
import { ShareBar } from "./ShareBar";
import { runTeardown } from "@/lib/run";
import type { Teardown } from "@/lib/types";

type Status = "idle" | "running" | "done" | "error";

// Each word in the headline staggered separately; "receipts." is special-cased below.
const WORDS = ["Competitive", "teardowns", "that", "show", "their"];

export function Landing({ initialTarget }: { initialTarget?: string } = {}) {
  const [status, setStatus] = useState<Status>("idle");
  const [target, setTarget] = useState("");
  const [statusLabel, setStatusLabel] = useState("Gathering evidence…");
  const [teardown, setTeardown] = useState<Teardown | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reduce = useReducedMotion();

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

  // Share permalinks (/t/<target>) auto-run the teardown for cold visitors.
  const ranRef = useRef(false);
  useEffect(() => {
    if (initialTarget && !ranRef.current) {
      ranRef.current = true;
      onRun(initialTarget);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTarget]);

  return (
    <>
      {/* ════════════ NAV ════════════ */}
      <header
        style={{
          maxWidth: "73.75rem",
          margin: "0 auto",
          width: "100%",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand: wax seal glyph + Fraunces wordmark */}
        <a
          href="/"
          style={{ display: "inline-flex", alignItems: "center", gap: "9px", textDecoration: "none" }}
        >
          <NavSeal />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "15px",
              fontWeight: 500,
              letterSpacing: "-0.012em",
              color: "var(--color-ink)",
            }}
          >
            Receipts
          </span>
        </a>

        {/* Right: ghost link + outline CTA */}
        <nav style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a
            href="#how"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-ink-faint)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--color-ink)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--color-ink-faint)")}
          >
            HOW IT WORKS
          </a>
          <button
            type="button"
            onClick={() => onRun("Linear")}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-ink)",
              background: "transparent",
              border: "1px solid var(--color-border-strong)",
              borderRadius: "7px",
              padding: "0 14px",
              height: "32px",
              cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--color-clay)";
              el.style.color = "var(--color-clay-deep)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--color-border-strong)";
              el.style.color = "var(--color-ink)";
            }}
          >
            See it live →
          </button>
        </nav>
      </header>

      {/* ════════════ HERO — full first viewport ════════════ */}
      <section
        style={{
          maxWidth: "73.75rem",
          margin: "0 auto",
          width: "100%",
          padding: "0 24px 48px",
          minHeight: "calc(100dvh - 72px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Two-column grid: 1.06fr / 0.94fr, gap 52px */}
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1.06fr 0.94fr",
            gap: "52px",
            alignItems: "center",
          }}
        >
          {/* ────── LEFT COLUMN ────── */}
          <div>
            {/* Eyebrow */}
            <motion.p
              className="t-eyebrow-hero"
              style={{
                color: "var(--color-clay-deep)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0.2 }
                  : { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.06 }
              }
            >
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  height: 1,
                  width: 28,
                  background: "rgba(194,90,56,0.5)",
                  flexShrink: 0,
                }}
              />
              CASE FILE // COMPETITIVE INTELLIGENCE
            </motion.p>

            {/* ── HEADLINE — word stagger up ── */}
            <h1
              className="t-hero"
              style={{
                color: "var(--color-ink)",
                marginTop: "20px",
                display: "flex",
                flexWrap: "wrap",
                rowGap: "0.04em",
                columnGap: "0.28em",
              }}
            >
              {WORDS.map((word, i) => (
                <WordReveal
                  key={word}
                  word={word}
                  delay={0.12 + i * 0.055}
                  reduce={!!reduce}
                />
              ))}

              {/* "receipts." — clay color + amber highlighter swipes on after word settles */}
              <span style={{ display: "inline-block", overflow: "hidden" }}>
                <motion.span
                  style={{ display: "inline-block" }}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: "105%" }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduce
                      ? { duration: 0.2 }
                      : {
                          type: "spring",
                          stiffness: 260,
                          damping: 24,
                          delay: 0.12 + WORDS.length * 0.055,
                        }
                  }
                >
                  <span style={{ position: "relative", display: "inline-block" }}>
                    {/* Amber highlighter — draws left-to-right ~0.84s after mount */}
                    <motion.span
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: "-3px -6px",
                        borderRadius: "3px",
                        background: "var(--amber-hi-hero)",
                        zIndex: 0,
                        transformOrigin: "left center",
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { duration: 0.6, ease: [0.25, 1, 0.5, 1], delay: 0.84 }
                      }
                    />
                    <span
                      style={{
                        position: "relative",
                        zIndex: 1,
                        color: "var(--color-clay-deep)",
                      }}
                    >
                      receipts.
                    </span>
                  </span>
                </motion.span>
              </span>
            </h1>

            {/* Subhead */}
            <motion.p
              className="t-subhead-hero font-inter"
              style={{ color: "var(--color-ink-secondary)", marginTop: "24px", maxWidth: "46ch" }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0.2 }
                  : { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.38 }
              }
            >
              Paste any product. In under a minute, one agent reads its real
              homepage, pricing, and changelog — and writes a sharp teardown
              where{" "}
              <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>
                every claim links to its source.
              </span>
            </motion.p>

            {/* Intake field */}
            <motion.div
              style={{ marginTop: "36px", maxWidth: "34rem" }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0.2 }
                  : { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.48 }
              }
            >
              <TeardownInput onRun={onRun} busy={status === "running"} />
            </motion.div>

            {/* Trust statement */}
            <motion.p
              style={{
                marginTop: "20px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.08em",
                color: "var(--color-ink-faint)",
              }}
              initial={reduce ? { opacity: 0 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.72 }}
            >
              No login · no account · anything it can&apos;t source goes to{" "}
              <span style={{ color: "var(--color-ink-secondary)" }}>
                &ldquo;Couldn&apos;t verify.&rdquo;
              </span>
            </motion.p>
          </div>

          {/* ────── RIGHT COLUMN — dossier card ────── */}
          <div style={{ paddingLeft: "8px" }}>
            <LiveProof />
          </div>
        </div>
      </section>

      {/* ════════════ RESULTS (unchanged) ════════════ */}
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

/** Single word with clip-reveal: outer overflow:hidden clips the spring slide-up */
function WordReveal({
  word,
  delay,
  reduce,
}: {
  word: string;
  delay: number;
  reduce: boolean;
}) {
  return (
    <span style={{ display: "inline-block", overflow: "hidden" }}>
      <motion.span
        style={{ display: "inline-block" }}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: "105%" }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduce
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 260, damping: 24, delay }
        }
      >
        {word}
      </motion.span>
    </span>
  );
}

/** 20px inline wax seal for the nav brand */
function NavSeal() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      aria-hidden
      style={{ flexShrink: 0, display: "block" }}
    >
      <defs>
        <radialGradient id="nav-wax" cx="36%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#D96E50" />
          <stop offset="55%" stopColor="#C25A38" />
          <stop offset="100%" stopColor="#A8472A" />
        </radialGradient>
      </defs>
      <circle cx="10" cy="10" r="9.5" fill="url(#nav-wax)" />
      <circle cx="10" cy="10" r="9.5" fill="none" stroke="#7A3020" strokeOpacity="0.35" strokeWidth="0.9" />
      <path
        d="M5.5 10L7.8 12.5L14 7"
        fill="none"
        stroke="rgba(255,238,225,0.92)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Live evidence engine shown while the agent runs */
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
