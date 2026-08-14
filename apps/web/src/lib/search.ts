import { scpObjects } from "@/data/scp";
import { factions, mtfUnits } from "@/data/factions";
import { loreSections, characters, gameEvents } from "@/data/lore";
import { newsArticles } from "@/data/news";
import { mapLocations } from "@/data/map";
import { site12Departments } from "@/data/site12";

export interface SearchResult {
  id: string;
  title: string;
  type: "scp" | "faction" | "lore" | "event" | "news" | "location" | "character" | "department" | "mtf";
  href: string;
  excerpt: string;
}

export function searchAll(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];

  scpObjects.forEach((s) => {
    if (
      s.number.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    ) {
      results.push({
        id: s.id,
        title: `${s.number} — ${s.name}`,
        type: "scp",
        href: `/wiki/${s.id}`,
        excerpt: s.description.slice(0, 120),
      });
    }
  });

  factions.forEach((f) => {
    if (f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)) {
      results.push({
        id: f.id,
        title: f.name,
        type: "faction",
        href: `/factions/${f.id}`,
        excerpt: f.tagline,
      });
    }
  });

  mtfUnits.forEach((m) => {
    if (m.name.toLowerCase().includes(q) || m.codename.toLowerCase().includes(q)) {
      results.push({
        id: m.id,
        title: `${m.name} (${m.codename})`,
        type: "mtf",
        href: `/factions/mtf/${m.id}`,
        excerpt: m.motto,
      });
    }
  });

  loreSections.forEach((l) => {
    if (l.title.toLowerCase().includes(q) || l.content.toLowerCase().includes(q)) {
      results.push({
        id: l.id,
        title: l.title,
        type: "lore",
        href: `/lore/${l.id}`,
        excerpt: l.content.slice(0, 120),
      });
    }
  });

  characters.forEach((c) => {
    if (c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)) {
      results.push({
        id: c.id,
        title: c.name,
        type: "character",
        href: `/personnages/${c.id}`,
        excerpt: c.title,
      });
    }
  });

  gameEvents.forEach((e) => {
    if (e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)) {
      results.push({
        id: e.id,
        title: e.title,
        type: "event",
        href: `/evenements/${e.id}`,
        excerpt: e.description,
      });
    }
  });

  newsArticles.forEach((n) => {
    if (n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q)) {
      results.push({
        id: n.id,
        title: n.title,
        type: "news",
        href: `/actualites/${n.id}`,
        excerpt: n.excerpt,
      });
    }
  });

  mapLocations.forEach((l) => {
    if (l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)) {
      results.push({
        id: l.id,
        title: l.name,
        type: "location",
        href: `/carte#${l.id}`,
        excerpt: l.description.slice(0, 120),
      });
    }
  });

  site12Departments.forEach((d) => {
    if (d.name.toLowerCase().includes(q)) {
      results.push({
        id: d.id,
        title: d.name,
        type: "department",
        href: `/departements/${d.id}`,
        excerpt: (d.objectives ?? d.utilities).join(", "),
      });
    }
  });

  return results.slice(0, 20);
}
