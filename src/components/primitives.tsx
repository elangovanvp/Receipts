"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { reveal, reducedReveal, revealStagger } from "@/lib/motion";

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
