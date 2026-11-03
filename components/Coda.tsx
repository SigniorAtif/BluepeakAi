"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { coda } from "@/content/site";

/*
 * The home page's last words. The page scrolls on into empty space, the screen holds, and one line
 * fades in at its centre. When the footer starts to rise, the line stays put at first, then drifts
 * up ahead of it and comes to rest in the strip between the nav and the footer's top edge.
 *
 * The stage is sticky inside a tall section. Once the section ends, the stage is carried up by the
 * footer (by `d` pixels); the line is translated back down by `d - lift(d)`, so on screen it only
 * rises by `lift(d)`: slow at first, never closer than GAP to the footer, and at the page end it sits
 * centred in the strip above the footer (or just above the footer if the strip is too short).
 * Reduced motion skips the pin and the drift (CSS), and the line is simply there.
 */
const GAP = 24;

export default function Coda() {
  const section = useRef<HTMLElement>(null);
  const block = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p, scrollY } = useScroll({ target: section, offset: ["start end", "end end"] });
  // The section is 2 viewports tall, so the stage pins at p = 0.5; the line fades in soon after.
  const show = useTransform(p, [0.56, 0.78], [0, 1]);
  const sign = useTransform(p, [0.68, 0.86], [0, 1]);
  const y = useMotionValue(0);
  const geo = useRef({ release: 0, run: 0, foot: 0, navH: 72, vh: 800, h: 100 });

  const place = (scroll: number) => {
    const { release, run, foot, navH, vh, h } = geo.current;
    const d = Math.min(run, Math.max(0, scroll - release));
    if (run <= 0 || d <= 0) return y.set(0);
    // At the page end the footer's top sits at vh - foot; the strip above it runs from the nav down.
    const strip = vh - foot - navH;
    const target = strip >= h + GAP * 2 ? navH + strip / 2 : vh - foot - GAP - h / 2;
    const most = Math.max(0, vh / 2 - target);
    // How far the stage can be carried before the footer (which starts run - foot below it) gets close.
    const free = vh / 2 - h / 2 - GAP + (run - foot);
    const t = d / run;
    const lift = Math.max(most * t * t, d - free, 0);
    y.set(d - lift);
  };

  useEffect(() => {
    const measure = () => {
      const el = section.current;
      const b = block.current;
      if (!el || !b) return;
      const vh = window.innerHeight;
      const doc = document.documentElement.scrollHeight;
      const bottom = el.getBoundingClientRect().bottom + window.scrollY;
      const footer = document.querySelector<HTMLElement>(".bp-foot");
      const footTop = footer ? footer.getBoundingClientRect().top + window.scrollY : bottom;
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16 || 72;
      geo.current = { release: bottom - vh, run: doc - bottom, foot: doc - footTop, navH, vh, h: b.offsetHeight };
      place(window.scrollY);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // place only reads refs and a motion value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useMotionValueEvent(scrollY, "change", place);

  return (
    <section ref={section} className="bp-coda" aria-label="A last word">
      <div className="bp-coda-pin">
        <motion.div ref={block} className="bp-coda-in" style={{ y }}>
          <motion.p className="bp-coda-line" style={{ opacity: show }}>
            {coda.line}
          </motion.p>
          <motion.p className="bp-coda-sign" style={{ opacity: sign }}>
            <i aria-hidden />
            <span>
              {coda.sign[0]}
              <b>{coda.sign[1]}</b>
            </span>
            <i aria-hidden />
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
