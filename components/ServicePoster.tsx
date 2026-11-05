"use client";

import { useState } from "react";
import Link from "next/link";
import { services, servicesLead } from "@/content/site";

/*
 * The five services set as a poster stack, each name carrying a footnote number. The footnotes
 * underneath hold each service's line. Pointing at a name or a footnote lights the pair and quiets
 * the rest; on touch screens everything simply stays readable.
 */
export default function ServicePoster() {
  const [hot, setHot] = useState<number | null>(null);
  const on = (i: number) => ({
    onPointerEnter: () => setHot(i),
    onPointerLeave: () => setHot(null),
    onFocus: () => setHot(i),
    onBlur: () => setHot(null),
    "data-on": hot === i ? "1" : undefined,
  });

  return (
    <section className="bp-sec bp-offer" id="services" data-hot={hot === null ? undefined : "1"}>
      <p className="bp-offer-lead">{servicesLead}</p>
      <h2 className="bp-offer-line">
        {services.map((s, i) => (
          <span key={s.id} className="bp-offer-item">
            <Link href={`/services#${s.id}`} className="bp-offer-name" {...on(i)}>
              {s.short}
              <sup>{i + 1}</sup>
            </Link>{" "}
          </span>
        ))}
      </h2>
      <ol className="bp-offer-notes">
        {services.map((s, i) => (
          <li key={s.id}>
            <Link href={`/services#${s.id}`} {...on(i)} aria-label={`${s.short}: ${s.line}`}>
              <span className="n">{i + 1}</span>
              <span>{s.line}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
