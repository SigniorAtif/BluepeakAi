"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BLOOM, clamp01, easeInOutQuint, easeOutExpo, lerpRegion, modeFor, readColors, regionFor, rng, watchColors, type Mode, type Region } from "./kit";

/*
 * Variant B, the journey graph. Crambook's note graph remapped onto a customer journey: where
 * people come from, where they land, how the conversation carries on, and where it ends up. Small
 * dots (enquiries) travel the links and pick a path at each stop. Hovering a stop names the
 * service behind it; clicking opens it. A faint lattice under it all brightens near the pointer.
 */

type Stop = { id: string; label: string; u: number; v: number; href?: string; service?: string };

const STOPS: Stop[] = [
  { id: "ig", label: "Instagram", u: 0.082, v: 0.24, href: "/services#social", service: "Social media" },
  { id: "search", label: "Search", u: 0.064, v: 0.52, href: "/services#websites", service: "On-page SEO" },
  { id: "word", label: "Word of mouth", u: 0.099, v: 0.8 },
  { id: "site", label: "Website", u: 0.314, v: 0.36, href: "/services#websites", service: "Business websites" },
  { id: "landing", label: "Landing page", u: 0.288, v: 0.68, href: "/services#websites", service: "Landing pages" },
  { id: "bot", label: "Chatbot", u: 0.512, v: 0.2, href: "/services#automation", service: "AI automation & chatbots" },
  { id: "wa", label: "WhatsApp", u: 0.529, v: 0.56, href: "/services#whatsapp", service: "WhatsApp systems" },
  { id: "follow", label: "Follow-up", u: 0.701, v: 0.34, href: "/services#whatsapp", service: "Reminder & follow-up journeys" },
  { id: "crm", label: "CRM", u: 0.718, v: 0.74, href: "/services#connected", service: "Connected business journeys" },
  { id: "client", label: "Customer", u: 0.847, v: 0.52, href: "/contact", service: "Start a conversation" },
];
const LINKS: [string, string][] = [
  ["ig", "site"], ["ig", "wa"], ["search", "site"], ["search", "landing"], ["word", "wa"], ["word", "landing"],
  ["site", "bot"], ["site", "wa"], ["landing", "wa"], ["bot", "wa"], ["bot", "follow"],
  ["wa", "follow"], ["wa", "crm"], ["follow", "client"], ["crm", "client"], ["bot", "crm"],
];
const SOURCES = [0, 1, 2];
const GLIDE = 1.25;

type Dot = { link: number; t: number; speed: number };

