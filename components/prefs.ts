/*
 * The reader's theme and accent. Both live on <html> as data attributes, set before first paint by
 * BOOT so the page never flashes the wrong palette. Ported from Crambook's theme.ts; the accent is new.
 */
export type Theme = "dark" | "light";
export type Blue = "glacier" | "cobalt" | "dusk";
export type Accent = Blue | "ember";

export const BLUES: Blue[] = ["glacier", "cobalt", "dusk"];
/** The blue the site ships with. The accent toggle flips between it and ember. */
export const DEFAULT_BLUE: Blue = "glacier";

const THEME_KEY = "bp.theme";
const ACCENT_KEY = "bp.accent";
const BLUE_KEY = "bp.blue";
const EVENT = "bp:prefs";

export const BOOT = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('${THEME_KEY}');d.setAttribute('data-theme',t==='light'?'light':'dark');var b=localStorage.getItem('${BLUE_KEY}')||'${DEFAULT_BLUE}';var a=localStorage.getItem('${ACCENT_KEY}')==='ember'?'ember':b;var q=new URLSearchParams(location.search).get('accent');if(q)a=q;d.setAttribute('data-accent',a);}catch(e){d.setAttribute('data-theme','dark');d.setAttribute('data-accent','${DEFAULT_BLUE}');}})();`;

/** Run in <head> on a cold load of the home page: hides the intro's actors before paint. */
export const INTRO_GUARD = `if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){try{if(!sessionStorage.getItem("bp.intro")){document.documentElement.classList.add("js-intro");setTimeout(function(){if(!window.__bpIntro)document.documentElement.classList.remove("js-intro")},5000)}}catch(e){}}`;

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

export const getTheme = (): Theme => (typeof document !== "undefined" && document.documentElement.dataset.theme === "light" ? "light" : "dark");
export const getAccent = (): Accent => (typeof document !== "undefined" ? ((document.documentElement.dataset.accent as Accent) ?? DEFAULT_BLUE) : DEFAULT_BLUE);
export const getBlue = (): Blue => {
  const a = getAccent();
  if (a !== "ember") return a;
  const b = read(BLUE_KEY) as Blue | null;
  return b && BLUES.includes(b) ? b : DEFAULT_BLUE;
};

/**
 * Repaints through a view transition: the new palette spreads as a circle from `from` (the button
 * that asked for it), the old one stays put underneath. Without support or with reduced motion,
 * it simply switches.
 */
function repaint(apply: () => void, from?: { x: number; y: number }) {
  const root = document.documentElement;
  const done = () => {
    apply();
    window.dispatchEvent(new Event(EVENT));
  };
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    done();
    return;
  }
  const x = from?.x ?? innerWidth / 2;
  const y = from?.y ?? 0;
  root.style.setProperty("--sx", `${x}px`);
  root.style.setProperty("--sy", `${y}px`);
  root.style.setProperty("--sr", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
  root.classList.add("bp-swapping");
  document.startViewTransition(done).finished.finally(() => root.classList.remove("bp-swapping"));
}

export function setTheme(t: Theme, from?: { x: number; y: number }) {
  write(THEME_KEY, t);
  repaint(() => document.documentElement.setAttribute("data-theme", t), from);
}

export function setAccent(a: Accent, from?: { x: number; y: number }) {
  write(ACCENT_KEY, a === "ember" ? "ember" : "blue");
  if (a !== "ember") write(BLUE_KEY, a);
  repaint(() => document.documentElement.setAttribute("data-accent", a), from);
}

export function subscribePrefs(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

/** Centre of the element that fired an event, for the reveal's origin. */
export const originOf = (e: { currentTarget: EventTarget }) => {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};
