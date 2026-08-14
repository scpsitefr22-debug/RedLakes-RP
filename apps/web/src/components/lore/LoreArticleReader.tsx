"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CLEARANCE_LABELS } from "@/lib/clearance";
import { usePlayerSession, canViewClearance } from "@/hooks/usePlayerSession";
import { fetchLoreArticleBySlug, type LoreArticleView } from "@/lib/lore-feed";

export function LoreArticleReader({ slug }: { slug: string }) {
  const { clearance, loading: sessionLoading, authenticated } = usePlayerSession();
  const [article, setArticle] = useState<LoreArticleView | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (sessionLoading) return;
    (async () => {
      const data = await fetchLoreArticleBySlug(slug, clearance);
      setArticle(data);
    })();
  }, [slug, clearance, sessionLoading]);

  if (sessionLoading || article === undefined) {
    return <p className="text-gray-500">Chargement du dossier…</p>;
  }

  if (!article) {
    return (
      <div className="hologram-border rounded-lg p-8 text-center">
        <Lock className="mx-auto mb-4 h-8 w-8 text-red-400" />
        <h2 className="text-xl font-bold text-white">Accès refusé ou dossier introuvable</h2>
        <p className="mt-2 text-gray-500">
          Habilitation insuffisante ou article inexistant.
          {!authenticated && (
            <>
              {" "}
              <Link href="/connexion" className="text-redlake-glow hover:underline">
                Connectez-vous
              </Link>{" "}
              pour afficher votre niveau réel.
            </>
          )}
        </p>
        <Link
          href="/lore"
          className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" /> Retour au lore
        </Link>
      </div>
    );
  }

  const accessible = canViewClearance(article.clearance, clearance);
  const paragraphs = article.content.split("\n\n").filter(Boolean);

  return (
    <>
      <Link
        href="/lore"
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Encyclopédie
      </Link>
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="classified">{article.categoryLabel}</Badge>
        <Badge variant="classified">
          {CLEARANCE_LABELS[article.clearance as 1 | 2 | 3 | 4 | 5]}
        </Badge>
        {article.source === "cms" && (
          <Badge variant="classified">Dossier staff</Badge>
        )}
      </div>
      <h1 className="mb-3 text-4xl font-bold text-white">
        {accessible ? article.title : "████████ — ACCÈS REFUSÉ"}
      </h1>
      {accessible && (
        <p className="mb-8 text-lg text-gray-500">{article.excerpt}</p>
      )}

      <div className="prose-redlake hologram-border space-y-6 rounded-lg p-8">
        {accessible ? (
          paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line text-gray-300 leading-relaxed">
              {p}
            </p>
          ))
        ) : (
          <p className="font-mono text-red-400/70">
            [DONNÉES EXPURGÉES] Habilitation de niveau {article.clearance} requise
            (vous : niveau {clearance}).
          </p>
        )}
      </div>
    </>
  );
}
