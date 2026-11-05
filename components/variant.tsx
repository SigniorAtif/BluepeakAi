"use client";

/*
 * PROTOTYPE: which hero variant is showing (a, b or c). The server reads it from the `bp.variant`
 * cookie so the first paint is already the right variant; the prototype bar writes the cookie and
 * refreshes. Delete with the bar once a variant is picked.
 */
import { createContext, useContext } from "react";
import type { Variant } from "./variant-shared";

export { VARIANT_COOKIE, type Variant } from "./variant-shared";

const Ctx = createContext<Variant>("a");
export const VariantProvider = Ctx.Provider;
export const useVariant = () => useContext(Ctx);
