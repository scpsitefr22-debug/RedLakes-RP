"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Plus, Newspaper } from "lucide-react";

interface StaffNewsArticle {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  featured: boolean;
}

export default function StaffActualitesPage() {
  const [articles, setArticles] = useState<StaffNewsArticle[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<StaffNewsArticle[]>("/news")
      .then(setArticles)
      .catch(() => setError("Impossible de charger les actualités — API indisponible."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            GESTION DES ACTUALITÉS — STAFF
          </p>
          <h1 className="text-4xl font-bold text-white">Actualités</h1>
          <p className="mt-4 text-gray-500">
            Créez, modifiez et supprimez les articles d&apos;actualité.
          </p>
        </div>
        <Link
          href="/staff/actualites/nouveau"
          className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30"
        >
          <Plus className="h-4 w-4" /> Nouvel article
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && !error && articles.length === 0 && (
        <p className="text-gray-500">Aucun article enregistré.</p>
      )}

      <div className="space-y-3">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/staff/actualites/${a.id}`}
            className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
          >
            <div className="flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-redlake-glow" />
              <div>
                <h3 className="font-bold text-white">{a.title}</h3>
                <p className="font-mono text-xs text-gray-600">
                  {new Date(a.date).toLocaleDateString("fr-FR")} — {a.category}
                  {a.featured ? " — à la une" : ""}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
