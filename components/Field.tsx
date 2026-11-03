"use client";

import { useEffect } from "react";
import ContourField from "./fields/ContourField";
import JourneyField from "./fields/JourneyField";
import { useVariant } from "./variant";

/** The signature field for the chosen hero variant. Variant C has none. */
export default function Field() {
  const variant = useVariant();

  // The intro only belongs to a visit that starts on the home page.
  useEffect(() => {
    if (location.pathname === "/") return;
    try {
      sessionStorage.setItem("bp.intro", "1");
    } catch {}
  }, []);

  if (variant === "c") return null;
  return variant === "b" ? <JourneyField /> : <ContourField />;
}
