"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { industries, projects, type Industry } from "@/content/site";
import WorkRows from "./WorkRows";
import { glide } from "./motion";

/** All eight projects, filtered by industry. The active chip's fill glides between chips. */
export default function WorkFilter() {
  const [on, setOn] = useState<Industry | "all">("all");
  const chips = [
    { id: "all" as const, label: "All", n: projects.length },
    ...industries.map((x) => ({ ...x, n: projects.filter((p) => p.industry === x.id).length })),
  ];
  const items = on === "all" ? projects : projects.filter((p) => p.industry === on);

  return (
    <>
      <div className="bp-chips" role="group" aria-label="Filter by industry">
        {chips.map((c) => (
          <button key={c.id} type="button" aria-pressed={on === c.id} onClick={() => setOn(c.id)} className="bp-chip">
            {on === c.id && <motion.span layoutId="bp-chip" className="bp-chip-pill" transition={glide} />}
            <span>{c.label}</span>
            <span className="n">{c.n}</span>
          </button>
        ))}
      </div>
      <WorkRows items={items} layout />
    </>
  );
}
