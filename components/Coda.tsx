"use client";

import { useEffect, useRef } from "react";
import { coda } from "@/content/site";

/*
 * The home page's last words. The page scrolls on into empty space, the screen holds, and one line
 * fades in at its centre. When the footer starts to rise, the line stays put at first, then drifts
 * up ahead of it and comes to rest in the strip between the nav and the footer's top edge. If that
 * strip is too short to hold the line, the line fades out as it rises instead of tucking under the nav.
 *
 * The line is fixed to the viewport, so scrolling never carries it; only the drift moves it. Where
 * the browser has scroll timelines (Chromium, Safari 26) the drift and fades run as one keyframe
 * animation bound to the page scroll, sampled from `frame()` and played by the compositor, so the
 * line can't lag a frame behind the footer. Elsewhere a scroll listener writes the same values.
 * Reduced motion skips both, and CSS sets the line in the page as plain text.
 */
const GAP = 24;
const STEPS = 40;

type Geo = {
  top: number; // section top, page coordinates
  size: number; // section height
  release: number; // scroll at which the section's end meets the viewport bottom
  run: number; // scroll left after that, up to the page end
  foot: number; // footer height
  navH: number;
  vh: number;
  h: number; // the line block's height
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Where the line sits and how visible it is at scroll position s.
function frame(g: Geo, s: number) {
  const { top, size, release, run, foot, navH, vh, h } = g;
  // Section progress: 0 when its top meets the viewport bottom, 1 when its end does.
  const p = size > 0 ? (s - (top - vh)) / size : 0;
  // The section is 2 viewports tall, so it fills the screen from p = 0.5; the line fades in soon after.
  const show = clamp01((p - 0.56) / 0.22);
  const sign = clamp01((p - 0.68) / 0.18);

  const d = Math.min(run, Math.max(0, s - release));
  if (run <= 0 || d <= 0) return { lift: 0, opacity: show, sign };

  // At the page end the footer's top sits at vh - foot; the strip above it runs from the nav down.
  const strip = vh - foot - navH;
  const target = strip >= h + GAP * 2 ? navH + strip / 2 : vh - foot - GAP - h / 2;
  const most = Math.max(0, vh / 2 - target);
  // How far the page can scroll before the footer (which starts run - foot below) gets close.
  const free = vh / 2 - h / 2 - GAP + (run - foot);
  const lift = Math.max(most * (d / run) ** 2, d - free, 0);

  // Short of room, the line fades as it rises, ending this faint (gone once half of it would sit
  // under the nav), and never reaches the nav while still visible.
  const short = h + GAP * 2 - strip;
  if (short <= 0) return { lift, opacity: show, sign };
  const end = clamp01(1 - short / (h / 2));
  const fade = most > 0 ? 1 - (1 - end) * Math.min(1, lift / most) : 1;
  const clear = clamp01((vh / 2 - h / 2 - lift - navH) / h);
  return { lift, opacity: show * Math.min(fade, clear), sign };
}

type TimelineCtor = new (o: { source: Element; axis: "block" }) => AnimationTimeline;

export default function Coda() {
  const section = useRef<HTMLElement>(null);
  const block = useRef<HTMLDivElement>(null);
  const signRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = section.current;
    const b = block.current;
    const sg = signRef.current;
    if (!el || !b || !sg) return;

    const Timeline = (window as unknown as { ScrollTimeline?: TimelineCtor }).ScrollTimeline;
    let geo: Geo | null = null;
    let max = 0;
    let anims: Animation[] = [];

    const measure = () => {
      const vh = window.innerHeight;
      const doc = document.documentElement.scrollHeight;
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const bottom = r.bottom + window.scrollY;
      const footer = document.querySelector<HTMLElement>(".bp-foot");
      const footTop = footer ? footer.getBoundingClientRect().top + window.scrollY : bottom;
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16 || 72;
      geo = { top, size: r.height, release: bottom - vh, run: doc - bottom, foot: doc - footTop, navH, vh, h: b.offsetHeight };
      max = doc - vh;
    };

    // Fallback: write the frame straight from the scroll event.
    const write = () => {
      if (!geo) return;
      const f = frame(geo, window.scrollY);
      b.style.transform = `translate3d(0,${-f.lift}px,0)`;
      b.style.opacity = String(f.opacity);
      sg.style.opacity = String(f.sign);
    };

    // Scroll timeline: sample frame() across the whole page scroll into keyframes.
    const build = () => {
      anims.forEach((a) => a.cancel());
      anims = [];
      if (!geo || !Timeline || max <= 0) return;
      const g = geo;
      const at = (p: number) => g.top - g.vh + p * g.size;
      const marks = [0, at(0.56), at(0.68), at(0.78), at(0.86), g.release, max];
      for (let k = 1; k < STEPS; k++) marks.push(g.release + (g.run * k) / STEPS);
      const stops = [...new Set(marks.map((s) => Math.min(max, Math.max(0, Math.round(s)))))].sort((x, y) => x - y);
      const timeline = new Timeline({ source: document.documentElement, axis: "block" });
      const opts = { timeline, fill: "both", easing: "linear" } as KeyframeAnimationOptions;
      anims.push(
        b.animate(
          stops.map((s) => {
            const f = frame(g, s);
            return { offset: s / max, transform: `translate3d(0,${-f.lift}px,0)`, opacity: f.opacity };
          }),
          opts,
        ),
        sg.animate(
          stops.map((s) => ({ offset: s / max, opacity: frame(g, s).sign })),
          opts,
        ),
      );
    };

    const update = () => {
      measure();
      if (Timeline) build();
      else write();
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    window.addEventListener("resize", update);
    if (!Timeline) window.addEventListener("scroll", write, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", write);
      anims.forEach((a) => a.cancel());
    };
  }, []);

  return (
    <section ref={section} className="bp-coda" aria-label="A last word">
      <div className="bp-coda-pin">
        <div ref={block} className="bp-coda-in">
          <p className="bp-coda-line">{coda.line}</p>
          <p ref={signRef} className="bp-coda-sign">
            <i aria-hidden />
            <span>
              {coda.sign[0]}
              <b>{coda.sign[1]}</b>
            </span>
            <i aria-hidden />
          </p>
        </div>
      </div>
    </section>
  );
}
