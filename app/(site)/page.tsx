import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { brand, contact, featured, projects } from "@/content/site";
import HeroIntro from "@/components/HeroIntro";
import HomeHero from "@/components/HomeHero";
import Page from "@/components/Page";
import WorkRows from "@/components/WorkRows";
import ServicePoster from "@/components/ServicePoster";
import SystemScene from "@/components/SystemScene";
import Coda from "@/components/Coda";

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

      <ServicePoster />
      <SystemScene />
      <section className="bp-sec" id="work">
        <div className="bp-work-head">
          <div className="bp-sechead">
            <span className="bp-kicker">Selected work</span>
            <h2 className="bp-h2">
              Built for different <span className="dim">business needs.</span>
            </h2>
          </div>
          <Link href="/work" className="bp-btn secondary">
            All eight projects <ArrowRight size={16} />
          </Link>
        </div>
        <WorkRows items={picks} />
      </section>
      <Coda />
    </Page>
  );
}
