"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { CountUp } from "./primitives";

const CARD_SPRING = { stiffness: 150, damping: 18, mass: 0.5 };
const SEAL_SPRING = { stiffness: 240, damping: 18, mass: 0.3 };

interface DossierClaim {
  text: string;
  domain: string;
  high: boolean;
  rotate: number;
}

const CLAIMS: DossierClaim[] = [
  {
    text: "Markets itself as the purpose-built tool for modern software product development.",
    domain: "linear.app",
    high: true,
    rotate: -2.5,
  },
  {
    text: "Free tier plus paid per-seat plans billed monthly or annually.",
    domain: "linear.app/pricing",
    high: true,
    rotate: 1.5,
  },
];

export function LiveProof() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Card tilt springs
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, CARD_SPRING);
  const sry = useSpring(ry, CARD_SPRING);

  // Wax seal independent cursor nudge
  const sealX = useMotionValue(0);
  const sealY = useMotionValue(0);
  const ssealX = useSpring(sealX, SEAL_SPRING);
  const ssealY = useSpring(sealY, SEAL_SPRING);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 10);
    rx.set(-py * 10);
    sealX.set(px * 16);
    sealY.set(py * 16);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    sealX.set(0);
    sealY.set(0);
  };

  return (
    <div
      className="relative select-none"
      style={{ perspective: "1100px" }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden="true"
    >
      {/* 3D space — rotates as one unit */}
      <motion.div
        ref={wrapRef}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduce
            ? { duration: 0.3 }
            : { type: "spring", stiffness: 220, damping: 24, delay: 0.2 }
        }
        style={{
          rotateX: reduce ? 0 : srx,
          rotateY: reduce ? 0 : sry,
          transformStyle: "preserve-3d",
          paddingTop: "26px",
          position: "relative",
        }}
      >
        {/* ── Folder tab (floats above card at z=14) ── */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduce
              ? { duration: 0.2 }
              : { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.35 }
          }
          style={{
            position: "absolute",
            top: 0,
            left: "18px",
            transform: "translateZ(14px)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 13px 6px",
            background: "var(--color-card)",
            border: "1px solid var(--color-hairline)",
            borderBottom: "1px solid var(--color-card)",
            borderRadius: "5px 5px 0 0",
            zIndex: 10,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "rgba(194,90,56,0.55)",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.16em",
              color: "var(--color-clay-deep)",
              textTransform: "uppercase",
            }}
          >
            CASE FILE · TEARDOWN
          </span>
        </motion.div>

        {/* ── Card body ── */}
        <div
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-hairline)",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow:
              "0 20px 56px rgba(28,26,22,0.11), 0 4px 12px rgba(28,26,22,0.07)",
          }}
        >
          {/* Header: product name + stats */}
          <div
            style={{
              padding: "20px 22px 16px",
              borderBottom: "1px solid var(--color-hairline)",
              transform: "translateZ(4px)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9.5px",
                letterSpacing: "0.18em",
                color: "var(--color-clay-deep)",
                textTransform: "uppercase",
                marginBottom: "7px",
              }}
            >
              EXHIBIT A · COMPETITIVE FILE
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "24px",
                fontWeight: 500,
                color: "var(--color-ink)",
                letterSpacing: "-0.018em",
                lineHeight: 1,
              }}
            >
              Linear
            </p>
            <p
              style={{
                marginTop: "9px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.13em",
                color: "var(--color-ink-faint)",
                textTransform: "uppercase",
              }}
            >
              <CountUp value={9} /> CLAIMS ·{" "}
              <CountUp value={3} /> UNVERIFIED
            </p>
          </div>

          {/* Exhibit rows */}
          <div style={{ transform: "translateZ(6px)" }}>
            {CLAIMS.map((claim, i) => (
              <ExhibitRow
                key={i}
                claim={claim}
                index={i}
                last={i === CLAIMS.length - 1}
                reduce={!!reduce}
              />
            ))}
          </div>

          {/* Redaction row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "11px 22px",
              borderTop: "1px solid var(--color-hairline)",
              background: "rgba(26,25,22,0.025)",
              transform: "translateZ(2px)",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 38,
                height: 9,
                borderRadius: 2,
                background: "var(--color-redact)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9.5px",
                letterSpacing: "0.1em",
                color: "var(--color-ink-faint)",
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              COULDN&apos;T VERIFY
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                color: "var(--color-ink-faint)",
              }}
            >
              exact ARR — not disclosed.
            </span>
          </motion.div>
        </div>

        {/* ── Wax seal — top-right corner, highest Z, cursor-nudged ── */}
        <motion.div
          initial={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.5, rotate: -22 }
          }
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={
            reduce
              ? { duration: 0.2 }
              : { type: "spring", stiffness: 280, damping: 20, delay: 0.7 }
          }
          style={{
            position: "absolute",
            top: "-8px",
            right: "-18px",
            x: ssealX,
            y: ssealY,
            z: 28,
          }}
        >
          <DossierSeal />
        </motion.div>
      </motion.div>
    </div>
  );
}

function ExhibitRow({
  claim,
  index,
  last,
  reduce,
}: {
  claim: DossierClaim;
  index: number;
  last: boolean;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduce
          ? { duration: 0.2 }
          : { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.52 + index * 0.13 }
      }
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "11px 22px",
        borderBottom: last ? "none" : "1px solid var(--color-hairline)",
      }}
    >
      <span
        style={{
          flex: 1,
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          lineHeight: 1.52,
          color: "var(--color-ink)",
        }}
      >
        {claim.text}
      </span>
      {/* Stamp chip — slightly rotated, springs in */}
      <motion.span
        initial={
          reduce
            ? { opacity: 0 }
            : { opacity: 0, scale: 1.35, rotate: claim.rotate - 5 }
        }
        animate={{ opacity: 1, scale: 1, rotate: claim.rotate }}
        transition={
          reduce
            ? { duration: 0.2 }
            : {
                type: "spring",
                stiffness: 380,
                damping: 18,
                delay: 0.68 + index * 0.13,
              }
        }
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "3px 8px",
          border: "1px solid rgba(194,90,56,0.45)",
          borderRadius: "3px",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.07em",
          color: "var(--color-clay-deep)",
          background: "rgba(194,90,56,0.07)",
          whiteSpace: "nowrap",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: claim.high
              ? "var(--color-clay)"
              : "var(--color-ink-faint)",
            flexShrink: 0,
          }}
        />
        {claim.domain}
      </motion.span>
    </motion.div>
  );
}

function DossierSeal() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      aria-hidden
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="ds-wax" cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#DC6B50" />
          <stop offset="50%" stopColor="#C25A38" />
          <stop offset="100%" stopColor="#A8472A" />
        </radialGradient>
        <filter id="ds-shadow">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="5"
            floodColor="rgba(28,20,16,0.35)"
          />
        </filter>
      </defs>
      <g filter="url(#ds-shadow)">
        <circle cx="28" cy="28" r="26" fill="url(#ds-wax)" />
        <circle
          cx="28"
          cy="28"
          r="26"
          fill="none"
          stroke="#7A3020"
          strokeOpacity="0.4"
          strokeWidth="1.2"
        />
        <circle
          cx="28"
          cy="28"
          r="20"
          fill="none"
          stroke="rgba(255,230,215,0.28)"
          strokeWidth="0.8"
        />
        <path
          d="M19 28L24.5 34L37 22"
          fill="none"
          stroke="rgba(255,238,225,0.92)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
