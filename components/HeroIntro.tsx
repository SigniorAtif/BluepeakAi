"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { BLOOM } from "./fields/kit";
import { INTRO_DONE } from "./prefs";

gsap.registerPlugin(useGSAP, SplitText);

/*
 * The home intro, on every full load of the home page (Crambook's, re-cut). No overlay copies: every actor is the real
 * page element.
 *
 *   opening   "Ideas that automate." fades in letter by letter mid-screen at the headline's real
 *             size; a divider grows above it and the wordmark's halves ("BluePeak", "AI") appear
 *             at its ends
 *   arrival   the halves lift off along quarter-circle arcs to the nav, the divider crushing
 *             under them, and settle into place there
 *   launch    "automate." warms to the accent as the three words fly to their places in the
 *             headline; the field blooms out of the same moment
 *   settle    "Strategies that grow.", the lede, the buttons and the nav fade in
 *
 * Phones skip the divider and halves. A click, key, wheel or touch skips to the end; reduced
 * motion never sees it, and nor does a client-side visit back to the home page.
 */
export default function HeroIntro() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP((_, contextSafe) => {
    const box = root.current;
    if (!box) return;
    const w = window as unknown as { __bpIntro?: boolean; __bpIntroDue?: boolean };
    w.__bpIntro = true;

    const html = document.documentElement;
    const line = box.querySelector<HTMLElement>(".js-intro-line");
    const anchors = gsap.utils.toArray<HTMLElement>(".js-i-flip");
    const logo = document.querySelector<HTMLElement>(".js-logo");
    const a = document.querySelector<HTMLElement>(".js-logo-a");
    const b = document.querySelector<HTMLElement>(".js-logo-b");
    const halves = [a, b].filter(Boolean) as HTMLElement[];
    const bloom = () => {
      html.dataset.bloom = "1";
      window.dispatchEvent(new Event(BLOOM));
    };

    // The boot guard flags each full load of "/". Cleared only once the intro has played or been
    // skipped, so React's dev double-mount can't eat it.
    const seen = !w.__bpIntroDue;
    const mark = () => {
      if (!w.__bpIntroDue) return;
      w.__bpIntroDue = false;
      window.dispatchEvent(new Event(INTRO_DONE));
    };
    const reveal = [".js-i-flip", ".js-i-chars", ".js-i-fade", ".js-i-fade-top"];
    if (seen || html.dataset.bloom === "1" || !anchors.length || !logo || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      html.classList.remove("js-intro");
      gsap.set(box, { display: "none" });
      bloom();
      mark();
      return;
    }

    // The intro measures the page from the top, so a reload must not restore an old scroll spot.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, behavior: "instant" });
    const restoreScroll = () => {
      if ("scrollRestoration" in history) history.scrollRestoration = "auto";
    };

    gsap.set(reveal, { autoAlpha: 0 });
    gsap.set(halves, { autoAlpha: 0 });
    gsap.set(line, { autoAlpha: 0 });
    html.classList.remove("js-intro");

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const phone = !matchMedia("(min-width: 700px)").matches;
    const phraseY = vh * 0.52;
    const cs = getComputedStyle(html);
    const tone = (v: string) => cs.getPropertyValue(v).trim();
    const hl = anchors.find((x) => x.classList.contains("hl")) ?? anchors[anchors.length - 1];

    let tl: gsap.core.Timeline | null = null;
    let skipped = false;
    const skip = () => {
      skipped = true;
      restoreScroll();
      tl?.progress(1);
      bloom();
      mark();
    };

    const build = contextSafe!(() => {
      const words = new SplitText(".js-i-chars", { type: "words", wordsClass: "js-i-word" });
      gsap.set(words.words, { autoAlpha: 0, y: 18 });
      gsap.set(".js-i-chars", { autoAlpha: 1 });
      const chars = new SplitText(".js-i-flip", { type: "chars", charsClass: "js-i-char", aria: "none" });
      gsap.set(chars.chars, { autoAlpha: 0 });

      // FLIP invert: park the three words on one centred line (stacked on phones).
      const rects = anchors.map((x) => x.getBoundingClientRect());
      const gap = rects[0].height * 0.24;
      const total = rects.reduce((s, r) => s + r.width, 0) + gap * (rects.length - 1);
      let cursor = vw / 2 - total / 2;
      const lineH = rects[0].height * 1.02;
      const seat = anchors.map((_, i) => {
        const r = rects[i];
        if (phone) return { x: vw / 2 - r.width / 2 - r.left, y: phraseY + (i - 1) * lineH - (r.top + r.height / 2) };
        const p = { x: cursor - r.left, y: phraseY - (r.top + r.height / 2) };
        cursor += r.width + gap;
        return p;
      });
      anchors.forEach((x, i) => gsap.set(x, { x: seat[i].x, y: seat[i].y, autoAlpha: 1, color: tone("--text-muted") }));

      tl = gsap.timeline({
        onComplete: () => {
          mark();
          restoreScroll();
          gsap.set(anchors, { clearProps: "color" });
          gsap.set(box, { display: "none" });
          detach();
        },
      });
      const launchAt = phone ? 1.4 : 1.75;

      // OPENING: scattered letters, brightening as they land.
      tl.to(chars.chars, { autoAlpha: 1, duration: 0.45, stagger: { each: 0.03, from: "random" }, ease: "power1.inOut" }, 0.1);
      tl.to(anchors, { color: tone("--text"), duration: 0.5, ease: "power1.inOut" }, 0.7);

      if (!phone && a && b) {
        // The wordmark row sits just above the phrase: "BluePeak" flush with its left edge, "AI"
        // with its right, the divider stretched between. Each half is measured, not assumed.
        const L = logo.getBoundingClientRect();
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const S = Math.min(2.6, Math.max(1.4, (rects[0].height * 0.42) / L.height));
        const cx = L.left + L.width / 2;
        const scaled = (x: number) => cx + (x - cx) * S;
        const left = vw / 2 - total / 2;
        const right = left + total;
        const rowY = phraseY - rects[0].height / 2 - vh * 0.075;
        const wrapDY = rowY - (L.top + L.height / 2);
        const aDX = (left - scaled(ra.left)) / S;
        const bDX = (right - scaled(rb.right)) / S;
        const pad = 22;
        const lineW = Math.max(0, total - ra.width * S - rb.width * S - pad * 2);

        gsap.set(logo, { y: wrapDY, scale: S, transformOrigin: "50% 50%" });
        gsap.set(a, { x: aDX });
        gsap.set(b, { x: bDX });
        // The halves differ in width, so the divider sits in the gap between them, not on the centre.
        gsap.set(line, { top: rowY, left: left + ra.width * S + pad, width: lineW, scaleX: 0, autoAlpha: 1 });

        tl.to(line, { scaleX: 1, duration: 0.65, ease: "power2.inOut" }, 0).to(halves, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, 0.65);

        // ARRIVAL: one eased value drives a true quarter-circle, so the path stays round.
        const arc = { p: 0 };
        tl.to(
          arc,
          {
            p: 1,
            duration: 1.2,
            ease: "power3.inOut",
            onUpdate: () => {
              const th = (arc.p * Math.PI) / 2;
              const across = Math.sin(th);
              const rise = 1 - Math.cos(th);
              const life = Math.max(0, 1 - across / 0.4);
              gsap.set(a, { x: aDX * (1 - across) });
              gsap.set(b, { x: bDX * (1 - across) });
              gsap.set(logo, { y: wrapDY * (1 - rise), scale: S + (1 - S) * rise });
              gsap.set(line, { scaleX: life, autoAlpha: life });
            },
          },
          1.25,
        );
      } else {
        gsap.set(halves, { autoAlpha: 1 });
        gsap.set(logo, { autoAlpha: 0, y: -20 });
        tl.to(logo, { autoAlpha: 1, y: 0, duration: 0.75, ease: "power2.out" }, launchAt + 0.2);
      }

      // LAUNCH: "automate." warms, the words fly home, the field blooms.
      tl.addLabel("launch", launchAt);
      tl.call(bloom, [], "launch-=0.3");
      tl.to(hl, { color: tone("--accent-text"), duration: 0.5, ease: "power1.inOut" }, "launch-=0.2")
        .to(anchors, { x: 0, y: 0, duration: 1.15, stagger: 0.07, ease: "power4.inOut" }, "launch-=0.4")
        .to(words.words, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06, ease: "power3.out" }, "launch+=0.55");

      // SETTLE.
      tl.to(".js-i-fade-top", { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.08, ease: "power2.out" }, "launch+=0.2").to(
        ".js-i-fade",
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09, ease: "power2.out" },
        "launch+=0.85",
      );
      if (skipped) skip();
    });

    gsap.set(".js-i-fade-top", { y: -20 });
    gsap.set(".js-i-fade", { y: 14 });

    const opts = { passive: true } as const;
    const detach = () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
    };
    window.addEventListener("pointerdown", skip, opts);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, opts);
    window.addEventListener("touchmove", skip, opts);

    // Fonts first: the seed's offsets depend on real Geist metrics.
    document.fonts.ready.then(build);
    return detach;
  });

  return (
    <div ref={root} className="bp-introfx" aria-hidden>
      <div className="js-intro-line" />
    </div>
  );
}
