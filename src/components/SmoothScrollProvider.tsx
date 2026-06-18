"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";

/**
 * Wraps the app with Lenis smooth scroll.
 * No-ops completely under prefers-reduced-motion — native scroll is used instead.
 * The rAF loop stops itself via cancelAnimationFrame on unmount.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let rafId = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, [reduce]);

  return <>{children}</>;
}
