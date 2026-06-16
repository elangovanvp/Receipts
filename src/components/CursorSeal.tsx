"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

/**
 * The one live object (MetaMask principle). A wax/rubber "VERIFIED" seal that
 * orients toward the pointer with parallax receipt cards, and drifts gently
 * when idle. CSS-3D only (GPU transforms). Static under reduced motion.
 */
export function CursorSeal() {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);

  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const pX = useMotionValue(0); // parallax driver [-1,1]
  const pY = useMotionValue(0);

  // Precompute parallax offsets at fixed depths (stable hook order).
  const c1x = useTransform(pX, (v) => v * 6);
  const c1y = useTransform(pY, (v) => v * 6);
  const c2x = useTransform(pX, (v) => v * 9);
  const c2y = useTransform(pY, (v) => v * 9);
  const c3x = useTransform(pX, (v) => v * 4.5);
  const c3y = useTransform(pY, (v) => v * 4.5);

  useEffect(() => {
    if (reduce) return;
    const el = wrap.current;
    if (!el) return;

    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let active = false;
    let lastMove = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      target.x = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width * 0.9)));
      target.y = Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height * 0.9)));
      active = true;
      lastMove = performance.now();
    };

    const loop = () => {
      const now = performance.now();
      if (active && now - lastMove > 1600) active = false;
      let tx = target.x;
      let ty = target.y;
      if (!active) {
        const t = now / 1000;
        tx = Math.sin(t / 3) * 0.4;
        ty = Math.sin(t / 2.3) * 0.22;
      }
      cur.x += (tx - cur.x) * 0.08;
      cur.y += (ty - cur.y) * 0.08;
      rotY.set(cur.x * 16);
      rotX.set(-cur.y * 16);
      pX.set(cur.x);
      pY.set(cur.y);
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce, rotX, rotY, pX, pY]);

  return (
    <div
      ref={wrap}
      className="relative mx-auto aspect-square w-full max-w-[clamp(15rem,34vw,22rem)]"
      style={{ perspective: 900 }}
      aria-hidden="true"
    >
      <motion.div
        className="relative h-full w-full"
        style={{
          rotateX: reduce ? 0 : rotX,
          rotateY: reduce ? 0 : rotY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* soft cast shadow */}
        <div
          className="absolute inset-[12%] rounded-full bg-ink/10 blur-2xl"
          style={{ transform: "translateZ(-60px)" }}
        />

        {/* the seal */}
        <div className="absolute inset-0 grid place-items-center">
          <SealSVG />
        </div>

        {/* parallax receipt cards floating above the seal */}
        <FloatCard className="left-[-6%] top-[10%]" z={44} x={c1x} y={c1y} label="linear.app" tone="amber" />
        <FloatCard className="right-[-9%] top-[36%]" z={66} x={c2x} y={c2y} label="pricing" tone="ink" />
        <FloatCard className="left-[2%] bottom-[6%]" z={30} x={c3x} y={c3y} label="changelog" tone="ink" />
      </motion.div>
    </div>
  );
}

function FloatCard({
  className,
  z,
  x,
  y,
  label,
  tone,
}: {
  className: string;
  z: number;
  x: MotionValue<number>;
  y: MotionValue<number>;
  label: string;
  tone: "amber" | "ink";
}) {
  return (
    <motion.div className={`absolute ${className}`} style={{ x, y, z }}>
      <div
        className={`flex items-center gap-1.5 rounded-[6px] border bg-paper px-2 py-1 shadow-[var(--shadow-lift)] ${
          tone === "amber" ? "border-amber/70" : "border-border-strong"
        }`}
      >
        <svg width="10" height="10" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="5" fill="none" strokeWidth="1.3" className={tone === "amber" ? "stroke-amber" : "stroke-ink-faint"} />
          {tone === "amber" && (
            <path d="M3.6 6.2l1.6 1.6L8.6 4.4" fill="none" strokeWidth="1.4" strokeLinecap="round" className="stroke-amber" />
          )}
        </svg>
        <span className="font-mono text-[10px] tracking-wide text-ink-muted">{label}</span>
      </div>
    </motion.div>
  );
}

function SealSVG() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <defs>
        <radialGradient id="wax" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#F7E6AE" />
          <stop offset="45%" stopColor="#E9B83A" />
          <stop offset="100%" stopColor="#C98E12" />
        </radialGradient>
        <path id="sealArc" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" fill="none" />
      </defs>

      {/* outer ink rings */}
      <circle cx="100" cy="100" r="92" fill="none" stroke="#1A1916" strokeOpacity="0.16" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="86" fill="none" stroke="#1A1916" strokeOpacity="0.28" strokeWidth="2" strokeDasharray="2 4" />

      {/* wax disc */}
      <circle cx="100" cy="100" r="74" fill="url(#wax)" />
      <circle cx="100" cy="100" r="74" fill="none" stroke="#8A6410" strokeOpacity="0.5" strokeWidth="1.5" />

      {/* circular text */}
      <text fill="#5A410B" style={{ fontSize: "12.5px", letterSpacing: "3px", fontFamily: "var(--font-mono)" }}>
        <textPath href="#sealArc" startOffset="0%">
          RECEIPTS · NO SOURCE · NO CLAIM · VERIFIED ·
        </textPath>
      </text>

      {/* embossed check */}
      <g transform="translate(100 100)">
        <circle r="40" fill="none" stroke="#5A410B" strokeOpacity="0.45" strokeWidth="2" />
        <path d="M-18 2 L-5 16 L20 -16" fill="none" stroke="#3A2A06" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M-18 2 L-5 16 L20 -16" fill="none" stroke="#F7E6AE" strokeOpacity="0.7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
