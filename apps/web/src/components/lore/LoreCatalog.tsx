"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { loreCategories } from "@/data/lore";
import { ClearanceBanner } from "@/components/clearance/ClearanceBanner";
import { usePlayerSession } from "@/hooks/usePlayerSession";
import { fetchCmsLore, type LoreArticleView } from "@/lib/lore-feed";
import { loreSections } from "@/data/lore";
import { Lock } from "lucide-react";

function staticArticles(clearance: number): LoreArticleView[] {
  return loreSections
    .filter((s) => s.clearance <= clearance)
    .map((s) => ({
      id: s.id,
      slug: s.id,
      title: s.title,
      excerpt: s.excerpt,
      content: s.content,
      category: s.category,
      categoryLabel: loreCategories[s.category] ?? s.category,
      clearance: s.clearance,
      featured: s.featured ?? false,
      source: "static" as const,
    }));
}

export function LoreCatalog() {
  const { clearance, loading: sessionLoading } = usePlayerSession();
  const [articles, setArticles] = useState<LoreArticleView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    (async () => {
      const cms = await fetchCmsLore(clearance);
      const cmsSlugs = new Set(cms.map((a) => a.slug));
      const staticFiltered = staticArticles(clearance).filter(
        (s) => !cmsSlugs.has(s.slug),
      );
      const merged = [...cms, ...staticFiltered].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.title.localeCompare(b.title, "fr");
      });
      setArticles(merged);
      setLoading(false);
    })();
  }, [clearance, sessionLoading]);

  const featured = articles.filter((s) => s.featured);
  const categories = [...new Set(articles.map((a) => a.category))];

  const lockedCount = loreSections.filter(
    (s) => s.clearance > clearance,
  ).length;

  return (
    <>
      <ClearanceBanner />
      {lockedCount > 0 && (
        <p className="mb-6 flex items-center gap-2 font-mono text-xs text-gray-600">
          <Lock className="h-3 w-3" />
          {lockedCount} article(s) classifié(s) masqué(s) à votre niveau.
        </p>
      )}
      {loading ? (
        <p className="text-gray-500">Chargement de l&apos;encyclopédie…</p>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                <Star className="h-5 w-5 text-yellow-400" /> Articles essentiels
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {featured.map((section) => (
                  <Link
                    key={section.slug}
                    href={`/lore/${section.slug}`}
                    className="group hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
                  >
                    <h3 className="mb-2 text-lg font-bold text-white group-hover:text-redlake-glow">
                      {section.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-500">{section.excerpt}</p>
                    <Badge className="mt-2">Niv. {section.clearance}</Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {categories.map((cat) => {
            const sections = articles.filter((s) => s.category === cat);
            const label =
              loreCategories[cat as keyof typeof loreCategories] ?? cat;
            return (
              <section key={cat} className="mb-10">
                <h2 className="mb-4 font-mono text-sm tracking-widest text-redlake-glow">
                  {label.toUpperCase()}
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {sections.map((section) => (
                    <Link
                      key={section.slug}
                      href={`/lore/${section.slug}`}
                      className="group flex gap-4 rounded border border-metal/50 p-4 transition-colors hover:border-redlake/30 hover:bg-redlake/5"
                    >
                      <BookOpen className="h-5 w-5 shrink-0 text-redlake-glow" />
                      <div>
                        <h3 className="font-bold text-white group-hover:text-redlake-glow">
                          {section.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-gray-500">
                          {section.excerpt}
                        </p>
                        <Badge className="mt-2">Niv. {section.clearance}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </>
  );
}
