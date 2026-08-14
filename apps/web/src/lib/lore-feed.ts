import { API_URL, API_PROXY } from "@/lib/api";
import { loreSections, loreCategories, type LoreSection } from "@/data/lore";

export interface LoreArticleView {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categoryLabel: string;
  clearance: number;
  featured: boolean;
  source: "static" | "cms";
  publishedAt?: string;
}

const CMS_CATEGORY_MAP: Record<string, string> = {
  MONDE: "monde",
  SITE: "site",
  CHRONOLOGIE: "chronologie",
  GUERRES: "guerres",
  CATASTROPHES: "catastrophes",
  PERSONNAGES: "personnages",
  SCP: "scp",
  FACTION: "faction",
  EVENEMENT: "evenement",
};

function staticToView(section: LoreSection): LoreArticleView {
  return {
    id: section.id,
    slug: section.id,
    title: section.title,
    excerpt: section.excerpt,
    content: section.content,
    category: section.category,
    categoryLabel: loreCategories[section.category] ?? section.category,
    clearance: section.clearance,
    featured: section.featured ?? false,
    source: "static",
  };
}

interface CmsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  clearance: number;
  featured: boolean;
  publishedAt: string | null;
}

function loreApiBase(): string {
  return typeof window !== "undefined" ? API_PROXY : API_URL;
}

export async function fetchCmsLore(clearance = 5): Promise<LoreArticleView[]> {
  try {
    const res = await fetch(`${loreApiBase()}/lore?clearance=${clearance}`, {
      ...(typeof window === "undefined" ? { next: { revalidate: 60 } } : {}),
      credentials: "include",
    });
    if (!res.ok) return [];
    const articles = (await res.json()) as CmsArticle[];
    return articles.map((a) => {
      const cat = CMS_CATEGORY_MAP[a.category] ?? a.category.toLowerCase();
      return {
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt ?? "",
        content: a.content,
        category: cat,
        categoryLabel:
          loreCategories[cat as keyof typeof loreCategories] ?? a.category,
        clearance: a.clearance,
        featured: a.featured,
        source: "cms" as const,
        publishedAt: a.publishedAt ?? undefined,
      };
    });
  } catch {
    return [];
  }
}

export async function getMergedLoreArticles(
  clearance = 5,
): Promise<LoreArticleView[]> {
  const cms = await fetchCmsLore(clearance);
  const cmsSlugs = new Set(cms.map((a) => a.slug));

  const staticFiltered = loreSections
    .filter((s) => s.clearance <= clearance && !cmsSlugs.has(s.id))
    .map(staticToView);

  return [...cms, ...staticFiltered].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.title.localeCompare(b.title, "fr");
  });
}

export async function fetchLoreArticleBySlug(
  slug: string,
  clearance = 5,
): Promise<LoreArticleView | null> {
  const staticSection = loreSections.find((s) => s.id === slug);
  if (staticSection && staticSection.clearance <= clearance) {
    return staticToView(staticSection);
  }

  try {
    const res = await fetch(
      `${loreApiBase()}/lore/${encodeURIComponent(slug)}?clearance=${clearance}`,
      {
        ...(typeof window === "undefined" ? { next: { revalidate: 60 } } : {}),
        credentials: "include",
      },
    );
    if (!res.ok) return null;
    const a = (await res.json()) as CmsArticle;
    const cat = CMS_CATEGORY_MAP[a.category] ?? a.category.toLowerCase();
    return {
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt ?? "",
      content: a.content,
      category: cat,
      categoryLabel:
        loreCategories[cat as keyof typeof loreCategories] ?? a.category,
      clearance: a.clearance,
      featured: a.featured,
      source: "cms",
      publishedAt: a.publishedAt ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function getClassifiedArchives(clearance: number) {
  const lore = await getMergedLoreArticles(clearance);
  return lore.filter((a) => a.clearance >= 3);
}
