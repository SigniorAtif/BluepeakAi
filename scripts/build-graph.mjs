/*
 * Builds the home field's graph from the crawl of BluePeakAI's eight live projects
 * (data/crawl/*.json: every visible h1–h4 and internal link, taken from the sites themselves).
 *
 * Each heading is a dot. Links are the structure the sites already have: a heading joins the
 * section it sits in, neighbouring headings in a section join each other in reading order, and
 * consecutive top-level sections join, and headings that share one section of the page (the same
 * anchor) join in a ring. Projects are grouped into one island per industry.
 * Run with `npm run graph`; it rewrites content/graph.json.
 */
import { readFileSync, writeFileSync } from "node:fs";

const PROJECTS = [
  { id: "meridian", name: "Meridian Cross", industry: "law" },
  { id: "smile", name: "My Smile Dental", industry: "health" },
  { id: "restaurant", name: "The Restaurant", industry: "hospitality" },
  { id: "bakery", name: "Blush & Batter", industry: "hospitality" },
  { id: "leela", name: "Leela Jewellery", industry: "retail" },
  { id: "glizz", name: "Glizz Beauty School", industry: "retail" },
  { id: "jaynarayan", name: "Jay Narayan Marble", industry: "industrial" },
  { id: "suresh", name: "Suresh Enterprise", industry: "industrial" },
];
const ISLANDS = [
  { id: "hospitality", label: "Hospitality" },
  { id: "industrial", label: "Industrial" },
  { id: "retail", label: "Retail & lifestyle" },
  { id: "health", label: "Healthcare" },
  { id: "law", label: "Legal" },
];

const level = { h1: 1, h2: 2, h3: 3, h4: 4 };
const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const tidy = (s) => (s === s.toUpperCase() && s.length > 3 ? s.charAt(0) + s.slice(1).toLowerCase() : s);

function project(p) {
  const crawl = JSON.parse(readFileSync(new URL(`../data/crawl/${p.id}.json`, import.meta.url), "utf8"));
  const base = crawl.url.split("#")[0];
  const pages = new Map(crawl.links.filter((l) => l.href.includes("?id=")).map((l) => [l.href.split("?id=")[1], l.href.split("#")[0]]));
  const seen = new Set();
  const nodes = [];
  const links = [];
  const stack = [];
  const lastAt = {};
  let lastH2 = -1;
  let section = "Home";
  for (const it of crawl.items) {
    const key = it.text.toLowerCase();
    if (it.text.length < 3 || seen.has(key)) continue;
    seen.add(key);
    const lv = level[it.tag];
    const i = nodes.length;
    if (lv === 2) section = tidy(it.text);
    const href = pages.get(slug(it.text)) ?? (it.id ? `${base}#${it.id}` : base);
    nodes.push({ t: tidy(it.text), cite: `${p.name} · ${lv <= 2 ? "Home" : section}`, href });
    while (stack.length && stack[stack.length - 1].lv >= lv) stack.pop();
    const parent = stack[stack.length - 1];
    if (parent) links.push([parent.i, i]);
    // Reading order inside a section: the previous heading at this level, under the same parent.
    const prev = lastAt[lv];
    if (prev && prev.parent === parent?.i && prev.i !== i) links.push([prev.i, i]);
    lastAt[lv] = { i, parent: parent?.i };
    if (lv === 2) {
      if (lastH2 >= 0 && !(parent && parent.i === lastH2)) links.push([lastH2, i]);
      lastH2 = i;
    }
    stack.push({ lv, i });
  }
  // Headings under the same anchor sit in the same part of the page: join them in a ring.
  const groups = new Map();
  nodes.forEach((n, i) => groups.set(n.href, [...(groups.get(n.href) ?? []), i]));
  for (const g of groups.values()) {
    if (g.length < 3) continue;
    for (let k = 0; k < g.length; k++) links.push([g[k], g[(k + 1) % g.length]]);
  }
  return { nodes, links };
}

const islands = ISLANDS.map((isl) => {
  const nodes = [];
  const links = [];
  const sites = PROJECTS.filter((p) => p.industry === isl.id);
  for (const p of sites) {
    const g = project(p);
    const off = nodes.length;
    nodes.push(...g.nodes);
    for (const [a, b] of g.links) links.push([a + off, b + off]);
  }
  const unique = [...new Map(links.map(([a, b]) => [a < b ? `${a}-${b}` : `${b}-${a}`, a < b ? [a, b] : [b, a]])).values()];
  return { id: isl.id, label: isl.label, sites: sites.length, nodes, links: unique };
});

writeFileSync(new URL("../content/graph.json", import.meta.url), JSON.stringify(islands) + "\n");
const n = islands.reduce((s, g) => s + g.nodes.length, 0);
const l = islands.reduce((s, g) => s + g.links.length, 0);
console.log(islands.map((g) => `${g.label}: ${g.sites} sites, ${g.nodes.length} dots, ${g.links.length} links`).join("\n"));
console.log(`total ${n} dots, ${l} links`);