export default function JourneyField() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tip = useRef<HTMLAnchorElement>(null);
  const caps = useRef<(HTMLSpanElement | null)[]>([]);
  const router = useRouter();
  const mode = modeFor(usePathname() || "/");
  const modeRef = useRef<Mode>(mode);
  const retarget = useRef<(m: Mode) => void>(() => {});

  useLayoutEffect(() => {
    if (modeRef.current === mode) return;
    modeRef.current = mode;
    retarget.current(mode);
  }, [mode]);

  useEffect(() => {
    const box = wrap.current;
    const el = canvas.current;
    const label = tip.current;
    const ctx = el?.getContext("2d");
    if (!box || !el || !label || !ctx) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const idx = new Map(STOPS.map((s, i) => [s.id, i]));
    const links = LINKS.map(([a, b]) => [idx.get(a)!, idx.get(b)!] as const);
    const out: number[][] = STOPS.map(() => []);
    links.forEach(([a], i) => out[a].push(i));
    const r = rng(7);
    const bend = links.map(() => (r() - 0.5) * 0.18);

    let w = 0;
    let h = 0;
    let dpr = 1;
    let reg: Region = { x0: 0, y0: 0, x1: 0, y1: 0, a: 0 };
    let from = reg;
    let to = reg;
    let glideAt = -1;
    let labelsA = modeRef.current === "home" ? 1 : 0;

    const place = () => {
      const b = box.getBoundingClientRect();
      w = b.width;
      h = b.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      reg = from = to = regionFor(modeRef.current, w, h);
      glideAt = -1;
    };
    place();
    retarget.current = (m) => {
      from = reg;
      to = regionFor(m, w, h);
      glideAt = still ? -1 : performance.now();
      if (still) reg = to;
    };

    let C = readColors();
    const unwatch = watchColors(() => (C = readColors()));

    let bloomAt = -1;
    const bloom = () => {
      if (bloomAt !== -1) return;
      bloomAt = still ? -Infinity : performance.now();
    };
    if (document.documentElement.dataset.bloom === "1" || still || modeRef.current !== "home") bloom();
    window.addEventListener(BLOOM, bloom);
    const late = window.setTimeout(bloom, 6000);

    const ptr = { x: -9999, y: -9999, live: false };
    let focus = -1;
    let shown = -1;
    let heat = 0;
    const at = (i: number) => {
      const s = STOPS[i];
      return { x: reg.x0 + s.u * (reg.x1 - reg.x0), y: reg.y0 + s.v * (reg.y1 - reg.y0) };
    };
    const curve = (li: number, t: number) => {
      const [a, b] = links[li];
      const p = at(a);
      const q = at(b);
      const mx = (p.x + q.x) / 2 - (q.y - p.y) * bend[li];
      const my = (p.y + q.y) / 2 + (q.x - p.x) * bend[li];
      const u = 1 - t;
      return { x: u * u * p.x + 2 * u * t * mx + t * t * q.x, y: u * u * p.y + 2 * u * t * my + t * t * q.y, mx, my };
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const b = box.getBoundingClientRect();
      ptr.x = e.clientX - b.left;
      ptr.y = e.clientY - b.top;
      ptr.live = ptr.y >= 0 && ptr.y <= h;
      const t = e.target as Element | null;
      const overUi = !!t?.closest("a:not(.bp-fieldtip),button,h1,p,nav,input,textarea,select,label");
      let hit = -1;
      if (!overUi && labelsA > 0.5)
        STOPS.forEach((s, i) => {
          if (!s.href) return;
          const q = at(i);
          if (Math.hypot(q.x - ptr.x, q.y - ptr.y) < 24) hit = i;
        });
      focus = hit;
      document.body.style.cursor = hit >= 0 ? "pointer" : "";
    };
    const onLeave = () => {
      ptr.live = false;
      focus = -1;
      document.body.style.cursor = "";
    };
    const onClick = (e: MouseEvent) => {
      if (focus < 0 || (e.target as Element | null)?.closest("a,button,input")) return;
      const href = STOPS[focus].href;
      if (href) router.push(href);
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
      const s = STOPS[i];
      label.href = s.href ?? "/services";
      (label.children[0] as HTMLElement).textContent = s.label;
      (label.children[1] as HTMLElement).textContent = s.service ?? "";
      label.dataset.on = "1";
    };

    const dots: Dot[] = [];
    let spawnAt = 0;
    const arrived: number[] = STOPS.map(() => -10);
    let last = performance.now();

    let raf = 0;
    let fade = 1;
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const sy = window.scrollY;
      fade = Math.max(0, 1 - sy / (h * 0.85));
      box.style.transform = `translate3d(0,${sy * 0.35}px,0)`;
      box.style.opacity = String(fade);

      if (glideAt >= 0) {
        const k = clamp01((now - glideAt) / 1000 / GLIDE);
        reg = lerpRegion(from, to, easeInOutQuint(k));
        if (k >= 1) glideAt = -1;
      }
      labelsA += ((modeRef.current === "home" ? 1 : 0) - labelsA) * 0.08;
      heat += ((ptr.live ? 1 : 0) - heat) * 0.1;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const born = bloomAt === -Infinity ? Infinity : bloomAt < 0 ? -1 : (now - bloomAt) / 1000;
      if (born < 0 || fade <= 0) {
        if (fade > 0 || born < 0) raf = requestAnimationFrame(frame);
        return;
      }
      // Stops appear left to right; each link follows its source.
      const life = (u: number) => (born === Infinity ? 1 : easeOutExpo(clamp01((born - u * 1.4) / 1.1)));

      // Lattice.
      const step = 26;
      const lx0 = Math.ceil(reg.x0 / step) * step;
      const ly0 = Math.ceil(reg.y0 / step) * step;
      for (let y = ly0; y < reg.y1; y += step)
        for (let x = lx0; x < reg.x1; x += step) {
          if (x < 0 || x > w || y < 0 || y > h) continue;
          const u = (x - reg.x0) / (reg.x1 - reg.x0);
          const l = life(u);
          if (l < 0.02) continue;
          const d = ptr.live ? Math.hypot(x - ptr.x, y - ptr.y) : 999;
          const lit = d > 200 ? 0 : (1 - d / 200) ** 1.6 * heat;
          ctx.fillStyle = `rgba(${lit > 0.4 ? C.text : C.dot},${(0.16 + lit * 0.6) * l * reg.a})`;
          ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
        }

      // Links.
      links.forEach(([a, b], li) => {
        const l = life(STOPS[a].u);
        if (l < 0.02) return;
        const hot = focus >= 0 && (a === focus || b === focus);
        const p = at(a);
        const c = curve(li, 0.5);
        const q = at(b);
        ctx.lineWidth = hot ? 1.4 : 1;
        ctx.strokeStyle = hot ? `rgba(${C.hot},${0.85 * l})` : `rgba(${C.line},${0.9 * l * reg.a})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(c.mx, c.my, q.x, q.y);
        ctx.stroke();
      });

      // Enquiries.
      if (!still && born > 1.4) {
        if (now - spawnAt > 420 && dots.length < 22) {
          spawnAt = now;
          const s = SOURCES[Math.floor(Math.random() * SOURCES.length)];
          const opts = out[s];
          dots.push({ link: opts[Math.floor(Math.random() * opts.length)], t: 0, speed: 0.32 + Math.random() * 0.22 });
        }
        for (let i = dots.length - 1; i >= 0; i--) {
          const d = dots[i];
          d.t += d.speed * dt;
          if (d.t >= 1) {
            const end = links[d.link][1];
            arrived[end] = now;
            const next = out[end];
            if (!next.length) {
              dots.splice(i, 1);
              continue;
            }
            d.link = next[Math.floor(Math.random() * next.length)];
            d.t = 0;
          }
        }
        for (const d of dots) {
          for (let k = 0; k < 6; k++) {
            const tt = Math.max(0, d.t - k * 0.018);
            const q = curve(d.link, tt);
            ctx.fillStyle = `rgba(${C.hot},${(0.9 - k * 0.15) * reg.a})`;
            ctx.beginPath();
            ctx.arc(q.x, q.y, 2.2 - k * 0.28, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Stops.
      STOPS.forEach((s, i) => {
        const l = life(s.u);
        if (l < 0.02) return;
        const q = at(i);
        const end = s.id === "client";
        const hit = (now - arrived[i]) / 1000;
        const ring = hit < 0.6 ? 1 - hit / 0.6 : 0;
        ctx.fillStyle = `rgb(${C.bg})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, (end ? 6 : 4.5) + ring * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(${end || focus === i ? C.hot : C.text},${(0.7 + ring * 0.3) * l * Math.max(reg.a, 0.6)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(q.x, q.y, (end ? 6 : 4.5) + ring * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(${end || focus === i ? C.hot : C.text},${l * reg.a})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, end ? 2.6 : 1.8, 0, Math.PI * 2);
        ctx.fill();
        const cap = caps.current[i];
        if (cap) {
          cap.style.transform = `translate(${q.x + 12}px, ${q.y - 5}px)`;
          cap.dataset.on = l > 0.5 && labelsA > 0.5 ? "1" : "0";
          cap.dataset.hot = focus === i || end ? "1" : "0";
        }
      });

      if (focus >= 0 && labelsA > 0.5) {
        const q = at(focus);
        showTip(focus);
        const tw = label.offsetWidth;
        const x = Math.min(Math.max(12, q.x - tw / 2), w - tw - 12);
        label.style.transform = `translate(${x}px, ${q.y + 18}px)`;
      } else showTip(-1);

      raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    kick();
    const onResize = () => {
      place();
      kick();
    };
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        last = performance.now();
        kick();
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", kick, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      unwatch();
      window.clearTimeout(late);
      window.removeEventListener(BLOOM, bloom);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", kick);
      document.removeEventListener("visibilitychange", onVis);
      document.body.style.cursor = "";
    };
  }, [router]);

  return (
    <div ref={wrap} className="bp-field" aria-hidden>
      <canvas ref={canvas} />
      {STOPS.map((s, i) => (
        <span
          key={s.id}
          className="bp-fieldcap"
          ref={(n) => {
            caps.current[i] = n;
          }}
        >
          {s.label}
        </span>
      ))}
      {/* The hovered stop sets href before the tip shows. */}
      <a ref={tip} className="bp-fieldtip" tabIndex={-1}>
        <span />
        <span />
      </a>
    </div>
  );
}
