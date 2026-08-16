"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Star } from "lucide-react";
import { loreCategories } from "@/data/lore";
import { ClearanceBanner } from "@/components/clearance/ClearanceBanner";
import { getMergedLoreArticles, type LoreArticleView } from "@/lib/lore-feed";

export function LoreCatalog() {
  const [articles, setArticles] = useState<LoreArticleView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setArticles(await getMergedLoreArticles());
      setLoading(false);
    })();
  }, []);

  const featured = articles.filter((s) => s.featured);
  const categories = [...new Set(articles.map((a) => a.category))];

  return (
    <>
      <ClearanceBanner />
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
