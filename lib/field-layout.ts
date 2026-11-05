import type { Island } from "./graph";

/*
 * The home field's layout (from Crambook): a small force simulation per island. It is deterministic,
 * so it runs once on the server and the browser only animates the result.
 */

export type Unit = { x: number; y: number };

/** Deterministic noise so the layout is the same on every visit. */
export function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

/** Lay one island out in unit space: centred on 0, radius about 1. */
function layout(g: Island, seed: number): Unit[] {
  const n = g.nodes.length;
  const r = rng(seed);
  const p = g.nodes.map((_, i) => {
    const th = (i / n) * Math.PI * 2 * 7 + r();
    const d = Math.sqrt((i + 0.5) / n);
    return { x: Math.cos(th) * d * 40, y: Math.sin(th) * d * 40, vx: 0, vy: 0 };
  });
  for (let k = 0; k < 320; k++) {
    const alpha = 1 - k / 320;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = p[j].x - p[i].x;
        const dy = p[j].y - p[i].y;
        const d2 = dx * dx + dy * dy + 0.01;
        const f = (90 / d2) * alpha;
        p[i].vx -= dx * f;
        p[i].vy -= dy * f;
        p[j].vx += dx * f;
        p[j].vy += dy * f;
      }
    }
    for (const [i, j] of g.links) {
      const dx = p[j].x - p[i].x;
      const dy = p[j].y - p[i].y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = ((d - 9) / d) * 0.06 * alpha;
      p[i].vx += dx * f;
      p[i].vy += dy * f;
      p[j].vx -= dx * f;
      p[j].vy -= dy * f;
    }
    for (const q of p) {
      q.vx -= q.x * 0.012 * alpha;
      q.vy -= q.y * 0.012 * alpha;
      q.x += q.vx;
      q.y += q.vy;
      q.vx *= 0.6;
      q.vy *= 0.6;
    }
  }
  // Normalise to the 92nd-percentile radius so a few loose dots don't shrink the island.
  const radii = p.map((q) => Math.hypot(q.x, q.y)).sort((a, b) => a - b);
  const R = radii[Math.floor(n * 0.92)] || 1;
  // Four places is finer than a pixel at any screen size and keeps the page payload small.
  return p.map((q) => ({ x: Math.round((q.x / R) * 1e4) / 1e4, y: Math.round((q.y / R) * 1e4) / 1e4 }));
}

/** Every island laid out in unit space, one island each. */
export function fieldLayout(graphs: Island[]): Unit[][] {
  return graphs.map((g, a) => layout(g, 7 + a * 131));
}
