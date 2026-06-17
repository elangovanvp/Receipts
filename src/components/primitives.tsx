"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { reveal, reducedReveal, revealStagger } from "@/lib/motion";

/** Magnetic wrapper — pulls its child toward the cursor, springs back on leave.
 *  Used sparingly on primary actions. No-ops under reduced motion. */
export function Magnetic({
  children,
  className,
  strength = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.3 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: reduce ? 0 : sx, y: reduce ? 0 : sy, display: "inline-flex" }}
      className={className}
    >
      {children}
    </motion.span>
  );
}

/** Mono uppercase eyebrow, optionally prefixed with a case-file exhibit marker. */
export function Eyebrow({
  children,
  exhibit,
  className,
}: {
  children: React.ReactNode;
  exhibit?: string;
  className?: string;
}) {
  return (
    <p className={cn("t-chip text-ink-faint flex items-center gap-2", className)}>
      {exhibit && (
        <span className="text-amber-ink/80 border border-border rounded-[3px] px-1.5 py-0.5 leading-none">
          EXHIBIT {exhibit}
        </span>
      )}
      <span>{children}</span>
    </p>
  );
}

export function Rule({ className }: { className?: string }) {
  return <div className={cn("rule", className)} role="presentation" />;
}

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "ghost";
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] px-5 h-12 t-small font-medium",
        "transition-colors duration-150 ease-[var(--ease-quart)] select-none",
        variant === "primary" &&
          "bg-ink text-paper hover:bg-[#2a2823] shadow-[var(--shadow-card)]",
        variant === "ghost" &&
          "bg-transparent text-ink border border-border hover:border-border-strong hover:bg-paper-2",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/** Scroll-reveal wrapper. Calm rise+fade; opacity-only under reduced motion. */
export function Reveal({
  children,
  className,
  as = "div",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "li" | "header";
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      variants={reduce ? reducedReveal : reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Staggered group reveal container. */
export function RevealGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={revealStagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
