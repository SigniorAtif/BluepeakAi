"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { services } from "@/content/site";
import Marquee from "./Marquee";
import { useVariant } from "./variant";

/** The home hero. The headline's three flip words are the intro's seed phrase. */
export default function HomeHero() {
  const variant = useVariant();
  return (
    <>
      <header className="bp-hero" data-field={variant === "c" ? "0" : "1"} data-variant={variant}>
        <p className="bp-eyebrow js-i-fade">
          <i />
          Vadodara · websites · AI · WhatsApp
        </p>
        <h1 className="bp-display">
          <span className="js-i-flip">Ideas</span> <span className="js-i-flip">that</span> <span className="js-i-flip hl">automate.</span>{" "}
          <span className="js-i-chars">Strategies that grow.</span>
        </h1>
        <div className="bp-hero-row js-i-fade">
        <p className="bp-lede">
          We build websites, AI-powered systems and smarter customer journeys that help businesses win more enquiries, save time and grow with
          confidence.
        </p>
        <div className="bp-ctas">
          <Link href="/contact" className="bp-btn primary lg">
            Let&apos;s build something <ArrowUpRight size={17} className="nudge" />
          </Link>
          <Link href="/work" className="bp-btn secondary lg">
            Explore our work <ArrowDown size={16} />
          </Link>
        </div>
        </div>
        <p className="bp-hero-foot js-i-fade">Strategy-led. Built around your business. Designed to scale.</p>
      </header>
      {variant === "c" && (
        <div className="js-i-fade">
          <Marquee items={services.map((s) => s.short)} />
        </div>
      )}
    </>
  );
}
