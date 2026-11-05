import type { MetadataRoute } from "next";
import { brand } from "@/content/site";

// Private until BluePeakAI signs off: crawlers stay out. At handover, allow "/" instead.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" }, sitemap: `${brand.url}/sitemap.xml` };
}
