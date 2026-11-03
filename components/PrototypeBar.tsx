"use client";

/*
 * PROTOTYPE: three hero variants on the real home page (Matt Pocock's prototype skill, UI branch,
 * sub-shape A), plus the three blue candidates and ember. Pick one of each, then delete this bar,
 * variant.ts and the losing fields.
 *
 *   A  contour peak     the mountain, with the route climbing through the four steps
 *   B  journey graph    touchpoints, with enquiries travelling between them
 *   C  type only        no canvas; the headline and a scroll-driven marquee
 */
import { setVariant, useVariant, type Variant } from "./variant";
import { setAccent, type Accent } from "./prefs";
import { usePrefs } from "./SiteNav";

const VARIANTS: { id: Variant; label: string }[] = [
  { id: "a", label: "A peak" },
  { id: "b", label: "B journey" },
  { id: "c", label: "C type" },
];
const ACCENTS: { id: Accent; hex: string }[] = [
  { id: "glacier", hex: "#86AFD9" },
  { id: "cobalt", hex: "#4A63F0" },
  { id: "dusk", hex: "#8C92E0" },
  { id: "ember", hex: "#E0561C" },
];

export default function PrototypeBar() {
  const variant = useVariant();
  const { accent } = usePrefs();
  return (
    <div className="bp-protobar" role="toolbar" aria-label="Prototype controls">
      <div className="grp">
        <b>Hero</b>
        {VARIANTS.map((v) => (
          <button key={v.id} type="button" data-on={variant === v.id ? "1" : "0"} onClick={() => setVariant(v.id)}>
            {v.label}
          </button>
        ))}
      </div>
      <div className="grp">
        <b>Accent</b>
        {ACCENTS.map((a) => (
          <button key={a.id} type="button" data-on={accent === a.id ? "1" : "0"} onClick={() => setAccent(a.id)}>
            <span className="dot" style={{ background: a.hex }} />
            {a.id}
          </button>
        ))}
      </div>
      <div className="grp">
        <button
          type="button"
          onClick={() => {
            try {
              sessionStorage.removeItem("bp.intro");
            } catch {}
            location.reload();
          }}
        >
          ↻ intro
        </button>
      </div>
    </div>
  );
}
