"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { EXAMPLE_TARGETS } from "@/lib/sample";

const BTN_SPRING = { stiffness: 220, damping: 15, mass: 0.3 };

export function TeardownInput({
  onRun,
  busy,
  autoFocus,
}: {
  onRun: (target: string) => void;
  busy?: boolean;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const reduce = useReducedMotion();
  const btnRef = useRef<HTMLButtonElement>(null);

  // Magnetic button
  const bx = useMotionValue(0);
  const by = useMotionValue(0);
  const sbx = useSpring(bx, BTN_SPRING);
  const sby = useSpring(by, BTN_SPRING);

  const onBtnMove = (e: React.PointerEvent) => {
    if (reduce || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    bx.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    by.set((e.clientY - (r.top + r.height / 2)) * 0.28);
  };
  const onBtnLeave = () => {
    bx.set(0);
    by.set(0);
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = value.trim();
    if (t && !busy) onRun(t);
  };

  return (
    <div className="w-full">
      <form onSubmit={submit}>
        {/* Raised card container — lifts and draws clay ring on focus */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderRadius: "11px",
            overflow: "hidden",
            background: "var(--color-card)",
            border: focused
              ? "1px solid var(--color-clay)"
              : "1px solid var(--color-hairline)",
            boxShadow: focused
              ? "0 6px 22px rgba(194,90,56,0.14), 0 0 0 3px rgba(194,90,56,0.12)"
              : "0 2px 10px rgba(28,26,22,0.07), 0 1px 3px rgba(28,26,22,0.04)",
            transition: "box-shadow 0.2s ease, border-color 0.2s ease",
          }}
        >
          {/* Input */}
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Paste a product name or URL..."
            aria-label="Product name or URL to tear down"
            disabled={busy}
            style={{
              flex: 1,
              height: "52px",
              padding: "0 20px",
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              letterSpacing: "0.01em",
              color: "var(--color-ink)",
            }}
            className="placeholder:text-ink-faint disabled:opacity-60"
          />

          {/* Magnetic clay CTA */}
          <div style={{ padding: "0 6px 0 0", flexShrink: 0 }}>
            <motion.button
              ref={btnRef}
              type="submit"
              disabled={busy}
              onPointerMove={onBtnMove}
              onPointerLeave={onBtnLeave}
              style={{
                x: reduce ? 0 : sbx,
                y: reduce ? 0 : sby,
                height: "40px",
                padding: "0 18px",
                borderRadius: "7px",
                border: "none",
                background: busy ? "var(--color-clay-deep)" : "var(--color-clay)",
                color: "#FFFBF7",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.01em",
                cursor: busy ? "default" : "pointer",
                whiteSpace: "nowrap",
              }}
              whileTap={busy ? {} : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="disabled:opacity-70"
            >
              {busy ? "Gathering evidence…" : "Run the teardown"}
            </motion.button>
          </div>
        </div>
      </form>

      {/* File-tag chips — folder-tab style */}
      <div
        style={{
          marginTop: "14px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.18em",
            color: "var(--color-ink-faint)",
            textTransform: "uppercase",
          }}
        >
          OR TRY:
        </span>
        {EXAMPLE_TARGETS.map((t) => (
          <FileTag key={t} label={t} onRun={onRun} busy={!!busy} />
        ))}
      </div>
    </div>
  );
}

function FileTag({
  label,
  onRun,
  busy,
}: {
  label: string;
  onRun: (t: string) => void;
  busy: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onRun(label)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 10px 4px 7px",
        border: hover
          ? "1px solid rgba(194,90,56,0.5)"
          : "1px solid var(--color-hairline)",
        borderRadius: "4px",
        background: hover ? "rgba(194,90,56,0.05)" : "var(--color-card)",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.06em",
        color: hover ? "var(--color-clay-deep)" : "var(--color-ink-muted)",
        cursor: "pointer",
        transition: "border-color 0.15s ease, color 0.15s ease, background 0.15s ease",
      }}
      className="disabled:opacity-50"
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: hover ? "var(--color-clay)" : "rgba(194,90,56,0.3)",
          flexShrink: 0,
          transition: "background 0.15s ease",
        }}
      />
      {label}
    </button>
  );
}
