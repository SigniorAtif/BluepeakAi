"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { ServiceId } from "@/content/site";
import { glide } from "./motion";

/*
 * The services page's index: 01 to 05, sticky beside the list on wide screens and a chip rail
 * under the nav on phones. The marker glides to whichever service is in the middle of the screen.
 */
export default function ServiceIndex({ items }: { items: { id: ServiceId; short: string }[] }) {
  const [on, setOn] = useState<ServiceId>(items[0].id);

  useEffect(() => {
    const els = items.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setOn(e.target.id as ServiceId);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  // Keep the active chip in view on the phone rail.
  useEffect(() => {
    const chip = document.querySelector<HTMLElement>(`.bp-svcidx a[data-on="1"]`);
    const rail = chip?.parentElement;
    if (!chip || !rail || rail.scrollWidth <= rail.clientWidth) return;
    rail.scrollTo({ left: chip.offsetLeft - 16, behavior: "smooth" });
  }, [on]);

  return (
    <nav className="bp-svcidx" aria-label="Services">
      <span className="bp-kicker">Index</span>
      <div className="bp-svcidx-list">
        {items.map((s, i) => (
          <a key={s.id} href={`#${s.id}`} data-on={on === s.id ? "1" : "0"} aria-current={on === s.id ? "true" : undefined}>
            {on === s.id && <motion.span layoutId="bp-svcidx" className="bp-svcidx-pill" transition={glide} />}
            <span className="n">0{i + 1}</span>
            <span className="t">{s.short}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
