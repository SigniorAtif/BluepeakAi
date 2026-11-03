/*
 * The peak behind variant A: a height map of one mountain with a shoulder and a far hill, traced
 * into contour lines by marching squares. Everything is in unit space (u right, v down, both 0..1);
 * the field scales it into whatever region the page gives it.
 */

const g = (u: number, v: number, cu: number, cv: number, su: number, sv: number) =>
  Math.exp(-(((u - cu) ** 2) / (2 * su * su) + ((v - cv) ** 2) / (2 * sv * sv)));

export function height(u: number, v: number): number {
  return (
    1.0 * g(u, v, 0.6, 0.34, 0.15, 0.2) +
    0.6 * g(u, v, 0.34, 0.6, 0.13, 0.15) +
    0.28 * g(u, v, 0.47, 0.47, 0.1, 0.08) +
    0.34 * g(u, v, 0.87, 0.74, 0.09, 0.1) +
    0.045 * (Math.sin(u * 13 + 1.3) * Math.cos(v * 11 - 0.7) + 0.6 * Math.sin((u + v) * 7.3 + 2.1))
  );
}

export type Level = { z: number; k: number; seg: Float32Array };

/**
 * Contour segments for `count` evenly spaced heights. `k` is each level's place from 0 (lowest)
 * to 1 (the summit ring), which the field uses for depth and brightness.
 */
export function trace(count = 18, gw = 120, gh = 96): { levels: Level[]; summit: { u: number; v: number } } {
  const vals = new Float32Array((gw + 1) * (gh + 1));
  let top = -Infinity;
  let summit = { u: 0.5, v: 0.5 };
  for (let j = 0; j <= gh; j++)
    for (let i = 0; i <= gw; i++) {
      const u = i / gw;
      const v = j / gh;
      const z = height(u, v);
      vals[j * (gw + 1) + i] = z;
      if (z > top) {
        top = z;
        summit = { u, v };
      }
    }

  const lo = 0.07;
  const levels: Level[] = [];
  for (let n = 0; n < count; n++) {
    const z = lo + ((top - lo) * (n + 0.5)) / count;
    const out: number[] = [];
    for (let j = 0; j < gh; j++)
      for (let i = 0; i < gw; i++) {
        const a = vals[j * (gw + 1) + i];
        const b = vals[j * (gw + 1) + i + 1];
        const c = vals[(j + 1) * (gw + 1) + i + 1];
        const d = vals[(j + 1) * (gw + 1) + i];
        const idx = (a > z ? 8 : 0) | (b > z ? 4 : 0) | (c > z ? 2 : 0) | (d > z ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const x = i / gw;
        const y = j / gh;
        const cw = 1 / gw;
        const ch = 1 / gh;
        const t = (p: number, q: number) => (z - p) / (q - p);
        // Edge crossings: top (a→b), right (b→c), bottom (d→c), left (a→d).
        const T = () => [x + cw * t(a, b), y];
        const R = () => [x + cw, y + ch * t(b, c)];
        const B = () => [x + cw * t(d, c), y + ch];
        const L = () => [x, y + ch * t(a, d)];
        const push = (p: number[], q: number[]) => out.push(p[0], p[1], q[0], q[1]);
        const centreHigh = (a + b + c + d) / 4 > z;
        switch (idx) {
          case 1: case 14: push(L(), B()); break;
          case 2: case 13: push(B(), R()); break;
          case 3: case 12: push(L(), R()); break;
          case 4: case 11: push(T(), R()); break;
          case 6: case 9: push(T(), B()); break;
          case 7: case 8: push(L(), T()); break;
          case 5:
            if (centreHigh) { push(L(), T()); push(B(), R()); } else { push(L(), B()); push(T(), R()); }
            break;
          case 10:
            if (centreHigh) { push(T(), R()); push(L(), B()); } else { push(L(), T()); push(B(), R()); }
            break;
        }
      }
    levels.push({ z, k: n / (count - 1), seg: new Float32Array(out) });
  }
  return { levels, summit };
}
