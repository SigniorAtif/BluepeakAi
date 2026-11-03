"use client";

import { motion } from "motion/react";

/*
 * Oversized name closing the footer (from Orbit, in Orbit's Bodoni Moda). The letters stand on the
 * footer's bottom edge, cut a hair above the baseline (line-height .7 against the face's metrics), and
 * each rises out of that edge the first time it scrolls into view. "BLUEPEAK" is drawn in the
 * accent, so it follows the accent toggle; "AI" sits beside it in the text colour. Reduced motion is
 * handled in CSS (letters held in place), so the server and client render the same markup.
 */
export default function FooterMark({ word = "BLUEPEAK", tail = "AI" }: { word?: string; tail?: string }) {
  const letters = [...word.split("").map((l) => ({ l, tail: false })), ...tail.split("").map((l) => ({ l, tail: true }))];
  return (
    <div aria-hidden className="bp-footmark">
      <motion.div className="bp-footmark-in" initial="hidden" whileInView="shown" viewport={{ once: true }}>
        {letters.map(({ l, tail }, i) => (
          <motion.span
            key={i}
            className={tail ? "tail" : undefined}
            variants={{ hidden: { y: "115%" }, shown: { y: "0%" } }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
          >
            {l}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
