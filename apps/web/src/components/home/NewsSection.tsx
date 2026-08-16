"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { categoryLabels } from "@/data/news";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Radio } from "lucide-react";
import { API_PROXY } from "@/lib/api";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface ApiNewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug: string;
  featured: boolean;
}
import type { Transmission } from "@/lib/transmissions";
import { TRANSMISSION_TYPE_LABELS } from "@/lib/transmissions";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  featured: boolean;
  href: string;
  live?: boolean;
}

function transmissionToNews(t: Transmission): NewsItem | null {
  if (t.type !== "ANNOUNCE" && t.type !== "EVENT") return null;
  return {
    id: t.id,
    title: t.title,
    excerpt: t.excerpt ?? t.body.slice(0, 160),
    date: t.occurredAt,
    category: TRANSMISSION_TYPE_LABELS[t.type],
    featured: t.type === "ANNOUNCE",
    href: "/transmissions",
    live: true,
  };
}

export function NewsSection() {
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    (async () => {
      let live: NewsItem[] = [];
      try {
        const res = await fetch(`${API_PROXY}/transmissions?limit=20`);
        if (res.ok) {
          const transmissions = (await res.json()) as Transmission[];
          live = transmissions
            .map(transmissionToNews)
            .filter((x): x is NewsItem => x !== null);
        }
      } catch {
        /* API offline */
      }

      let staticItems: NewsItem[] = [];
      try {
        const res = await fetch(`${API_PROXY}/news`);
        if (res.ok) {
          const articles = (await res.json()) as ApiNewsArticle[];
          staticItems = articles.map((a) => ({
            id: a.id,
            title: a.title,
            excerpt: a.excerpt,
            date: a.date,
            category: categoryLabels[a.category as keyof typeof categoryLabels] ?? a.category,
            featured: a.featured,
            href: `/actualites/${a.slug}`,
          }));
        }
      } catch {
        /* API offline */
      }

      const merged = [...live, ...staticItems]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8);

      setItems(merged);
    })();
  }, []);

  const featured = items.filter((a) => a.featured).slice(0, 2);
  const recent = items.slice(0, 6);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          kicker="TRANSMISSIONS RÉCENTES"
          title="Actualités"
          action={{ label: "Toutes les actualités", href: "/actualites" }}
        />

        {items.length === 0 ? (
          <p className="text-gray-500">Chargement des transmissions…</p>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              {featured.map((article, i) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group hologram-border rounded-lg p-6 lg:col-span-1"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant="classified">{article.category}</Badge>
                    {article.live && (
                      <span className="flex items-center gap-1 font-mono text-[10px] text-redlake-glow">
                        <Radio className="h-3 w-3" /> Live Discord
                      </span>
                    )}
                    <span className="font-mono text-xs text-gray-600">
                      {formatDate(article.date)}
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white group-hover:text-redlake-glow">
                    <Link href={article.href}>{article.title}</Link>
                  </h3>
                  <p className="text-sm text-gray-500">{article.excerpt}</p>
                </motion.article>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {recent
                .filter((a) => !a.featured)
                .map((article) => (
                  <Link
                    key={article.id}
                    href={article.href}
                    className="panel-flat flex items-center justify-between rounded px-4 py-3 transition-colors hover:border-redlake/30 hover:bg-redlake/5"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{article.title}</p>
                      <p className="font-mono text-xs text-gray-600">
                        {formatDate(article.date)}
                        {article.live ? " · transmission" : ""}
                      </p>
                    </div>
                    <Badge>{article.category}</Badge>
                  </Link>
                ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
