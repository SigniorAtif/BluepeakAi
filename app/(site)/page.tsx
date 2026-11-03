import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { brand, contact, ctas, featured, process4, projects, services } from "@/content/site";
import HeroIntro from "@/components/HeroIntro";
import HomeHero from "@/components/HomeHero";
import WorkRows from "@/components/WorkRows";
import Page from "@/components/Page";
import CtaBand from "@/components/CtaBand";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: brand.name,
  url: brand.url,
  slogan: `${brand.tagline} ${brand.tagline2}`,
  email: contact.email,
  telephone: contact.phone.replace(/\s/g, ""),
  founder: { "@type": "Person", name: brand.founder },
  address: { "@type": "PostalAddress", addressLocality: "Vadodara", addressRegion: "Gujarat", addressCountry: "IN" },
  areaServed: "Worldwide",
  sameAs: contact.social.map((s) => s.href),
};

export default function Home() {
  const picks = featured.map((id) => projects.find((p) => p.id === id)!);

  return (
    <Page>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <HeroIntro />
      <HomeHero />

      <section className="bp-sec" id="services">
        <div className="bp-sechead">
          <span className="bp-kicker">What we do</span>
          <h2 className="bp-h2">
            Smart digital solutions. <span className="dim">Real business intent.</span>
          </h2>
          <p>We connect your online presence, customer communication and everyday workflows, so your business can work smarter.</p>
        </div>
        <div className="bp-rows">
          {services.map((s, i) => (
            <Link key={s.id} href={`/services#${s.id}`} className="bp-row">
              <span className="bp-row-k">
                0{i + 1} · {s.kicker}
              </span>
              <span className="bp-row-t">{s.short}</span>
              <span className="bp-row-s">{s.line}</span>
              <ArrowUpRight size={24} className="bp-row-a" />
            </Link>
          ))}
        </div>
      </section>

      <section className="bp-sec">
        <div className="bp-statement">
          <p className="bp-big">
            Not more tools. <span className="dim">Better systems.</span>
          </p>
          <div className="bp-principle">
            <span className="bp-kicker">Our guiding principle</span>
            <strong>
              <em>Useful first.</em> Clever second.
            </strong>
            <p>Technology should solve a real business problem. We start with your goals, find the friction, and build what makes sense for your team.</p>
          </div>
        </div>
      </section>

      <section className="bp-sec" id="process">
        <div className="bp-sechead">
          <span className="bp-kicker">How we work</span>
          <h2 className="bp-h2">From first idea to forward momentum.</h2>
        </div>
        <ol className="bp-steps">
          {process4.map(({ t, d }, i) => (
            <li key={t}>
              <span className="bp-steps-n">0{i + 1}</span>
              <span className="bp-steps-t">{t}</span>
              <span className="bp-steps-d">{d}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="bp-sec" id="work">
        <div className="bp-sechead">
          <span className="bp-kicker">Selected work</span>
          <h2 className="bp-h2">
            Built for different <span className="dim">business needs.</span>
          </h2>
          <p>Websites and demos across different industries. Open any of them to see it live.</p>
        </div>
        <WorkRows items={picks} />
        <div>
          <Link href="/work" className="bp-btn secondary">
            All eight projects <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <CtaBand head={ctas.home} />
    </Page>
  );
}
