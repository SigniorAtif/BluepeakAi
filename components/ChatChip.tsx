"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { waLink } from "@/content/site";
import { INTRO_DONE } from "./prefs";

/*
 * Their main channel, always one tap away, except where it would sit on something: it tucks away
 * below the screen while the home hero (which has its own call to action, and the field's caption
 * in that corner) or the footer (which carries the WhatsApp number) is on screen. Once per load,
 * the first time it is out after the intro (or shortly after a page opens without one), an accent
 * highlight runs along its border. Phones show an icon in place of the label.
 */
const COVERS = [".bp-hero", ".bp-foot"];

export default function ChatChip() {
  const path = usePathname();
  const [away, setAway] = useState(false);
  const [pulse, setPulse] = useState(false);
  // Read from observer and timer callbacks, which outlive any one render.
  const awayNow = useRef(false);
  const ready = useRef(false);
  const tryPulse = () => {
    if (ready.current && !awayNow.current) setPulse(true);
  };

  // Re-run per route: the hero only exists on the home page, and pages swap under the layout.
  useEffect(() => {
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target, e.isIntersecting);
      awayNow.current = [...seen.values()].some(Boolean);
      setAway(awayNow.current);
      tryPulse();
    });
    COVERS.forEach((s) => document.querySelectorAll(s).forEach((el) => io.observe(el)));
    return () => io.disconnect();
  }, [path]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const go = (wait: number) => () => {
      t = setTimeout(() => {
        ready.current = true;
        tryPulse();
      }, wait);
    };
    if ((window as unknown as { __bpIntroDue?: boolean }).__bpIntroDue) {
      const after = go(250);
      window.addEventListener(INTRO_DONE, after, { once: true });
      return () => {
        window.removeEventListener(INTRO_DONE, after);
        clearTimeout(t);
      };
    }
    go(900)();
    return () => clearTimeout(t);
  }, []);

  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="bp-chat js-i-fade"
      data-pulse={pulse ? "1" : undefined}
      data-away={away ? "1" : undefined}
      inert={away}
      aria-label="Chat with BluePeakAI on WhatsApp"
    >
      <MessageCircle size={18} className="bp-chat-ic" aria-hidden />
      <span>Chat on WhatsApp</span>
    </a>
  );
}
