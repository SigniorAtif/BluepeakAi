"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/site";

/*
 * Selected work on the home page. The projects scroll by on the left; on wide screens a sticky
 * frame on the right shows the live site's screenshot, and each next project wipes up over the last
 * as it reaches the middle of the screen. Phones get each screenshot inline instead.
 */
export default function WorkStage({ items, total }: { items: Project[]; total: number }) {
  const [on, setOn] = useState(0);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = Array.from(list.current?.querySelectorAll<HTMLElement>("[data-i]") ?? []);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setOn(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const host = (href: string) => new URL(href).hostname;

  return (
    <section className="bp-sec bp-show" id="work">
      <div className="bp-show-head">
        <h2 className="bp-h2">Built for different business needs.</h2>
        <Link href="/work" className="bp-textlink">
          All {count(total)} projects <ArrowRight size={16} />
        </Link>
      </div>

      <div className="bp-show-grid">
        <div className="bp-show-list" ref={list}>
          {items.map((p, i) => (
            <article key={p.id} className="bp-show-item" data-i={i} data-on={on === i ? "1" : "0"}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static screenshots, already sized webp */}
              <img className="bp-show-inline" src={p.shot} alt={`${p.name} home page`} width={1440} height={900} loading="lazy" />
              <p className="bp-show-meta">
                <span>{String(i + 1).padStart(2, "0")}</span>
                {p.sector}
                <span className="bp-show-kind" data-live={p.kind === "Live site" ? "1" : undefined}>
                  {p.kind}
                </span>
              </p>
              <h3 className="bp-show-t">
                {p.headline[0]} {p.headline[1]}
              </h3>
              <p className="bp-show-d">
                <b>{p.name}.</b> {p.about}
              </p>
              <a href={p.href} target="_blank" rel="noopener noreferrer" className="bp-textlink">
                Open the site <ArrowUpRight size={16} />
              </a>
            </article>
          ))}
        </div>

        <div className="bp-show-stage" aria-hidden>
          <div className="bp-show-frame">
            {items.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- see above
              <img key={p.id} src={p.shot} alt="" width={1440} height={900} data-state={i < on ? "past" : i === on ? "on" : "next"} loading={i === 0 ? "eager" : "lazy"} />
            ))}
          </div>
          <div className="bp-show-cap">
            <span className="host">{host(items[on].href)}</span>
            <span>
              {String(on + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const count = (n: number) => WORDS[n] ?? String(n);
