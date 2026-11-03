"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { process4 } from "@/content/site";
import { trace, height } from "./contour";
import { BLOOM, clamp01, easeInOutQuint, easeOutExpo, lerpRegion, modeFor, readColors, regionFor, watchColors, type Mode, type Region } from "./kit";

/*
 * Variant A, the contour peak. A mountain drawn as topographic lines, every fifth one heavier like
 * an index contour on a survey map. The levels sit at different depths, so the pointer tilts the
 * mountain; near the pointer the lines brighten. On the home page a dashed route climbs from base
 * camp to the summit through the four steps of how BluePeakAI works. The lines bloom out of the
 * summit when the intro fires `bp:bloom`; elsewhere the field glides to a quieter spot.
 */

const WAY = [
  { u: 0.17, v: 0.9 },
  { u: 0.31, v: 0.66 },
  { u: 0.47, v: 0.49 },
] as const;
const GLIDE = 1.25;

export default function ContourField() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tip = useRef<HTMLAnchorElement>(null);
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
    const { levels, summit } = trace(18);
    const top = height(summit.u, summit.v);

    // The route: base camp → shoulder → ridge → summit, sampled as one smooth curve.
    const stops = [...WAY, summit].map((p) => ({ ...p, k: clamp01(height(p.u, p.v) / top) }));
    const path: { u: number; v: number; k: number }[] = [];
    for (let s = 0; s < stops.length - 1; s++) {
      const p0 = stops[Math.max(0, s - 1)];
      const p1 = stops[s];
      const p2 = stops[s + 1];
      const p3 = stops[Math.min(stops.length - 1, s + 2)];
      for (let i = 0; i < 40; i++) {
        const t = i / 40;
        const t2 = t * t;
        const t3 = t2 * t;
        const cr = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        path.push({ u: cr(p0.u, p1.u, p2.u, p3.u), v: cr(p0.v, p1.v, p2.v, p3.v), k: cr(p0.k, p1.k, p2.k, p3.k) });
      }
    }
    path.push(stops[stops.length - 1]);

    let w = 0;
    let h = 0;
    let dpr = 1;
    let reg: Region = { x0: 0, y0: 0, x1: 0, y1: 0, a: 0 };
    let from = reg;
    let to = reg;
    let glideAt = -1;
    let routeA = modeRef.current === "home" ? 1 : 0;
    const off = document.createElement("canvas");
    const octx = off.getContext("2d")!;

    const place = () => {
      const r = box.getBoundingClientRect();
      w = r.width;
      h = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = off.width = Math.round(w * dpr);
      el.height = off.height = Math.round(h * dpr);
      reg = from = to = regionFor(modeRef.current, w, h);
      glideAt = -1;
    };
    place();
    retarget.current = (m) => {
      from = reg;
      to = regionFor(m, w, h);
      glideAt = still ? -1 : performance.now();
      if (still) reg = to;
      label.dataset.on = "0";
    };

    let C = readColors();
    const unwatch = watchColors(() => (C = readColors()));

    // Bloom: the lines spread out of the summit.
    let bloomAt = -1;
    const bloom = () => {
      if (bloomAt !== -1) return;
      bloomAt = still ? -Infinity : performance.now();
    };
    const html = document.documentElement;
    if (html.dataset.bloom === "1" || still || modeRef.current !== "home") bloom();
    window.addEventListener(BLOOM, bloom);
    const late = window.setTimeout(bloom, 6000);

    // Pointer: tilt, torch and the waypoint under it.
    const ptr = { x: 0, y: 0, live: false, at: 0 };
    const tilt = { x: 0, y: 0 };
    let heat = 0;
    let focus = -1;
    let shown = -1;
    const P = (u: number, v: number, k: number) => ({
      x: reg.x0 + u * (reg.x1 - reg.x0) + tilt.x * k * 16,
      y: reg.y0 + v * (reg.y1 - reg.y0) + tilt.y * k * 11,
    });
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = box.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
      ptr.live = ptr.y >= 0 && ptr.y <= h;
      ptr.at = performance.now();
      const t = e.target as Element | null;
      const overUi = !!t?.closest("a:not(.bp-fieldtip),button,h1,p,nav,input,textarea,select,label");
      let hit = -1;
      if (!overUi && routeA > 0.5) {
        stops.forEach((s, i) => {
          const q = P(s.u, s.v, s.k);
          if (Math.hypot(q.x - ptr.x, q.y - ptr.y) < 26) hit = i;
        });
      }
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
      const target = document.getElementById("process");
      if (target) target.scrollIntoView({ behavior: still ? "auto" : "smooth" });
      else router.push("/#process");
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
      (label.children[0] as HTMLElement).textContent = `0${i + 1} · ${process4[i].t}`;
      (label.children[1] as HTMLElement).textContent = process4[i].d;
      label.dataset.on = "1";
    };

    let raf = 0;
    let fade = 1;
    const frame = (now: number) => {
      raf = 0;
      const t = now / 1000;
      const sy = window.scrollY;
      fade = Math.max(0, 1 - sy / (h * 0.85));
      box.style.transform = `translate3d(0,${sy * 0.35}px,0)`;
      box.style.opacity = String(fade);

      if (glideAt >= 0) {
        const k = clamp01((now - glideAt) / 1000 / GLIDE);
        reg = lerpRegion(from, to, easeInOutQuint(k));
        if (k >= 1) glideAt = -1;
      }
      routeA += ((modeRef.current === "home" ? 1 : 0) - routeA) * 0.08;

      // Tilt follows the pointer; with no pointer about, it sways on its own.
      const idle = !ptr.live || now - ptr.at > 2500;
      const cx = (reg.x0 + reg.x1) / 2;
      const cy = (reg.y0 + reg.y1) / 2;
      const gx = still ? 0 : idle ? Math.sin(t * 0.21) * 0.6 : clamp01((ptr.x - cx) / w + 0.5) * 2 - 1;
      const gy = still ? 0 : idle ? Math.cos(t * 0.17) * 0.4 : clamp01((ptr.y - cy) / h + 0.5) * 2 - 1;
      tilt.x += (gx - tilt.x) * 0.05;
      tilt.y += (gy - tilt.y) * 0.05;
      heat += ((ptr.live && !idle ? 1 : 0) - heat) * 0.08;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const born = bloomAt === -Infinity ? Infinity : bloomAt < 0 ? -1 : (now - bloomAt) / 1000;
      if (born < 0 || fade <= 0) {
        if (fade > 0 || born < 0) raf = requestAnimationFrame(frame);
        return;
      }

      const sp = P(summit.u, summit.v, 1);
      const reach = born === Infinity ? Infinity : easeOutExpo(clamp01(born / 2.4)) * Math.hypot(w, h);
      const drawLines = (c: CanvasRenderingContext2D, lit: boolean) => {
        for (const L of levels) {
          const index = Math.round(L.k * 17) % 5 === 4;
          const dx = tilt.x * L.k * 16;
          const dy = tilt.y * L.k * 11;
          const sx = reg.x1 - reg.x0;
          const sh = reg.y1 - reg.y0;
          c.lineWidth = index ? 1.25 : 0.85;
          c.strokeStyle = lit
            ? `rgba(${C.text},${0.85})`
            : `rgba(${L.k > 0.94 ? C.hot : C.line},${(index ? 0.95 : 0.62 + L.k * 0.38) * reg.a})`;
          c.beginPath();
          const s = L.seg;
          for (let i = 0; i < s.length; i += 4) {
            c.moveTo(reg.x0 + s[i] * sx + dx, reg.y0 + s[i + 1] * sh + dy);
            c.lineTo(reg.x0 + s[i + 2] * sx + dx, reg.y0 + s[i + 3] * sh + dy);
          }
          c.stroke();
        }
      };

      ctx.save();
      if (reach !== Infinity) {
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, reach, 0, Math.PI * 2);
        ctx.clip();
      }
      drawLines(ctx, false);

      // Torch: the same lines in the text colour, kept only inside a soft circle at the pointer.
      if (heat > 0.02) {
        octx.setTransform(dpr, 0, 0, dpr, 0, 0);
        octx.globalCompositeOperation = "source-over";
        octx.clearRect(0, 0, w, h);
        drawLines(octx, true);
        octx.globalCompositeOperation = "destination-in";
        const g = octx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 230);
        g.addColorStop(0, "rgba(0,0,0,0.9)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        octx.fillStyle = g;
        octx.fillRect(0, 0, w, h);
        ctx.globalAlpha = heat * reg.a;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(off, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      // The route to the summit, drawn after the bloom, and its four waypoints.
      if (routeA > 0.01) {
        const prog = born === Infinity ? 1 : clamp01((born - 1.0) / 2.2);
        const n = Math.floor(easeInOutQuint(prog) * (path.length - 1));
        ctx.setLineDash([3, 5]);
        ctx.lineDashOffset = still ? 0 : -t * 6;
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = `rgba(${C.hot},${0.9 * routeA})`;
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const q = P(path[i].u, path[i].v, path[i].k);
          if (i === 0) ctx.moveTo(q.x, q.y);
          else ctx.lineTo(q.x, q.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = `500 10.5px ${C.mono}`;
        ctx.textBaseline = "middle";
        stops.forEach((s, i) => {
          const at = (i * 40) / (path.length - 1);
          const life = clamp01((easeInOutQuint(prog) - at) * 6 + (prog >= 1 ? 1 : 0));
          if (life <= 0) return;
          const q = P(s.u, s.v, s.k);
          const peak = i === stops.length - 1;
          const hot = focus === i;
          ctx.fillStyle = `rgba(${peak || hot ? C.hot : C.text},${life * routeA})`;
          ctx.beginPath();
          ctx.arc(q.x, q.y, peak ? 3.6 : hot ? 3.4 : 2.6, 0, Math.PI * 2);
          ctx.fill();
          if (peak && !still) {
            const pulse = (Math.sin(t * 2.2) + 1) / 2;
            ctx.strokeStyle = `rgba(${C.hot},${0.35 * (1 - pulse) * life * routeA})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(q.x, q.y, 6 + pulse * 10, 0, Math.PI * 2);
            ctx.stroke();
          }
          if (w >= 900) {
            ctx.fillStyle = `rgba(${hot || peak ? C.hot : C.faint},${life * routeA})`;
            ctx.textAlign = peak ? "center" : "left";
            const text = `0${i + 1}  ${process4[i].t.toUpperCase()}`;
            const tx = peak ? q.x : q.x + 12;
            const ty = peak ? q.y - 18 : q.y + 1;
            // A halo in the page colour keeps the label readable over the contour lines.
            ctx.lineWidth = 5;
            ctx.lineJoin = "round";
            ctx.strokeStyle = `rgba(${C.bg},${0.9 * life * routeA})`;
            ctx.strokeText(text, tx, ty);
            ctx.fillText(text, tx, ty);
          }
        });
      }

      if (focus >= 0 && routeA > 0.5) {
        const q = P(stops[focus].u, stops[focus].v, stops[focus].k);
        showTip(focus);
        const tw = label.offsetWidth;
        const x = Math.min(Math.max(12, q.x - tw / 2), w - tw - 12);
        label.style.transform = `translate(${x}px, ${q.y + 16}px)`;
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
      } else kick();
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
      <a ref={tip} className="bp-fieldtip" href="#process" tabIndex={-1}>
        <span />
        <span />
      </a>
    </div>
  );
}
