"use client";

/*
 * PROTOTYPE: which hero variant is showing, read from ?variant= (a, b or c). The prototype bar
 * changes it in place with history.replaceState, so switching never reloads or replays the intro.
 * Delete with the bar once a variant is picked.
 */
import { useSyncExternalStore } from "react";

export type Variant = "a" | "b" | "c";
const EVENT = "bp:variant";

const read = (): Variant => {
  const v = new URLSearchParams(location.search).get("variant");
  return v === "b" || v === "c" ? v : "a";
};

export function setVariant(v: Variant) {
  const u = new URL(location.href);
  u.searchParams.set("variant", v);
  history.replaceState(history.state, "", u);
  window.dispatchEvent(new Event(EVENT));
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("popstate", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("popstate", cb);
  };
};

export const useVariant = () => useSyncExternalStore(subscribe, read, () => "a" as Variant);
