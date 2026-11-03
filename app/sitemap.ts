import type { MetadataRoute } from "next";
import { brand, pages } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...pages.map((p) => p.href), "/privacy", "/terms"];
  return paths.map((path) => ({
    url: `${brand.url}${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path === "/privacy" || path === "/terms" ? 0.2 : 0.7,
  }));
}
