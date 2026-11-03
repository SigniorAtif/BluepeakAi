"use client";

import Image from "next/image";
import { useRef } from "react";

/*
 * The founder's photo, duotoned in the current accent so it follows the toggle. On a desktop
 * pointer, a soft lens under the cursor shows the photo in its own colours.
 */
export default function Portrait({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.dataset.lens = "1";
  };
  const leave = () => {
    if (ref.current) ref.current.dataset.lens = "0";
  };

  return (
    <div ref={ref} className="bp-portrait" onPointerMove={move} onPointerLeave={leave}>
      <Image src={src} alt={alt} fill sizes="(min-width: 1200px) 1100px, 100vw" className="tone" priority />
      <Image src={src} alt="" fill sizes="(min-width: 1200px) 1100px, 100vw" className="true" aria-hidden />
    </div>
  );
}
