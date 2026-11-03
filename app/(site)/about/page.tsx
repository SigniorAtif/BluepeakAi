import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { brand, contact, ctas, founderCoda, founderHead, founderStory, heads, process5, promise } from "@/content/site";
import Page from "@/components/Page";
import PageHead from "@/components/PageHead";
import Portrait from "@/components/Portrait";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "About",
  description: "BluePeakAI is a digital solutions business in Vadodara, founded by Ayushi Krunal Shah.",
};

const linkedin = contact.social.find((s) => s.id === "linkedin")!;

export default function About() {
  return (
    <Page>
      <PageHead head={heads.about} />

      <section className="bp-sec">
        <Portrait src="/brand/founder.webp" alt={`${brand.founder}, founder of BluePeakAI`} />
        <div className="bp-founder">
          <div className="bp-founder-head">
            <span className="bp-kicker">Meet the founder</span>
            <h2 className="bp-h2">
              {founderHead[0]} <span className="dim">{founderHead[1]}</span>
            </h2>
            <p className="bp-founder-sig">
              {brand.founder} <span>· Founder, {brand.city.split(",")[0]}</span>
            </p>
          </div>
          <div className="bp-founder-story">
            {founderStory.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p>{founderCoda}</p>
            <div className="bp-ctas">
              <Link href="/contact" className="bp-btn primary">
                Work with BluePeakAI <ArrowUpRight size={16} className="nudge" />
              </Link>
              <a href={linkedin.href} target="_blank" rel="noopener noreferrer" className="bp-btn secondary">
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bp-sec">
        <div className="bp-sechead">
          <span className="bp-kicker">Our process</span>
          <h2 className="bp-h2">
            Clear steps. <span className="dim">Collaborative delivery.</span>
          </h2>
          <p>You&apos;ll know what happens next, what we&apos;re building and how we get to launch.</p>
        </div>
        <ol className="bp-steps">
          {process5.map(({ t, d }, i) => (
            <li key={t} className="bp-rise">
              <span className="bp-steps-n">0{i + 1}</span>
              <span className="bp-steps-t">{t}</span>
              <span className="bp-steps-d">{d}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="bp-sec">
        <div className="bp-promise">
          <span className="bp-kicker">Our promise</span>
          <p>{promise}</p>
        </div>
      </section>

      <CtaBand head={ctas.about} />
    </Page>
  );
}
