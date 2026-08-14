"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { loreSections } from "@/data/lore";
import { Plus, FileText, Database } from "lucide-react";

interface LoreArticle {
  id: string;
  slug: string;
  title: string;
  status: string;
  category: string;
  clearance: number;
  updatedAt: string;
}

export default function LoreCmsPage() {
  const [articles, setArticles] = useState<LoreArticle[]>([]);
  const [error, setError] = useState("");
  const [usingStatic, setUsingStatic] = useState(false);

  useEffect(() => {
    apiFetch<LoreArticle[]>("/lore/cms")
      .then(setArticles)
      .catch(() => {
        setUsingStatic(true);
        setError("API hors ligne — articles statiques affichés en lecture seule. Lancez Lancer-REDLAKES.bat pour éditer.");
      });
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            CMS LORE — STAFF
          </p>
          <h1 className="text-4xl font-bold text-white">Gestion du Lore</h1>
          <p className="mt-4 text-gray-500">
            Rédigez et publiez les articles. Indexés dans Elasticsearch à la publication.
          </p>
        </div>
        <Link
          href="/lore/cms/nouveau"
          className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30"
        >
          <Plus className="h-4 w-4" /> Nouvel article
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-400">
          {error}
        </div>
      )}

      {usingStatic && (
        <div className="mb-6 space-y-2">
          <p className="flex items-center gap-2 font-mono text-xs text-gray-500">
            <Database className="h-4 w-4" /> Articles statiques ({loreSections.length})
          </p>
          {loreSections.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded border border-metal/50 p-4 opacity-70"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <h3 className="font-bold text-white">{s.title}</h3>
                  <p className="font-mono text-xs text-gray-600">/{s.id} — lecture seule</p>
                </div>
              </div>
              <Link href={`/lore/${s.id}`} className="font-mono text-xs text-gray-500 hover:text-white">
                Voir →
              </Link>
            </div>
          ))}
        </div>
      )}

      {articles.length > 0 && (
        <div className="space-y-3">
          <p className="font-mono text-xs text-gray-500">Articles API ({articles.length})</p>
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/lore/cms/${article.id}`}
              className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-redlake-glow" />
                <div>
                  <h3 className="font-bold text-white">{article.title}</h3>
                  <p className="font-mono text-xs text-gray-600">
                    /{article.slug} — {article.category} — Niv. {article.clearance}
                  </p>
                </div>
              </div>
              <span className={`font-mono text-xs ${
                article.status === "PUBLISHED" ? "text-green-400" : "text-yellow-400"
              }`}>
                {article.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
