import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { ctas, heads, services, waLink } from "@/content/site";
import Page from "@/components/Page";
import PageHead from "@/components/PageHead";
import Marquee from "@/components/Marquee";
import ServiceIndex from "@/components/ServiceIndex";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Services",
  description: "Business websites and landing pages, AI automation and chatbots, WhatsApp systems, social media, and connected customer journeys.",
};

export default function Services() {
  return (
    <Page>
      <PageHead head={heads.services} />

      <div className="bp-marquee-wrap" aria-hidden>
        <Marquee items={services.map((s) => s.short)} />
      </div>

      <section className="bp-sec bp-svc">
        <ServiceIndex items={services.map(({ id, short }) => ({ id, short }))} />
        <div className="bp-svc-list">
          {services.map((s, i) => (
            <article key={s.id} id={s.id} className="bp-svcitem">
              <div className="bp-svcitem-top">
                <span className="bp-kicker">
                  0{i + 1} · {s.kicker}
                </span>
                <span className="bp-svcitem-n" aria-hidden>
                  0{i + 1}
                </span>
              </div>
              <h2 className="bp-h2">{s.title}</h2>
              <p className="bp-svcitem-lead">{s.lead}</p>
              <ul className="bp-points">
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {s.note && <p className="bp-note">{s.note}</p>}
              <a
                href={waLink(`Hi BluePeakAI, I'd like to ask about ${s.title.toLowerCase()}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-btn secondary sm bp-svcitem-ask"
              >
                Ask about {s.short.toLowerCase()} <ArrowUpRight size={15} className="nudge" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <CtaBand head={ctas.services} />
    </Page>
  );
}
