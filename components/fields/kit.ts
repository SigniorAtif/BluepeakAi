/*
 * What the hero fields share: where they sit on each page, their colours, and the eases.
 * The field stays mounted across routes (it lives in the site layout) and glides between these
 * regions, the way Crambook's graph glides from the landing hero to the sign-in split.
 */

export type Mode = "home" | "band" | "split";
export type Region = { x0: number; y0: number; x1: number; y1: number; a: number };

export const BLOOM = "bp:bloom";

export const modeFor = (path: string): Mode => (path === "/" ? "home" : path === "/contact" ? "split" : "band");

/** The field's box in px for a mode, and how strongly it draws there (`a`). */
export function regionFor(mode: Mode, w: number, h: number): Region {
  const wide = w >= 900;
  if (mode === "home")
    return wide ? { x0: w * 0.44, y0: h * 0.04, x1: w * 1.02, y1: h * 0.98, a: 1 } : { x0: -w * 0.04, y0: h * 0.66, x1: w * 1.04, y1: h * 1.08, a: 0.8 };
  if (mode === "split")
    return wide ? { x0: -w * 0.06, y0: h * 0.12, x1: w * 0.48, y1: h * 1.05, a: 0.75 } : { x0: w * 0.1, y0: -h * 0.04, x1: w * 1.1, y1: h * 0.38, a: 0.45 };
  return wide ? { x0: w * 0.52, y0: -h * 0.12, x1: w * 1.06, y1: h * 0.66, a: 0.55 } : { x0: w * 0.1, y0: -h * 0.04, x1: w * 1.1, y1: h * 0.38, a: 0.45 };
}

export const lerpRegion = (a: Region, b: Region, k: number): Region => ({
  x0: a.x0 + (b.x0 - a.x0) * k,
  y0: a.y0 + (b.y0 - a.y0) * k,
  x1: a.x1 + (b.x1 - a.x1) * k,
  y1: a.y1 + (b.y1 - a.y1) * k,
  a: a.a + (b.a - a.a) * k,
});

export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInOutQuint = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function rgb(v: string): string {
  const h = v.trim().replace("#", "");
  const x = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(x, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export type Colors = { bg: string; line: string; dot: string; hot: string; text: string; faint: string; mono: string };

/** Theme colours as "r,g,b" strings for rgba(); re-read whenever the theme or accent flips. */
export function readColors(): Colors {
  const cs = getComputedStyle(document.documentElement);
  return {
    bg: rgb(cs.getPropertyValue("--bg")),
    line: rgb(cs.getPropertyValue("--field-line")),
    dot: rgb(cs.getPropertyValue("--field-dot")),
    hot: rgb(cs.getPropertyValue("--accent")),
    text: rgb(cs.getPropertyValue("--text")),
    faint: rgb(cs.getPropertyValue("--text-faint")),
    mono: cs.getPropertyValue("--font-mono").trim() || "monospace",
  };
}

export function watchColors(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent"] });
  return () => mo.disconnect();
}

/** Deterministic random, so every load draws the same mountain. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
