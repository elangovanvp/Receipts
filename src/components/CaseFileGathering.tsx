"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export interface ToolEntry {
  tool: "web_search" | "fetch_url";
  label: string;
  id: number;
}

interface Props {
  target: string;
  label: string;
  toolLog: ToolEntry[];
}

type Phase = "searching" | "fetching" | "synthesizing";

function detectPhase(log: ToolEntry[], label: string): Phase {
  const lc = label.toLowerCase();
  if (lc.includes("synth") || lc.includes("writing") || lc.includes("analys")) return "synthesizing";
  if (log.some((e) => e.tool === "fetch_url")) return "fetching";
  return "searching";
}

const PHASE_ORDER: Phase[] = ["searching", "fetching", "synthesizing"];
const PHASE_LABEL: Record<Phase, string> = {
  searching: "SEARCHING",
  fetching: "FETCHING",
  synthesizing: "SYNTHESIZING",
};

export function CaseFileGathering({ target, label, toolLog }: Props) {
  const reduce = useReducedMotion();
  const phase = detectPhase(toolLog, label);
  const phaseIdx = PHASE_ORDER.indexOf(phase);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the log to latest entry
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [toolLog.length]);

  return (
    <div className="mx-auto max-w-[36rem]">
      {/* Header eyebrow */}
      <motion.p
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.18em",
          color: "var(--color-clay-deep)",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            height: 1,
            width: 20,
            background: "rgba(194,90,56,0.5)",
          }}
        />
        CASE FILE OPEN · {target}
      </motion.p>

      {/* Main card */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduce
            ? { duration: 0.3 }
            : { type: "spring", stiffness: 220, damping: 24, delay: 0.05 }
        }
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-hairline)",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 8px 28px rgba(28,26,22,0.08), 0 2px 6px rgba(28,26,22,0.05)",
        }}
      >
        {/* Status line */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--color-hairline)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Pulsing clay dot */}
          <span style={{ position: "relative", flexShrink: 0, width: 10, height: 10 }}>
            <motion.span
              animate={reduce ? {} : { scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "var(--color-clay)",
              }}
            />
            <span
              style={{
                position: "absolute",
                inset: "2px",
                borderRadius: "50%",
                background: "var(--color-clay)",
              }}
            />
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={label}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                color: "var(--color-ink)",
                lineHeight: 1.4,
              }}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Tool log */}
        <div
          style={{
            padding: "12px 0",
            maxHeight: "148px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {toolLog.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.12em",
                color: "var(--color-ink-faint)",
                textTransform: "uppercase",
                padding: "4px 20px",
              }}
            >
              ACTIVITY LOG
            </p>
          ) : (
            <AnimatePresence initial={false}>
              {toolLog.map((entry) => (
                <LogRow key={entry.id} entry={entry} reduce={!!reduce} />
              ))}
            </AnimatePresence>
          )}
          <div ref={logEndRef} />
        </div>

        {/* Phase indicator */}
        <div
          style={{
            padding: "14px 20px 16px",
            borderTop: "1px solid var(--color-hairline)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              position: "relative",
            }}
          >
            {PHASE_ORDER.map((p, i) => {
              const active = i === phaseIdx;
              const done = i < phaseIdx;
              return (
                <PhaseStep
                  key={p}
                  label={PHASE_LABEL[p]}
                  active={active}
                  done={done}
                  last={i === PHASE_ORDER.length - 1}
                  reduce={!!reduce}
                />
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{
          marginTop: "14px",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.14em",
          color: "var(--color-ink-faint)",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        READING REAL PAGES · ATTACHING A SOURCE TO EVERY CLAIM
      </motion.p>
    </div>
  );
}

function LogRow({ entry, reduce }: { entry: ToolEntry; reduce: boolean }) {
  const isSearch = entry.tool === "web_search";
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "10px",
        padding: "5px 20px",
      }}
    >
      {/* Tool badge */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: isSearch ? "var(--color-amber-ink)" : "var(--color-clay-deep)",
          flexShrink: 0,
          width: "68px",
        }}
      >
        {isSearch ? "WEB_SEARCH" : "FETCH"}
      </span>
      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--color-ink-muted)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
          letterSpacing: "0.01em",
        }}
      >
        {extractTarget(entry.label)}
      </span>
      {/* Done tick */}
      <span
        style={{
          color: "var(--color-clay)",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          flexShrink: 0,
        }}
      >
        ✓
      </span>
    </motion.div>
  );
}

function PhaseStep({
  label,
  active,
  done,
  last,
  reduce,
}: {
  label: string;
  active: boolean;
  done: boolean;
  last: boolean;
  reduce: boolean;
}) {
  return (
    <div
      style={{
        flex: last ? "0 0 auto" : 1,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Dot */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <motion.div
          animate={
            active && !reduce
              ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }
              : {}
          }
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: done
              ? "var(--color-clay)"
              : active
                ? "var(--color-clay)"
                : "var(--color-hairline)",
            border: active ? "2px solid var(--color-clay)" : "none",
            boxSizing: "border-box",
          }}
        />
        {/* Label below dot */}
        <span
          style={{
            position: "absolute",
            top: "14px",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--font-mono)",
            fontSize: "8.5px",
            letterSpacing: "0.1em",
            color: active
              ? "var(--color-clay-deep)"
              : done
                ? "var(--color-clay)"
                : "var(--color-ink-faint)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>
      {/* Connector line */}
      {!last && (
        <div style={{ flex: 1, height: 1, margin: "0 4px" }}>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: done ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            style={{
              height: "100%",
              background: "var(--color-clay)",
              transformOrigin: "left center",
            }}
          />
          <div
            style={{
              height: "100%",
              background: "var(--color-hairline)",
              marginTop: "-1px",
            }}
          />
        </div>
      )}
    </div>
  );
}

/** Extract the key target from a status label string, e.g. "Fetching linear.app/pricing" → "linear.app/pricing" */
function extractTarget(label: string): string {
  // Remove common prefixes
  return label
    .replace(/^(fetching|reading|searching for|searching|loading|analysing|analyzing|writing|synthesizing)\s*/i, "")
    .trim() || label;
}
