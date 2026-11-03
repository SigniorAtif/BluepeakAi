"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand, contact, pages, services, waLink } from "@/content/site";
import { Wordmark } from "./Wordmark";
import FooterMark from "./FooterMark";
import { isActive } from "./SiteNav";

/*
 * The footer, from Orbit: a mono rule line with the coordinates, the email as one huge link, the
 * pages as numbered rows (minus the one you're on), and the name rising out of the bottom edge.
 * "band" sits on a raised surface (home); "plain" sits on the page colour.
 */
// The three core services, short enough to sit on one line at every width; the rest are a click away.
const footServices = services
  .filter((s) => ["websites", "automation", "whatsapp"].includes(s.id))
  .map((s) => ({ ...s, short: s.id === "websites" ? "Websites" : s.short }));

export default function SiteFooter() {
  const path = usePathname() || "/";
  const variant = path === "/" ? "band" : "plain";
  const rows = pages.filter((p) => p.id !== "home" && !isActive(path, p.href));

  return (
    <footer className="bp-foot" data-variant={variant}>
      <div className="bp-footin">
        <div className="bp-foot-rule bp-mono">
          <span className="end">End //</span>
          <Link href="/" className="bp-logo" aria-label="BluePeakAI home">
            <Wordmark />
          </Link>
          <span className="bar" />
          <span className="coords">{brand.coords}</span>
        </div>

        <div className="bp-foot-grid">
          <div className="bp-foot-left">
            <div className="bp-mono">Projects, questions, anything · message us</div>
            <a href={`mailto:${contact.email}`} className="bp-foot-big">
              {contact.email}
              <span className="bp-arrow">↗</span>
            </a>
            <div className="bp-foot-links">
              <a href={waLink()} target="_blank" rel="noopener noreferrer">
                WhatsApp {contact.phone}
              </a>
              {contact.social.map((s) => (
                <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div className="bp-foot-right">
            <nav aria-label="Footer" className="bp-foot-nav">
              {rows.map((p, i) => (
                <Link key={p.href} href={p.href}>
                  <span className="bp-mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="grow">{p.label}</span>
                  <span className="bp-arrow">↗</span>
                </Link>
              ))}
            </nav>
            <div className="bp-foot-svc bp-mono">
              {footServices.map((s) => (
                <Link key={s.id} href={`/services#${s.id}`}>
                  {s.short}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="bp-foot-base bp-mono">
          <span>© {new Date().getFullYear()} BluePeakAI</span>
          <span>{brand.sign}</span>
          <span className="sep">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </span>
        </div>
      </div>
      <FooterMark />
    </footer>
  );
}
