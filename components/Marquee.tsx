"use client";

import { useEffect, useRef } from "react";

/*
 * Tilted ticker (from Orbit). It follows the scroll: scrolling down runs it left, scrolling up runs
 * it right, and the faster the page moves the faster it goes. It keeps the last direction once
 * scrolling stops. The CSS loop is the fallback without JS; reduced motion holds it still.
 */
export default function Marquee({ items }: { items: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    track.style.animation = "none";

    let loop = track.scrollWidth / 2;
    const onResize = () => {
      loop = track.scrollWidth / 2;
    };
    let offset = 0;
    let direction = 1;
    let rate = 1;
    let lastY = window.scrollY;
    let last = 0;
    let frame = 0;

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      const velocity = dt ? dy / dt : 0;
      if (Math.abs(velocity) > 5) direction = Math.sign(velocity);
      // Speed grows with scroll speed, capped so fast flicks stay readable.
      const target = direction * Math.min(1 + Math.abs(velocity) / 180, 12);
      rate += (target - rate) * (1 - 0.9 ** (dt * 60));
      offset -= (loop / 30) * rate * dt;
      if (loop) offset = ((offset % loop) - loop) % loop;
      track.style.transform = `translate3d(${offset.toFixed(2)}px,0,0)`;
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) {
        last = 0;
        lastY = window.scrollY;
        frame = requestAnimationFrame(tick);
      }
    });
    observer.observe(track);
    window.addEventListener("resize", onResize);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      track.style.animation = "";
      track.style.transform = "";
    };
  }, []);

  // Two copies of the list, so the loop wraps at half the track.
  const run = [...items, ...items, ...items, ...items];
  return (
    <div className="bp-marquee" aria-hidden>
      <div ref={trackRef} className="bp-marquee-track">
        {run.map((t, i) => (
          <span key={i}>
            {t}
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}
