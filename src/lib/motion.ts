import type { Variants, Transition } from "framer-motion";

/** House easing curves (see DESIGN-SYSTEM.md §4). */
export const EASE = {
  expo: [0.16, 1, 0.3, 1] as const,
  quart: [0.25, 1, 0.5, 1] as const,
  stamp: [0.34, 1.56, 0.64, 1] as const,
};

export const DUR = {
  hover: 0.15,
  swipe: 0.38,
  stamp: 0.42,
  cv: 0.5,
  reveal: 0.6,
};

/** Scroll/entrance reveal: rise + fade. Calm everywhere. */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.reveal, ease: EASE.expo },
  },
};

/** Stagger container for grouped reveals. */
export const revealStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/** Receipt stamp press-in — the only overshoot in the system. */
export const stampIn: Variants = {
  hidden: { opacity: 0, scale: 1.4, rotate: -6, filter: "blur(3px)" },
  show: {
    opacity: 1,
    scale: 1,
    rotate: -3,
    filter: "blur(0px)",
    transition: { duration: DUR.stamp, ease: EASE.stamp },
  },
};

/** "Couldn't verify" — deliberately quiet. No scale, no overshoot. */
export const couldntVerify: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.cv, ease: EASE.expo },
  },
};

/** Reduced-motion: opacity-only, instant-ish. */
export const reducedReveal: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

export const spring: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.6,
};
