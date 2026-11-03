import type { Transition } from "motion/react";

/* Crambook's motion vocabulary. No bounce; everything eases out. */

/** Shared-layout moves: active pills, filter chips, reflowing rows. */
export const glide: Transition = { type: "spring", bounce: 0, duration: 0.38 };

/** Long entrances: a quick start that settles slowly. */
export const settle = [0.16, 1, 0.3, 1] as const;
