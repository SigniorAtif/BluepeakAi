"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { Island } from "@/lib/graph";
import type { Unit } from "@/lib/field-layout";
import { rng } from "@/lib/field-layout";
import { BLOOM, modeFor, type Mode } from "./kit";

/*
 * The home page's background (Crambook's AtlasField, re-pointed): every section of BluePeakAI's
 * eight live projects as a dot, every link those sites already have between sections as a line,
 * one island per industry. At rest it is barely there; the pointer lights the dots near it, and
 * the nearest one shows its project and section and opens the live site on click. With no
 * pointer about, it tours itself. It blooms out of the intro's seed phrase on `bp:bloom`, and
 * glides to a quieter place on the other pages.
 */

type Node = { a: number; t: string; cite: string; href: string; x: number; y: number; fx: number; fy: number; gx: number; gy: number; lag: number; deg: number; ph: number; ox: number; oy: number };

/** Where each island sits (centre and radius in px) for one mode, and how strongly the field draws. */
function islands(w: number, h: number, mode: Mode): { at: { cx: number; cy: number; r: number }[]; alpha: number } {
  const wide = w >= 900;
  const s = Math.min(w, h);
  const px = (l: [number, number, number][], x0 = 0, lw = w) => l.map(([cx, cy, r]) => ({ cx: x0 + cx * lw, cy: cy * h, r: r * s }));
  // Order: hospitality, industrial, retail, healthcare, legal.
  if (mode === "split")
    return wide
      ? { at: px([[0.32, 0.3, 0.15], [0.62, 0.62, 0.15], [0.2, 0.72, 0.12], [0.74, 0.24, 0.11], [0.47, 0.88, 0.08]], 0, w * 0.5), alpha: 0.85 }
      : { at: px([[0.2, 0.12, 0.13], [0.55, 0.2, 0.15], [0.86, 0.1, 0.1], [0.4, 0.33, 0.08], [0.82, 0.32, 0.07]]), alpha: 0.5 };
  if (mode === "band")
    return wide
      ? { at: px([[0.66, 0.2, 0.12], [0.87, 0.36, 0.13], [0.55, 0.42, 0.09], [0.94, 0.12, 0.08], [0.76, 0.5, 0.06]]), alpha: 0.6 }
      : { at: px([[0.2, 0.1, 0.12], [0.6, 0.16, 0.14], [0.9, 0.08, 0.09], [0.42, 0.3, 0.07], [0.85, 0.3, 0.06]]), alpha: 0.45 };
  return wide
    ? { at: px([[0.76, 0.31, 0.19], [0.84, 0.8, 0.18], [0.62, 0.83, 0.14], [0.92, 0.5, 0.12], [0.69, 0.56, 0.09]]), alpha: 1 }
    : { at: px([[0.24, 0.91, 0.12], [0.74, 0.92, 0.13], [0.5, 0.985, 0.07], [0.84, 0.13, 0.08], [0.6, 0.12, 0.05]]), alpha: 0.85 };
}

function rgb(hex: string): string {
  const h = hex.trim().replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutQuint = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);
const MORPH = 1.25;

