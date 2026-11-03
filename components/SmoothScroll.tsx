"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/*
 * Eased wheel scrolling for the whole site; touch keeps the phone's own scrolling. Same-page anchor
 * links glide too and land where their scroll-margin says. Scroll areas inside the page (the palette
 * list) still scroll natively. It holds still while the menu sheet or the palette locks the page, and
 * reduced motion keeps the browser's plain scrolling.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true, allowNestedScroll: true, stopInertiaOnNavigate: true });

    // The sheet and the palette lock the page with an inline overflow on <html> or <body>.
    const html = document.documentElement;
    const body = document.body;
    const sync = () => {
      if (html.style.overflow === "hidden" || body.style.overflow === "hidden") lenis.stop();
      else lenis.start();
    };
    const watch = new MutationObserver(sync);
    watch.observe(html, { attributeFilter: ["style"] });
    watch.observe(body, { attributeFilter: ["style"] });

    return () => {
      watch.disconnect();
      lenis.destroy();
    };
  }, []);
  return null;
}
