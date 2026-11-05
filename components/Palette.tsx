"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CornerDownLeft, Search } from "lucide-react";
import { contact, pages, projects, services, waLink } from "@/content/site";
import { getAccent, getBlue, getTheme, setAccent, setTheme } from "./prefs";

/*
 * ⌘K (Crambook's palette, cut down): every page, service and project, plus the few things people
 * come to do: message on WhatsApp, copy the email, switch theme or accent. One static index, so
 * it searches instantly and needs no server.
 */
type Item = {
  key: string;
  group: string;
  tag: string;
  title: string;
  sub: string;
  href?: string;
  ext?: boolean;
  act?: () => void;
};

function items(): Item[] {
  return [
    ...pages.map((p, i) => ({
      key: `p-${p.id}`,
      group: "Pages",
      tag: `0${i + 1}`,
      title: p.label,
      sub: p.href,
      href: p.href,
    })),
    ...services.map((s, i) => ({
      key: `s-${s.id}`,
      group: "Services",
      tag: `S0${i + 1}`,
      title: s.title,
      sub: s.line,
      href: `/services#${s.id}`,
    })),
    ...projects.map((p) => ({
      key: `w-${p.id}`,
      group: "Work",
      tag: p.kind,
      title: p.name,
      sub: `${p.sector} · ${p.about}`,
      href: p.href,
      ext: true,
    })),
    {
      key: "a-wa",
      group: "Actions",
      tag: "Chat",
      title: "Message on WhatsApp",
      sub: contact.phone,
      href: waLink(),
      ext: true,
    },
    {
      key: "a-mail",
      group: "Actions",
      tag: "Copy",
      title: "Copy email address",
      sub: contact.email,
      act: () => navigator.clipboard?.writeText(contact.email).catch(() => {}),
    },
    {
      key: "a-theme",
      group: "Actions",
      tag: "Theme",
      title: "Switch light / dark",
      sub: "Also on the sun and moon in the nav",
      act: () => setTheme(getTheme() === "dark" ? "light" : "dark"),
    },
    {
      key: "a-accent",
      group: "Actions",
      tag: "Accent",
      title: "Switch blue / ember",
      sub: "The one accent colour, everywhere",
      act: () => setAccent(getAccent() === "ember" ? getBlue() : "ember"),
    },
  ];
}

const DEFAULT = [
  "p-services",
  "p-work",
  "p-contact",
  "a-wa",
  "a-mail",
  "a-theme",
];

function rank(all: Item[], q: string): Item[] {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return DEFAULT.map((k) => all.find((x) => x.key === k)!);
  return all
    .map((x) => {
      const title = x.title.toLowerCase();
      const hay = `${title} ${x.sub} ${x.tag} ${x.group}`.toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return null;
      const score = terms.reduce(
        (s, t) => s + (title.startsWith(t) ? 6 : title.includes(t) ? 4 : 1),
        0,
      );
      return { x, score };
    })
    .filter((h): h is { x: Item; score: number } => !!h)
    .sort((a, b) => b.score - a.score)
    .map((h) => h.x);
}

export default function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [pi, setPi] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const all = useMemo(() => items(), []);
  const hits = useMemo(() => rank(all, q), [all, q]);
  const groups = useMemo(() => {
    const out: { label: string; items: Item[] }[] = [];
    for (const h of hits) {
      const g =
        out.find((x) => x.label === h.group) ??
        out[out.push({ label: h.group, items: [] }) - 1];
      g.items.push(h);
    }
    return out;
  }, [hits]);
  const flat = groups.flatMap((g) => g.items);

  useEffect(() => {
    input.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    list.current
      ?.querySelector<HTMLElement>('[data-on="1"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [pi]);

  function run(it: Item) {
    onClose();
    if (it.act) it.act();
    else if (it.ext) window.open(it.href, "_blank", "noopener,noreferrer");
    else if (it.href) router.push(it.href);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setPi((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setPi((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = flat[pi];
      if (it) run(it);
    }
  }

  let k = -1;
  // Portalled: the scrolled nav's backdrop-filter would otherwise trap this fixed layer inside it.
  return createPortal(
    <div className="bp-scrim" onClick={onClose}>
      <div
        className="bp-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bp-palhead">
          <Search size={17} aria-hidden />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPi(0);
            }}
            onKeyDown={onKey}
            placeholder="Pages, services, projects…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="bp-pallist"
            aria-activedescendant={
              flat[pi] ? `bp-pal-${flat[pi].key}` : undefined
            }
          />
          <span className="bp-kbd">esc</span>
        </div>
        <div className="bp-pallist" id="bp-pallist" role="listbox" ref={list}>
          {groups.map((g) => (
            <div key={g.label} role="group" aria-label={g.label}>
              <div className="bp-palgroup">
                {q.trim() ? g.label : g.label === "Pages" ? "Jump to" : g.label}
              </div>
              {g.items.map((it) => {
                k += 1;
                const i = k;
                return (
                  <button
                    key={it.key}
                    id={`bp-pal-${it.key}`}
                    role="option"
                    aria-selected={i === pi}
                    type="button"
                    className="bp-palitem"
                    data-on={i === pi ? "1" : "0"}
                    onMouseMove={() => setPi(i)}
                    onClick={() => run(it)}
                  >
                    <span className="bp-paltag">{it.tag}</span>
                    <span className="bp-paltext">
                      <span>{it.title}</span>
                      <span>{it.sub}</span>
                    </span>
                    {it.ext ? (
                      <ArrowUpRight size={15} className="bp-palgo" />
                    ) : (
                      i === pi && (
                        <CornerDownLeft size={14} className="bp-palgo" />
                      )
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {!flat.length && (
            <div className="bp-palempty">
              Nothing matches “{q.trim()}”. Try a service or an industry, like
              “bakery” or “WhatsApp”.
            </div>
          )}
        </div>
        <div className="bp-palfoot">
          <span>
            <b>↑↓</b> move
          </span>
          <span>
            <b>↵</b> open
          </span>
          <span>
            <b>esc</b> close
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
