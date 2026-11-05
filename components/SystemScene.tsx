"use client";

import { useRef, useState } from "react";
import { easeInOut, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { principle } from "@/content/site";

/*
 * "Not more tools. Better systems." staged on the scroll: the touchpoints a customer passes through
 * start scattered, then pull into one line as the section rises, the line draws through them and
 * "Better systems." lights up. Once joined, an enquiry dot keeps running along it. Reduced motion
 * gets the joined state straight away (CSS overrides the inline motion values).
 *
 * Positions are percentages of a 4:3 stage: x of its width, y of its height.
 */
type Stop = { from: [number, number]; to: [number, number]; label: "above" | "below"; anchor?: "start" | "end" };
const STOPS: Stop[] = [
  { from: [74, 14], to: [5, 60], label: "below", anchor: "start" },
  { from: [14, 82], to: [18, 41], label: "above" },
  { from: [86, 76], to: [34, 57], label: "below" },
  { from: [30, 12], to: [49, 37], label: "above" },
  { from: [52, 90], to: [65, 58], label: "below" },
  { from: [10, 26], to: [80, 42], label: "above" },
  { from: [58, 46], to: [94, 51], label: "below", anchor: "end" },
];

// One smooth curve through the joined positions (Catmull-Rom as cubic Béziers), in a 100×75 box.
const PTS = STOPS.map((s) => [s.to[0], s.to[1] * 0.75]);
const PATH = PTS.reduce((d, p, i) => {
  if (i === 0) return `M${p[0]} ${p[1]}`;
  const a = PTS[i - 2] ?? PTS[i - 1];
  const b = PTS[i - 1];
  const c = PTS[i + 1] ?? p;
  const c1 = [b[0] + (p[0] - a[0]) / 6, b[1] + (p[1] - a[1]) / 6];
  const c2 = [p[0] - (c[0] - b[0]) / 6, p[1] - (c[1] - b[1]) / 6];
  return `${d} C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p[0]} ${p[1]}`;
}, "");

export default function SystemScene() {
  // Keyed to the stage, not the section, so the whole move plays while the stage is on screen.
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: stage, offset: ["start 0.95", "center 0.55"] });
  const draw = useTransform(p, [0.55, 0.88], [0, 1]);
  const lit = useTransform(p, [0.6, 0.9], [0, 1]);
  const rest = useTransform(p, [0.7, 0.95], [0, 1]);
  const [live, setLive] = useState(false);
  useMotionValueEvent(p, "change", (v) => setLive(v > 0.92));

  return (
    <section className="bp-sec bp-sys" data-live={live ? "1" : "0"}>
      <div className="bp-sys-copy">
        <h2 className="bp-sys-big">
          {principle.big[0]}{" "}
          <motion.span className="bp-sys-lit" style={{ "--lit": lit } as never}>
            {principle.big[1]}
          </motion.span>
        </h2>
        <motion.div className="bp-sys-rule" style={{ opacity: rest }}>
          <strong>
            <em>{principle.lead[0]}</em> {principle.lead[1]}
          </strong>
          <p>{principle.body}</p>
        </motion.div>
      </div>

      <div className="bp-sys-stage" ref={stage} aria-hidden>
        <svg viewBox="0 0 100 75" className="bp-sys-svg">
          <motion.path id="bp-sys-path" d={PATH} style={{ pathLength: draw }} />
          <circle r="0.9" className="bp-sys-run">
            <animateMotion dur="5.5s" repeatCount="indefinite">
              <mpath href="#bp-sys-path" />
            </animateMotion>
          </circle>
        </svg>
        {STOPS.map((s, i) => (
          <Node key={i} stop={s} p={p} i={i} label={principle.stops[i]} last={i === STOPS.length - 1} />
        ))}
      </div>
    </section>
  );
}

function Node({ stop, p, i, label, last }: { stop: Stop; p: MotionValue<number>; i: number; label: string; last: boolean }) {
  const range = [0.04 + i * 0.035, 0.5 + i * 0.035];
  const x = useTransform(p, range, [stop.from[0], stop.to[0]], { ease: easeInOut });
  const y = useTransform(p, range, [stop.from[1], stop.to[1]], { ease: easeInOut });
  const o = useTransform(p, range, [0.45, 1]);
  return (
    <motion.span
      className="bp-sys-node"
      data-label={stop.label}
      data-anchor={stop.anchor}
      data-last={last ? "1" : undefined}
      style={{ "--x": x, "--y": y, "--fx": stop.to[0], "--fy": stop.to[1], opacity: o } as never}
    >
      <i />
      <span>{label}</span>
    </motion.span>
  );
}
