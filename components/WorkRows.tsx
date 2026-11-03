"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/site";
import { glide } from "./motion";

/*
 * Project rows. On a desktop pointer, a screenshot of the live site follows the cursor, opening
 * with a clip-path wipe and swapping as you move between rows. Phones show the screenshot inside
 * each row instead; every row is a plain link to the live project.
 */
export default function WorkRows({ items, layout = false }: { items: Project[]; layout?: boolean }) {
  const reduce = useReducedMotion();
  const [hot, setHot] = useState<Project | null>(null);
  const [fine, setFine] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 26, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 26, mass: 0.6 });

  useEffect(() => {
    const mq = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 900px)");
    const on = () => setFine(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const move = (e: React.PointerEvent) => {
    x.set(e.clientX + 28);
    y.set(e.clientY - 120);
  };

  return (
    <>
      <div className="bp-rows" onPointerMove={move} onPointerLeave={() => setHot(null)}>
        <AnimatePresence initial={false}>
          {items.map((p) => (
            <motion.a
              key={p.id}
              layout={layout && !reduce ? "position" : false}
              initial={layout ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={glide}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bp-row has-img"
              onPointerEnter={() => setHot(p)}
              aria-label={`${p.name}, ${p.kind.toLowerCase()}. Opens the live site.`}
            >
              {/* Phones get the screenshot inline; the cursor peek covers wide screens. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="bp-row-img" src={p.shot} alt="" loading="lazy" width={1440} height={900} />
              <span className="bp-row-k bp-work-k">
                <span>{p.sector}</span>
                <span className="bp-tag" data-live={p.kind === "Live site" ? "1" : "0"}>
                  {p.kind}
                </span>
              </span>
              <span className="bp-row-t">
                {p.headline[0]} <span style={{ color: "var(--text-faint)" }}>{p.headline[1]}</span>
              </span>
              <span className="bp-row-s">
                <strong style={{ color: "var(--text)", fontWeight: 550 }}>{p.name}.</strong> {p.about}
              </span>
              <ArrowUpRight size={24} className="bp-row-a" />
            </motion.a>
          ))}
        </AnimatePresence>
      </div>
      {fine && !reduce && (
        <AnimatePresence>
          {hot && (
            <motion.div
              key="peek"
              className="bp-peek"
              style={{ x: sx, y: sy }}
              initial={{ clipPath: "inset(0 0 100% 0)", scale: 0.96 }}
              animate={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
              exit={{ clipPath: "inset(100% 0 0 0)", scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatePresence initial={false}>
                <motion.img
                  key={hot.id}
                  src={hot.shot}
                  alt=""
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{ position: "absolute", inset: 0 }}
                />
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
