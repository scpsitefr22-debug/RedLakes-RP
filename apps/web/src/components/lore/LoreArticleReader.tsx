"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { fetchLoreArticleBySlug, type LoreArticleView } from "@/lib/lore-feed";

export function LoreArticleReader({ slug }: { slug: string }) {
  const [article, setArticle] = useState<LoreArticleView | null | undefined>(
    undefined,
  );

  useEffect(() => {
    (async () => {
      setArticle(await fetchLoreArticleBySlug(slug));
    })();
  }, [slug]);

  if (article === undefined) {
    return <p className="text-gray-500">Chargement du dossier…</p>;
  }

  if (!article) {
    return (
      <div className="hologram-border rounded-lg p-8 text-center">
        <Lock className="mx-auto mb-4 h-8 w-8 text-red-400" />
        <h2 className="text-xl font-bold text-white">Accès refusé ou dossier introuvable</h2>
        <p className="mt-2 text-gray-500">
          Ce dossier est réservé à un autre département, ou n&apos;existe pas.{" "}
          <Link href="/connexion" className="text-redlake-glow hover:underline">
            Connectez-vous
          </Link>{" "}
          si vous pensez y avoir accès.
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
        {article.source === "cms" && (
          <Badge variant="classified">Dossier staff</Badge>
        )}
      </div>
      <h1 className="mb-3 text-4xl font-bold text-white">{article.title}</h1>
      <p className="mb-8 text-lg text-gray-500">{article.excerpt}</p>

      <div className="prose-redlake hologram-border space-y-6 rounded-lg p-8">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line text-gray-300 leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </>
  );
}
