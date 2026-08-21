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
  restrictedDepartmentIds: string[];
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
    restrictedDepartmentIds: [],
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
  restrictedDepartmentIds: string[];
  featured: boolean;
  publishedAt: string | null;
}

function loreApiBase(): string {
  return typeof window !== "undefined" ? API_PROXY : API_URL;
}

function cmsToView(a: CmsArticle): LoreArticleView {
  const cat = CMS_CATEGORY_MAP[a.category] ?? a.category.toLowerCase();
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? "",
    content: a.content,
    category: cat,
    categoryLabel: loreCategories[cat as keyof typeof loreCategories] ?? a.category,
    restrictedDepartmentIds: a.restrictedDepartmentIds,
    featured: a.featured,
    source: "cms",
    publishedAt: a.publishedAt ?? undefined,
  };
}

export async function fetchCmsLore(): Promise<LoreArticleView[]> {
  try {
    const res = await fetch(`${loreApiBase()}/lore`, {
      ...(typeof window === "undefined" ? { cache: "no-store" } : {}),
      credentials: "include",
    });
    if (!res.ok) return [];
    const articles = (await res.json()) as CmsArticle[];
    return articles.map(cmsToView);
  } catch {
    return [];
  }
}

export async function getMergedLoreArticles(): Promise<LoreArticleView[]> {
  const cms = await fetchCmsLore();
  const cmsSlugs = new Set(cms.map((a) => a.slug));

  const staticFiltered = loreSections
    .filter((s) => !cmsSlugs.has(s.id))
    .map(staticToView);

  return [...cms, ...staticFiltered].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.title.localeCompare(b.title, "fr");
  });
}

export async function fetchLoreArticleBySlug(
  slug: string,
): Promise<LoreArticleView | null> {
  // Le CMS (base de données) est la source de vérité — un article statique
  // avec le même slug ne sert que de contenu de secours pré-CMS, jamais
  // prioritaire sur ce que le staff a réellement écrit/modifié.
  try {
    const res = await fetch(`${loreApiBase()}/lore/${encodeURIComponent(slug)}`, {
      ...(typeof window === "undefined" ? { cache: "no-store" } : {}),
      credentials: "include",
    });
    if (res.ok) {
      return cmsToView((await res.json()) as CmsArticle);
    }
  } catch {
    /* API indisponible — on retombe sur le contenu statique ci-dessous */
  }

  const staticSection = loreSections.find((s) => s.id === slug);
  return staticSection ? staticToView(staticSection) : null;
}

export async function getClassifiedArchives() {
  const lore = await getMergedLoreArticles();
  return lore.filter((a) => a.restrictedDepartmentIds.length > 0);
}
