import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { waLink, type Head } from "@/content/site";

/** The closing band every page ends on: a call, or straight to WhatsApp. */
export default function CtaBand({ head }: { head: Head }) {
  return (
    <section className="bp-sec">
      <div className="bp-cta">
        <span className="bp-kicker">{head.kicker}</span>
        <h2 className="bp-h2">
          {head.title[0]} <span className="dim">{head.title[1]}</span>
        </h2>
        <p className="bp-lede">{head.lede}</p>
        <div className="bp-ctas">
          <Link href="/contact" className="bp-btn primary lg">
            Discuss a project <ArrowUpRight size={17} className="nudge" />
          </Link>
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="bp-btn secondary lg">
            Message on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
