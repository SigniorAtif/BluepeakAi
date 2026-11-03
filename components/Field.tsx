"use client";

import type { Island } from "@/lib/graph";
import type { Unit } from "@/lib/field-layout";
import SiteField from "./fields/SiteField";
import JourneyField from "./fields/JourneyField";
import { useVariant } from "./variant";

/** The signature field for the chosen hero variant. Variant C has none. */
export default function Field({ graphs, units }: { graphs: Island[]; units: Unit[][] }) {
  const variant = useVariant();

  if (variant === "c") return null;
  return variant === "b" ? <JourneyField /> : <SiteField graphs={graphs} units={units} />;
}
