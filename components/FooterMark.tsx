"use client";

import { motion, useReducedMotion } from "motion/react";

/*
 * Oversized name closing the footer (from Orbit). The footer's bottom edge crops the feet of the
 * letters, and each letter rises out of that cut the first time it scrolls into view. It's drawn in
 * the accent, so it follows the accent toggle.
 */
export default function FooterMark({ word = "BLUEPEAK" }: { word?: string }) {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className="bp-footmark">
      <motion.div className="bp-footmark-in" initial={reduced ? false : "hidden"} whileInView="shown" viewport={{ once: true, margin: "0px 0px -5% 0px" }}>
        {word.split("").map((letter, i) => (
          <motion.span
            key={i}
            variants={{ hidden: { y: "105%" }, shown: { y: "0%" } }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
