"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { waLink } from "@/content/site";
import { INTRO_DONE } from "./prefs";

/**
 * Their main channel, always one tap away. Once per load its border pulses in the accent: after
 * the home intro when one plays, otherwise shortly after the page opens. Phones show an icon in
 * place of the label.
 */
export default function ChatChip() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const go = (wait: number) => () => {
      t = setTimeout(() => setPulse(true), wait);
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
      aria-label="Chat with BluePeakAI on WhatsApp"
    >
      <MessageCircle size={18} className="bp-chat-ic" aria-hidden />
      <span>Chat on WhatsApp</span>
    </a>
  );
}
