import type { ReactNode } from "react";
import type { Head } from "@/content/site";

/** An inner page's opening: kicker, a two-tone headline, a lede. The field sits to its right. */
export default function PageHead({ head, children }: { head: Head; children?: ReactNode }) {
  return (
    <header className="bp-phead">
      <p className="bp-eyebrow">
        <i />
        {head.kicker}
      </p>
      <h1 className="bp-title">
        {keep(head.title[0])} <span className="dim">{keep(head.title[1])}</span>
      </h1>
      <p className="bp-lede">{head.lede}</p>
      {children}
    </header>
  );
}

/** Hyphenated words ("growth-minded") stay on one line instead of breaking at the hyphen. */
function keep(text: string) {
  return text.split(" ").map((w, i) => (
    <span key={i}>
      {i > 0 && " "}
      {w.includes("-") ? <span className="bp-nw">{w}</span> : w}
    </span>
  ));
}
