"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { ArrowUpRight, Menu, Moon, Search, Sun, X } from "lucide-react";
import { pages } from "@/content/site";
import { Wordmark } from "./Wordmark";
import {
  getAccent,
  getTheme,
  originOf,
  restorePrefs,
  setTheme,
  subscribePrefs,
} from "./prefs";
import { glide } from "./motion";
import Palette from "./Palette";

const links = pages.filter((p) => p.id !== "home" && p.id !== "contact");

export const isActive = (path: string, href: string) =>
  href === "/" ? path === "/" : path === href || path.startsWith(href + "/");

/** A store that never changes, for values only the browser knows (the platform's shortcut key). */
const still = () => () => {};

export function usePrefs() {
  const theme = useSyncExternalStore(
    subscribePrefs,
    getTheme,
    () => "dark" as const,
  );
  const accent = useSyncExternalStore(
    subscribePrefs,
    getAccent,
    () => "glacier" as const,
  );
  return { theme, accent };
}

export function PrefToggles() {
  const { theme } = usePrefs();
  return (
    <button
      type="button"
      className="bp-iconbtn"
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      onClick={(e) =>
        setTheme(theme === "dark" ? "light" : "dark", originOf(e))
      }
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export default function SiteNav() {
  const path = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [pal, setPal] = useState(false);
  const mod = useSyncExternalStore(
    still,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K"),
    () => "⌘K",
  );

  // ⌘K or Ctrl+K toggles the palette; "/" opens it unless you're typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPal((v) => !v);
        return;
      }
      const t = e.target as HTMLElement | null;
      const typing =
        !!t &&
        (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName));
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setPal(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useLayoutEffect(restorePrefs, []);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // The sheet closes on navigation: reset during render when the path changes.
  const [shownAt, setShownAt] = useState(path);
  if (shownAt !== path) {
    setShownAt(path);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pill = hover ?? links.find((l) => isActive(path, l.href))?.href ?? null;

  return (
    <header className="bp-nav" data-scrolled={scrolled ? "1" : "0"}>
      <div className="bp-navin">
        <Link href="/" aria-label="BluePeakAI home" className="bp-logo js-logo">
          <Wordmark />
        </Link>
        <nav
          className="bp-navlinks js-i-fade-top"
          aria-label="Main"
          onMouseLeave={() => setHover(null)}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="bp-navlink"
              data-active={isActive(path, l.href) ? "1" : "0"}
              aria-current={isActive(path, l.href) ? "page" : undefined}
              onMouseEnter={() => setHover(l.href)}
            >
              {pill === l.href && (
                <motion.span
                  layoutId="bp-navpill"
                  className="bp-navpill"
                  transition={glide}
                />
              )}
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="bp-navtools js-i-fade-top">
          <button
            type="button"
            className="bp-iconbtn bp-searchbtn"
            aria-label="Search the site"
            title={`Search (${mod})`}
            onClick={() => setPal(true)}
          >
            <Search size={17} />
            <span className="bp-kbd bp-navk">{mod}</span>
          </button>
          <PrefToggles />
          <button
            type="button"
            className="bp-iconbtn bp-menubtn"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={19} />
          </button>
        </div>
        <Link
          href="/contact"
          className="bp-btn light sm sweep bp-navcta js-i-fade-top"
        >
          Let&apos;s talk <ArrowUpRight size={15} className="nudge" />
        </Link>
      </div>

      {pal && <Palette onClose={() => setPal(false)} />}

      {open &&
        createPortal(
          <motion.div
            className="bp-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bp-sheet-top">
              <Link href="/" className="bp-logo" onClick={() => setOpen(false)}>
                <Wordmark />
              </Link>
              <button
                type="button"
                className="bp-iconbtn"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                autoFocus
              >
                <X size={20} />
              </button>
            </div>
            <nav aria-label="Menu">
              {pages.map((p, i) => (
                <motion.span
                  key={p.href}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.12 + i * 0.04,
                  }}
                >
                  <Link
                    href={p.href}
                    data-active={isActive(path, p.href) ? "1" : "0"}
                    onClick={() => setOpen(false)}
                    style={{ display: "flex" }}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {p.label}
                  </Link>
                </motion.span>
              ))}
            </nav>
            <div className="bp-sheet-foot">
              <div style={{ display: "flex", gap: ".25rem" }}>
                <PrefToggles />
              </div>
            </div>
          </motion.div>,
          document.body,
        )}
    </header>
  );
}
