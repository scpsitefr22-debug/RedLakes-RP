"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { categoryHex, categoryLabels } from "@/data/news";
import { NewsCategory } from "@/components/actualites/NewsCategory";
import { cn, formatDate } from "@/lib/utils";

interface ApiNewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  featured?: boolean;
}

/**
 * "mise-a-jour" = vraie annonce site/serveur (HRP) ; scp/evenement/lore =
 * actu in-universe (RP) — voir docs/RP-HRP-MATRIX.md. Categorie inconnue
 * (pas dans categoryLabels) traitee par defaut comme RP, la plupart du
 * contenu du site l'etant.
 */
const HRP_CATEGORIES = new Set(["mise-a-jour"]);

export function ActualitesCatalog({ newsArticles }: { newsArticles: ApiNewsArticle[] }) {
  const [scope, setScope] = useState<"rp" | "hrp" | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const byScope = useMemo(
    () => newsArticles.filter((a) => !scope || (HRP_CATEGORIES.has(a.category) ? "hrp" : "rp") === scope),
    [newsArticles, scope],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of byScope) map.set(a.category, (map.get(a.category) ?? 0) + 1);
    return map;
  }, [byScope]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return byScope
      .filter((a) => (activeCategory ? a.category === activeCategory : true))
      .filter((a) => !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [byScope, activeCategory, query]);

  const categories = [...counts.keys()];
  const rpCount = newsArticles.filter((a) => !HRP_CATEGORIES.has(a.category)).length;
  const hrpCount = newsArticles.length - rpCount;
  const filtering = Boolean(activeCategory || query.trim());
  // À la une : l'article le plus récent marqué « à la une », sinon le plus récent.
  const lead = filtering ? null : (visible.find((a) => a.featured) ?? visible[0] ?? null);
  const rest = lead ? visible.filter((a) => a.id !== lead.id) : visible;

  const tab = (active: boolean) =>
    cn(
      "font-display border-b-2 px-3 py-2 text-sm font-bold uppercase tracking-[0.1em] transition-colors",
      active ? "border-redlake-glow text-white" : "border-transparent text-gray-500 hover:text-gray-200",
    );
  const chip = (active: boolean) =>
    cn(
      "flex items-center gap-2 border px-3 py-1.5 text-sm transition-colors",
      active ? "border-white/60 bg-white/10 text-white" : "border-line text-gray-400 hover:border-line-strong hover:text-white",
    );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line">
        <div className="flex flex-wrap" role="tablist" aria-label="Type d'actualité">
          {(
            [
              { key: null, label: "Tout", count: newsArticles.length },
              { key: "rp" as const, label: "Actualités RP", count: rpCount },
              { key: "hrp" as const, label: "Annonces du site", count: hrpCount },
            ]
          ).map((opt) => (
            <button
              key={opt.label}
              type="button"
              role="tab"
              aria-selected={scope === opt.key}
              onClick={() => {
                setScope(opt.key);
                setActiveCategory(null);
              }}
              className={tab(scope === opt.key)}
            >
              {opt.label} <span className="ml-1 tabular-nums text-gray-500">{opt.count}</span>
            </button>
          ))}
        </div>
        <label className="relative mb-2 block w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article…"
            aria-label="Rechercher un article"
            className="w-full border border-line bg-black/40 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake-glow"
          />
        </label>
      </div>

      <div className="mb-8 flex flex-wrap gap-2" aria-label="Catégorie">
        <button type="button" onClick={() => setActiveCategory(null)} aria-pressed={activeCategory === null} className={chip(activeCategory === null)}>
          Toutes <span className="tabular-nums text-gray-500">{byScope.length}</span>
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveCategory(activeCategory === c ? null : c)}
            aria-pressed={activeCategory === c}
            className={chip(activeCategory === c)}
          >
            <span className="h-2 w-2" style={{ background: categoryHex[c] ?? "#9ca3af" }} aria-hidden />
            {categoryLabels[c as keyof typeof categoryLabels] ?? c}
            <span className="tabular-nums text-gray-500">{counts.get(c)}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="hologram-border p-8 text-center text-gray-400">
          {newsArticles.length === 0 ? "Aucun article disponible pour le moment." : "Aucun article ne correspond à ce filtre."}
        </div>
      ) : (
        <div className="space-y-6">
          {lead && (
            <Link
              href={`/actualites/${lead.slug}`}
              className="group relative block overflow-hidden border border-line bg-[#0d1117] p-6 transition-colors hover:border-line-strong sm:p-8"
              style={{ boxShadow: `inset 4px 0 0 ${categoryHex[lead.category] ?? "#e5392f"}` }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="label-mono bg-redlake-glow px-1.5 py-0.5 text-[10px] text-white">À la une</span>
                <NewsCategory category={lead.category} />
                <time className="label-mono text-[10px] text-gray-500" dateTime={lead.date}>
                  {formatDate(lead.date)}
                </time>
              </div>
              <h2 className="font-display mt-4 max-w-3xl text-4xl font-extrabold uppercase leading-[0.95] text-white sm:text-5xl">
                {lead.title}
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-300">{lead.excerpt}</p>
              <p className="font-display mt-6 text-sm font-bold uppercase tracking-[0.12em] text-redlake-glow transition-colors group-hover:text-white">
                Lire l&apos;article →
              </p>
            </Link>
          )}

          {rest.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {rest.map((article) => (
                <Link
                  key={article.id}
                  href={`/actualites/${article.slug}`}
                  className="group flex flex-col border border-line bg-[#0d1117] p-5 transition-colors hover:border-line-strong"
                  style={{ boxShadow: `inset 3px 0 0 ${categoryHex[article.category] ?? "#9ca3af"}` }}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <NewsCategory category={article.category} />
                    <time className="label-mono text-[10px] text-gray-500" dateTime={article.date}>
                      {formatDate(article.date)}
                    </time>
                  </div>
                  <h2 className="font-display mt-3 text-2xl font-bold uppercase leading-tight text-white">{article.title}</h2>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-400">{article.excerpt}</p>
                  <p className="label-mono mt-4 text-[10px] text-gray-500 transition-colors group-hover:text-white">Lire →</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
