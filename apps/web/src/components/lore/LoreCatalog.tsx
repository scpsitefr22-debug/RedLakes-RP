"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
        <p className="text-gray-400">Chargement de l&apos;encyclopédie…</p>
      ) : (
        <div className="space-y-12">
          {featured.length > 0 && (
            <section>
              <h2 className="label-mono mb-4 flex items-center gap-3 text-[11px] text-gray-400">
                À lire en premier
                <span className="h-px flex-1 bg-line" aria-hidden />
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {featured.map((section) => (
                  <Link
                    key={section.slug}
                    href={`/lore/${section.slug}`}
                    className="group relative flex flex-col overflow-hidden border border-line bg-[#0d1117] p-6 transition-colors hover:border-line-strong"
                  >
                    <span className="absolute inset-x-0 top-0 h-1 bg-redlake-glow" aria-hidden />
                    <p className="label-mono text-[10px] text-redlake-glow">{section.categoryLabel}</p>
                    <h3 className="font-display mt-2 text-3xl font-extrabold uppercase leading-none text-white">{section.title}</h3>
                    <p className="mt-3 line-clamp-3 flex-1 leading-relaxed text-gray-400">{section.excerpt}</p>
                    <p className="font-display mt-5 text-sm font-bold uppercase tracking-[0.12em] text-gray-400 transition-colors group-hover:text-white">
                      Lire →
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {categories.map((cat) => {
            const sections = articles.filter((s) => s.category === cat);
            const label = loreCategories[cat as keyof typeof loreCategories] ?? cat;
            return (
              <section key={cat}>
                <h2 className="mb-4 flex items-end justify-between gap-3 border-b border-line pb-2">
                  <span className="font-display text-2xl font-bold uppercase text-white">{label}</span>
                  <span className="label-mono text-[10px] tabular-nums text-gray-500">
                    {sections.length} article{sections.length > 1 ? "s" : ""}
                  </span>
                </h2>
                <ul className="grid gap-x-8 md:grid-cols-2">
                  {sections.map((section) => (
                    <li key={section.slug} className="border-b border-line/60">
                      <Link href={`/lore/${section.slug}`} className="group flex items-start gap-4 py-4">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-redlake-glow" aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-white transition-colors group-hover:text-redlake-glow">
                            {section.title}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-sm text-gray-400">{section.excerpt}</span>
                        </span>
                        <span className="text-gray-600 transition-colors group-hover:text-white" aria-hidden>
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
