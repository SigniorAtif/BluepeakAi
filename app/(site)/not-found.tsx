import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { pages } from "@/content/site";

export default function NotFound() {
  return (
    <header className="bp-phead bp-404">
      <p className="bp-eyebrow">
        <i />
        404 · Page not found
      </p>
      <h1 className="bp-title">
        This page isn&apos;t here. <span className="dim">The rest of the site is.</span>
      </h1>
      <div className="bp-rows">
        {pages.map((p, i) => (
          <Link key={p.id} href={p.href} className="bp-row">
            <span className="bp-row-k">0{i + 1}</span>
            <span className="bp-row-t">{p.label}</span>
            <ArrowUpRight size={22} className="bp-row-a" />
          </Link>
        ))}
      </div>
    </header>
  );
}