/** `units` is each island laid out by `fieldLayout` on the server, so phones skip the simulation. */
export default function SiteField({ graphs, units }: { graphs: Island[]; units: Unit[][] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tip = useRef<HTMLAnchorElement>(null);
  const caps = useRef<(HTMLSpanElement | null)[]>([]);
  const sum = useRef<HTMLSpanElement>(null);
  const mode = modeFor(usePathname() || "/");
  const modeRef = useRef<Mode>(mode);
  const retarget = useRef<(m: Mode) => void>(() => {});
  // A layout effect, so the islands start gliding in the same commit as the page swap.
  useLayoutEffect(() => {
    if (modeRef.current === mode) return;
    modeRef.current = mode;
    retarget.current(mode);
  }, [mode]);

  useEffect(() => {
    const el = canvas.current;
    const box = wrap.current;
    const label = tip.current;
    const ctx = el?.getContext("2d");
    if (!el || !box || !label || !ctx) return;

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes: Node[] = [];
    const links: [number, number][] = [];
    const r = rng(42);
    graphs.forEach((g, a) => {
      const base = nodes.length;
      g.nodes.forEach((n) => nodes.push({ a, ...n, x: 0, y: 0, fx: 0, fy: 0, gx: 0, gy: 0, lag: r() * 0.28, deg: 0, ph: r() * Math.PI * 2, ox: 0, oy: 0 }));
      g.links.forEach(([i, j]) => {
        links.push([base + i, base + j]);
        nodes[base + i].deg++;
        nodes[base + j].deg++;
      });
    });
    const nbrs: number[][] = nodes.map(() => []);
    links.forEach(([i, j]) => {
      nbrs[i].push(j);
      nbrs[j].push(i);
    });

    let w = 0;
    let h = 0;
    let dpr = 1;
    let morphAt = -1;
    let alpha = 1;
    let alphaFrom = 1;
    let alphaTo = 1;
    let capsOn = modeRef.current === "home";
    const capAt = graphs.map(() => ({ x: 0, y: 0, fx: 0, fy: 0, gx: 0, gy: 0 }));
    const setCap = (a: number) => {
      const cap = caps.current[a];
      if (cap) cap.style.transform = `translate(${capAt[a].x}px, ${capAt[a].y}px)`;
    };
    /** Aim every dot at its spot for `m`; `now` snaps there, otherwise the next frames glide. */
    const aim = (m: Mode, now: boolean) => {
      const { at: isl, alpha: a2 } = islands(w, h, m);
      alphaFrom = alpha;
      alphaTo = a2;
      if (now || still) alpha = a2;
      capsOn = m === "home";
      let k = 0;
      graphs.forEach((g, a) => {
        const { cx, cy, r: rad } = isl[a];
        let top = Infinity;
        g.nodes.forEach((_, i) => {
          const n = nodes[k + i];
          n.fx = n.x;
          n.fy = n.y;
          n.gx = cx + units[a][i].x * rad;
          n.gy = cy + units[a][i].y * rad;
          if (now) {
            n.x = n.gx;
            n.y = n.gy;
          }
          top = Math.min(top, n.gy);
        });
        const c = capAt[a];
        c.fx = c.x;
        c.fy = c.y;
        c.gx = Math.min(Math.max(12, cx - rad), w - (caps.current[a]?.offsetWidth ?? 0) - 12);
        c.gy = Math.max(12, top - 26);
        if (now || still) {
          c.x = c.gx;
          c.y = c.gy;
          setCap(a);
        }
        const cap = caps.current[a];
        if (cap) cap.dataset.on = capsOn && bloomAt !== -1 ? "1" : "0";
        k += g.nodes.length;
      });
      if (sum.current) sum.current.dataset.on = capsOn && bloomAt !== -1 ? "1" : "0";
      morphAt = now || still ? -1 : performance.now();
    };
    let bloomAt = -1;
    const place = () => {
      const rect = box.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      aim(modeRef.current, true);
    };
    place();
    /** Where the tour and the bloom keep to, so nothing lands under the copy. */
    const region = () => {
      const wide = w >= 900;
      if (modeRef.current !== "home") return wide ? { x0: w * 0.5, x1: w, y0: 0, y1: h * 0.6, ox: w * 0.75, oy: h * 0.3 } : { x0: 0, x1: w, y0: 0, y1: h * 0.4, ox: w / 2, oy: h * 0.2 };
      return wide ? { x0: w * 0.6, x1: w, y0: 0, y1: h, ox: w / 2, oy: h * 0.52 } : { x0: 0, x1: w, y0: h * 0.7, y1: h, ox: w / 2, oy: h * 0.52 };
    };

    // Theme and accent colours, re-read when either flips.
    let C = { dot: "", line: "", hot: "", text: "" };
    const paint = () => {
      const cs = getComputedStyle(document.documentElement);
      C = {
        dot: rgb(cs.getPropertyValue("--field-dot")),
        line: rgb(cs.getPropertyValue("--field-line")),
        hot: rgb(cs.getPropertyValue("--accent")),
        text: rgb(cs.getPropertyValue("--text")),
      };
    };
    paint();
    const themeWatch = new MutationObserver(paint);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent"] });

    // Bloom: every dot flies out of the seed phrase to its place, nearest first.
    const origin = { x: 0, y: 0 };
    const bloom = () => {
      if (bloomAt !== -1) return;
      const R = region();
      origin.x = R.ox;
      origin.y = R.oy;
      bloomAt = still ? -Infinity : performance.now();
      box.dataset.on = "1";
      caps.current.forEach((c) => c && (c.dataset.on = capsOn ? "1" : "0"));
      if (sum.current) sum.current.dataset.on = capsOn ? "1" : "0";
    };
    if (document.documentElement.dataset.bloom === "1" || still || modeRef.current !== "home") bloom();
    window.addEventListener(BLOOM, bloom);
    const late = window.setTimeout(bloom, 6000);

    // Pointer, focus and the self-guided tour.
    const ptr = { x: -9999, y: -9999, live: false, at: 0 };
    let focus = -1;
    let shown = -1;
    let heat = 0;
    let tourAt = 0;
    const nearest = (x: number, y: number, max: number) => {
      let best = -1;
      let bd = max * max;
      for (let i = 0; i < nodes.length; i++) {
        const dx = nodes[i].x + nodes[i].ox - x;
        const dy = nodes[i].y + nodes[i].oy - y;
        const d = dx * dx + dy * dy;
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
      return best;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = box.getBoundingClientRect();
      ptr.x = e.clientX - rect.left;
      ptr.y = e.clientY - rect.top;
      ptr.live = ptr.y >= 0 && ptr.y <= h;
      ptr.at = performance.now();
      if (!ptr.live) return;
      const t = e.target as Element | null;
      const overUi = !!t?.closest("a:not(.bp-fieldtip),button,h1,p,nav,input,textarea,select,label,.bp-protobar");
      const hit = overUi ? -1 : nearest(ptr.x, ptr.y, 26);
      if (hit >= 0) focus = hit;
      else if (focus >= 0 && performance.now() - tourAt > 3200) focus = -1;
      document.body.style.cursor = hit >= 0 ? "pointer" : "";
    };
    const onLeave = () => {
      ptr.live = false;
      document.body.style.cursor = "";
    };
    const onClick = (e: MouseEvent) => {
      if (!ptr.live || focus < 0) return;
      if ((e.target as Element | null)?.closest("a,button,input,select,textarea")) return;
      const n = nodes[focus];
      if (Math.hypot(n.x + n.ox - ptr.x, n.y + n.oy - ptr.y) > 26) return;
      window.open(n.href, "_blank", "noopener,noreferrer");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("click", onClick);

    const showTip = (i: number) => {
      if (i === shown) return;
      shown = i;
      if (i < 0) {
        label.dataset.on = "0";
        return;
      }
      const n = nodes[i];
      label.href = n.href;
      (label.children[0] as HTMLElement).textContent = n.cite;
      (label.children[1] as HTMLElement).textContent = n.t;
      label.dataset.on = "1";
    };

    const tour = (now: number) => {
      if (ptr.live && now - ptr.at < 2500) return;
      if (now - tourAt < 2900) return;
      tourAt = now;
      const pick: number[] = [];
      const R = region();
      nodes.forEach((n, i) => {
        if (n.deg < 3) return;
        if (n.x < R.x0 + 40 || n.x > R.x1 - 40 || n.y < R.y0 + 20 || n.y > R.y1 - 20) return;
        pick.push(i);
      });
      if (pick.length) focus = pick[Math.floor(Math.random() * pick.length)];
    };

    let raf = 0;
    let visible = true;
    const frame = (now: number) => {
      raf = 0;
      const t = now / 1000;
      const sy = window.scrollY;
      box.style.transform = `translate3d(0,${sy * 0.35}px,0)`;
      box.style.opacity = String(Math.max(0, 1 - sy / (h * 0.85)));

      if (bloomAt >= 0 || bloomAt === -Infinity) tour(now);
      heat += ((focus >= 0 ? 1 : 0) - heat) * 0.12;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const born = bloomAt === -Infinity ? Infinity : bloomAt < 0 ? -1 : (now - bloomAt) / 1000;
      if (born < 0) {
        raf = requestAnimationFrame(frame);
        return;
      }

      // Page change: each dot glides to its new spot, a little out of step with the others.
      if (morphAt >= 0) {
        const m = (now - morphAt) / 1000;
        let done = true;
        for (const n of nodes) {
          const k = Math.min(1, Math.max(0, (m - n.lag) / MORPH));
          if (k < 1) done = false;
          const e = easeInOutQuint(k);
          n.x = n.fx + (n.gx - n.fx) * e;
          n.y = n.fy + (n.gy - n.fy) * e;
        }
        const e = easeInOutQuint(Math.min(1, Math.max(0, (m - 0.14) / MORPH)));
        alpha = alphaFrom + (alphaTo - alphaFrom) * e;
        capAt.forEach((c, a) => {
          c.x = c.fx + (c.gx - c.fx) * e;
          c.y = c.fy + (c.gy - c.fy) * e;
          setCap(a);
        });
        if (done) morphAt = -1;
      }

      // Positions: drift, pointer push, bloom.
      const P: { x: number; y: number; b: number }[] = new Array(nodes.length);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let tx = 0;
        let ty = 0;
        if (ptr.live && !still) {
          const dx = n.x - ptr.x;
          const dy = n.y - ptr.y;
          const d = Math.hypot(dx, dy);
          if (d < 140 && d > 0.01) {
            const f = (1 - d / 140) ** 2 * 18;
            tx = (dx / d) * f;
            ty = (dy / d) * f;
          }
        }
        n.ox += (tx - n.ox) * 0.1;
        n.oy += (ty - n.oy) * 0.1;
        const dfx = still ? 0 : Math.sin(t * 0.35 + n.ph) * 3.2;
        const dfy = still ? 0 : Math.cos(t * 0.29 + n.ph * 1.3) * 3.2;
        const x = n.x + n.ox + dfx;
        const y = n.y + n.oy + dfy;
        const dist = Math.hypot(n.x - origin.x, n.y - origin.y);
        const b = born === Infinity ? 1 : easeOutExpo(Math.min(1, Math.max(0, (born - dist / 2600) / 1.5)));
        P[i] = { x: origin.x + (x - origin.x) * b, y: origin.y + (y - origin.y) * b, b: b * alpha };
      }

      const torch = (x: number, y: number) => {
        if (!ptr.live) return 0;
        const d = Math.hypot(x - ptr.x, y - ptr.y);
        return d > 220 ? 0 : (1 - d / 220) ** 1.6;
      };

      // Links.
      ctx.lineWidth = 1;
      for (const [i, j] of links) {
        const a = P[i];
        const b = P[j];
        const life = Math.min(a.b, b.b);
        if (life < 0.05) continue;
        const hot = focus >= 0 && (i === focus || j === focus);
        if (hot) continue;
        const lit = torch((a.x + b.x) / 2, (a.y + b.y) / 2);
        ctx.strokeStyle = `rgba(${C.line},${(0.5 + lit * 0.5) * life * (1 - heat * 0.35)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Dots.
      for (let i = 0; i < nodes.length; i++) {
        const p = P[i];
        if (p.b < 0.02) continue;
        const lit = torch(p.x, p.y);
        const rad = 1.1 + Math.min(nodes[i].deg, 10) * 0.16 + lit * 0.9;
        ctx.fillStyle = `rgba(${lit > 0.5 ? C.text : C.dot},${(0.5 + lit * 0.5) * p.b})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // The focused dot: its links and neighbours in the accent.
      if (focus >= 0 && heat > 0.02) {
        const f = P[focus];
        ctx.lineWidth = 1.25;
        for (const j of nbrs[focus]) {
          const q = P[j];
          ctx.strokeStyle = `rgba(${C.hot},${0.75 * heat})`;
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
          ctx.fillStyle = `rgba(${C.hot},${0.9 * heat})`;
          ctx.beginPath();
          ctx.arc(q.x, q.y, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
        const pulse = still ? 0 : (Math.sin(t * 3) + 1) / 2;
        ctx.fillStyle = `rgba(${C.hot},${0.16 * heat})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 9 + pulse * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${C.hot},${heat})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3.6, 0, Math.PI * 2);
        ctx.fill();

        // Prefer the right of the dot (away from the headline); flip only when it would run off.
        const tw = label.offsetWidth;
        const th = label.offsetHeight;
        const lx = f.x + 16 + tw <= w - 12 ? f.x + 16 : f.x - 16 - tw;
        const x = Math.min(Math.max(12, lx), w - tw - 12);
        const y = Math.min(Math.max(12, f.y - th / 2), h - th - 12);
        label.style.transform = `translate(${x}px, ${y}px)`;
      }
      showTip(alpha > 0.5 ? focus : -1);

      if (visible) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(box);
    const onVis = () => start();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("scroll", start, { passive: true });

    retarget.current = (m: Mode) => {
      focus = -1;
      aim(m, false);
      start();
    };

    const ro = new ResizeObserver(() => {
      place();
      start();
    });
    ro.observe(box);
    start();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(late);
      window.removeEventListener(BLOOM, bloom);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", start);
      document.removeEventListener("visibilitychange", onVis);
      themeWatch.disconnect();
      io.disconnect();
      ro.disconnect();
      document.body.style.cursor = "";
    };
  }, [graphs, units]);

  const total = graphs.reduce((s, g) => s + g.nodes.length, 0);
  const sites = graphs.reduce((s, g) => s + g.sites, 0);
  return (
    <div ref={wrap} className="bp-field" aria-hidden>
      <canvas ref={canvas} />
      {graphs.map((g, a) => (
        <span key={g.id} ref={(n) => void (caps.current[a] = n)} className="bp-fieldcap">
          {g.label} · {g.nodes.length}
        </span>
      ))}
      <a ref={tip} className="bp-fieldtip" data-on="0" tabIndex={-1} href="#" target="_blank" rel="noopener noreferrer">
        <span />
        <span />
      </a>
      <span ref={sum} className="bp-fieldsum">
        {sites} live projects · {total} sections · {graphs.reduce((s, g) => s + g.links.length, 0)} links between them
      </span>
    </div>
  );
}
