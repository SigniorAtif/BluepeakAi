import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { featured, industries, projects, services } from "@/content/site";

const pub = join(__dirname, "..", "public");

describe("site content", () => {
  it("links every project over https and has its screenshot on disk", () => {
    for (const p of projects) {
      expect(new URL(p.href).protocol, p.id).toBe("https:");
      expect(existsSync(join(pub, p.shot)), p.shot).toBe(true);
    }
  });

  it("features only projects that exist", () => {
    const ids = new Set(projects.map((p) => p.id));
    for (const id of featured) expect(ids.has(id), id).toBe(true);
  });

  it("never offers an industry filter that would show nothing", () => {
    for (const i of industries) expect(projects.some((p) => p.industry === i.id), i.id).toBe(true);
  });

  it("keeps the service anchors the old site linked to", () => {
    expect(services.map((s) => s.id)).toEqual(["websites", "automation", "whatsapp", "social", "connected"]);
    for (const s of services) expect(s.points.length, s.id).toBeGreaterThan(0);
  });
});
