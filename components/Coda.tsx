"use client";

import { Fragment, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { coda } from "@/content/site";

/*
 * The home page's last words. The page scrolls on into empty space, the screen holds, and the
 * scroll itself writes the line in, letter by letter, then signs it. Then the footer arrives.
 *
 * The section is tall and its stage is sticky, so the scroll has room to play the line. Progress 0
 * is the section's top entering the viewport; the stage pins at about 0.28 and the letters run from
 * 0.36 to 0.74. Reduced motion skips the pin and shows the line as plain text.
 */
const FROM = 0.36;
const TO = 0.74;
const SPAN = 0.07;

export default function Coda() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const sign = useTransform(p, [0.78, 0.88], [0, 1]);
  const signY = useTransform(p, [0.78, 0.88], [12, 0]);

  // Each letter's start, spread evenly over FROM..TO in reading order.
  const line = coda.lines.join(" ");
  const total = line.replace(/ /g, "").length;
  let seen = 0;
  const rows = coda.lines.map((row) =>
    row.split(" ").map((w) =>
      w.split("").map((ch) => ({ ch, at: FROM + ((TO - FROM - SPAN) * seen++) / Math.max(1, total - 1) })),
    ),
  );

  return (
    <section ref={ref} className="bp-coda" aria-label="A last word">
      <div className="bp-coda-pin">
        <div className="bp-coda-in">
          <p className="bp-coda-line">
            <span className="sr-only">{line}</span>
            {rows.map((words, ri) => (
              <Fragment key={ri}>
                <span className="bp-coda-row">
                  {words.map((w, wi) => (
                    <Fragment key={wi}>
                      <span className="bp-coda-word" aria-hidden>
                        {w.map((c, ci) => (
                          <Char key={ci} ch={c.ch} p={p} at={c.at} />
                        ))}
                      </span>
                      {wi < words.length - 1 && " "}
                    </Fragment>
                  ))}
                </span>
                {ri < rows.length - 1 && " "}
              </Fragment>
            ))}
          </p>
          <motion.p className="bp-coda-sign" style={{ opacity: sign, y: signY }}>
            <i aria-hidden />
            <span>
              {coda.sign[0]}
              <b>{coda.sign[1]}</b>
            </span>
          </motion.p>
        </div>
      </div>
    </section>
  );
}

function Char({ ch, p, at }: { ch: string; p: MotionValue<number>; at: number }) {
  const o = useTransform(p, [at, at + SPAN], [0, 1]);
  const y = useTransform(p, [at, at + SPAN], ["0.18em", "0em"]);
  return (
    <motion.span className="bp-coda-ch" style={{ opacity: o, y }}>
      {ch}
    </motion.span>
  );
}
