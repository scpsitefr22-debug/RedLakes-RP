"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { categoryLabels } from "@/data/news";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface ApiNewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

export function ActualitesCatalog({ newsArticles }: { newsArticles: ApiNewsArticle[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of newsArticles) map.set(a.category, (map.get(a.category) ?? 0) + 1);
    return map;
  }, [newsArticles]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return newsArticles
      .filter((a) => (activeCategory ? a.category === activeCategory : true))
      .filter(
        (a) =>
          !q ||
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [newsArticles, activeCategory, query]);

  const categories = [...counts.keys()];

  return (
    <>
      <div className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un article…"
          className="w-full rounded border border-metal/50 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`rounded border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
            activeCategory === null
              ? "border-redlake bg-redlake/20 text-white"
              : "border-metal/50 text-gray-500 hover:border-metal"
          }`}
        >
          Toutes ({newsArticles.length})
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveCategory(activeCategory === c ? null : c)}
            className={`rounded border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              activeCategory === c
                ? "border-redlake bg-redlake/20 text-white"
                : "border-metal/50 text-gray-500 hover:border-metal"
            }`}
          >
            {categoryLabels[c as keyof typeof categoryLabels] ?? c} ({counts.get(c)})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          {newsArticles.length === 0
            ? "Aucun article disponible pour le moment."
            : "Aucun article ne correspond à ce filtre."}
        </div>
      ) : (
        <div className="space-y-6">
          {visible.map((article) => (
            <Link
              key={article.id}
              href={`/actualites/${article.slug}`}
              className="group block hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
            >
              <div className="mb-3 flex items-center gap-3">
                <Badge variant="classified">
                  {categoryLabels[article.category as keyof typeof categoryLabels] ?? article.category}
                </Badge>
                <span className="font-mono text-xs text-gray-600">
                  {formatDate(article.date)}
                </span>
              </div>
              <h2 className="mb-2 text-xl font-bold text-white group-hover:text-redlake-glow">
                {article.title}
              </h2>
              <p className="text-gray-500">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
