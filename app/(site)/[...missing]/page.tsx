import { notFound } from "next/navigation";

// Any unmatched URL lands here, so the 404 renders inside the site layout with the nav and field.
export default function Missing() {
  notFound();
}
