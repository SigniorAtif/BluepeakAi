import islands from "@/content/graph.json";

/*
 * The home field's data: BluePeakAI's eight live projects, one island per industry, every heading
 * on those sites a dot (built by scripts/build-graph.mjs from the crawl in data/crawl). To show
 * clients instead later, produce the same shape from the client list.
 */
export type Dot = { t: string; cite: string; href: string };
export type Island = { id: string; label: string; sites: number; nodes: Dot[]; links: [number, number][] };

export const graph = (): Island[] => islands as Island[];
