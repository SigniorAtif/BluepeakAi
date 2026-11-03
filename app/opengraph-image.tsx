import { ImageResponse } from "next/og";
import { brand } from "@/content/site";
import { graph } from "@/lib/graph";
import { fieldLayout } from "@/lib/field-layout";

export const alt = "BluePeakAI: Ideas that automate. Strategies that grow.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The hero's five islands (hospitality, industrial, retail, healthcare, legal), same spots.
const SPOTS: [number, number, number][] = [
  [0.78, 0.3, 0.2],
  [0.86, 0.78, 0.18],
  [0.64, 0.7, 0.12],
  [0.94, 0.5, 0.11],
  [0.68, 0.53, 0.09],
];

export default function Image() {
  const { width: w, height: h } = size;
  const islands = graph();
  const units = fieldLayout(islands);
  const at = islands.map((g, a) => {
    const [cx, cy, r] = SPOTS[a];
    return units[a].map((u) => ({ x: cx * w + u.x * r * h, y: cy * h + u.y * r * h }));
  });

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0F0E0D", color: "#F2EFEC" }}>
        <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
          {islands.map((g, a) =>
            g.links.map(([i, j], k) => (
              <line key={`${a}-${k}`} x1={at[a][i].x} y1={at[a][i].y} x2={at[a][j].x} y2={at[a][j].y} stroke="#3D3A37" strokeWidth={1} />
            )),
          )}
          {at.map((pts, a) => pts.map((p, i) => <circle key={`${a}-${i}`} cx={p.x} cy={p.y} r={i === 0 ? 4 : 2.2} fill={i === 0 ? "#A3C4E6" : "#7D7873"} />))}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: "100%" }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
            BluePeak<span style={{ color: "#A3C4E6", marginLeft: 4 }}>AI</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 700, lineHeight: 0.95, letterSpacing: -4 }}>
            <span>Ideas that</span>
            <span style={{ color: "#A3C4E6" }}>automate.</span>
            <span style={{ color: "#7D7873" }}>Strategies</span>
            <span style={{ color: "#7D7873" }}>that grow.</span>
          </div>
          <div style={{ display: "flex", fontSize: 20, letterSpacing: 3, color: "#A8A29C", textTransform: "uppercase" }}>{brand.reach}</div>
        </div>
      </div>
    ),
    size,
  );
}
