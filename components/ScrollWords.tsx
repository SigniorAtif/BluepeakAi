"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

/*
 * A statement that lights up word by word as it scrolls through the screen: each word goes from
 * faint to full as the reading line passes it. Reduced motion shows it lit.
 */
export default function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} p={scrollYProgress} at={[i / words.length, (i + 1) / words.length]} still={!!reduce}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({ p, at, still, children }: { p: MotionValue<number>; at: [number, number]; still: boolean; children: string }) {
  const opacity = useTransform(p, at, [0.22, 1]);
  return (
    <>
      <motion.span style={{ opacity: still ? 1 : opacity }}>{children}</motion.span>{" "}
    </>
  );
}
