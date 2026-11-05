/* PROTOTYPE: shared by the server layout and the client bar. */
export type Variant = "a" | "b" | "c";
export const VARIANT_COOKIE = "bp.variant";
export const asVariant = (v?: string | null): Variant => (v === "b" || v === "c" ? v : "a");
