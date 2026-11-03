"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

/*
 * The text half of a page change. While the view transition lifts the old page away, the new page's
 * headline rises line by line out of masks, and the lines around it (eyebrow, lede, buttons) fade up
 * after it. Runs only on in-app navigation: the first page of a visit has its own entrance (the home
 * intro), and reduced motion gets the page as it is.
 *
 * It renders a marker inside the page and works on the first h1 that follows its parent's start, so
 * every page that uses <Page> gets it without changes.
 */
let booted = false;

export default function PageReveal() {
  const mark = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!booted) {
      // Let a dev double-mount see the same "first load" before flipping.
      setTimeout(() => (booted = true), 0);
      return;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const page = mark.current?.parentElement;
    const h1 = page?.querySelector<HTMLElement>("h1");
    if (!h1) return;

    const around = Array.from(h1.parentElement?.children ?? []).filter((el) => el !== h1 && el !== mark.current) as HTMLElement[];
    const before = around.filter((el) => el.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING);
    const after = around.filter((el) => !before.includes(el)).slice(0, 4);

    const split = SplitText.create(h1, { type: "lines", mask: "lines", linesClass: "bp-rline" });
    const tl = gsap.timeline({ delay: 0.3, onComplete: () => split.revert() });
    tl.from(before, { autoAlpha: 0, y: 10, duration: 0.6, ease: "power2.out" }, 0)
      .from(split.lines, { yPercent: 130, duration: 1, stagger: 0.08, ease: "expo.out" }, 0.05)
      .from(after, { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.07, ease: "power3.out" }, 0.3);
  });

  return <span ref={mark} hidden />;
}
