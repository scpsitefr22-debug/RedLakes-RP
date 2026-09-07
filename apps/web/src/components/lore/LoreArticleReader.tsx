"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { fetchLoreArticleBySlug, type LoreArticleView } from "@/lib/lore-feed";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";
import { EditableText } from "@/components/staff/EditableText";

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

  const isCms = article.source === "cms";
  const renderParagraphs = (content: string) => (
    <div className="prose-redlake hologram-border space-y-6 rounded-lg p-8">
      {content.split("\n\n").filter(Boolean).map((p, i) => (
        <DiscordMarkdown key={i} text={p} className="text-gray-300 leading-relaxed" />
      ))}
    </div>
  );

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
        {isCms && <Badge variant="classified">Dossier staff</Badge>}
      </div>
      {isCms ? (
        <>
          <EditableText
            as="h1"
            className="mb-3 text-4xl font-bold text-white"
            value={article.title}
            endpoint={`/lore/${article.id}`}
            field="title"
          />
          <EditableText
            as="p"
            className="mb-8 text-lg text-gray-500"
            value={article.excerpt}
            endpoint={`/lore/${article.id}`}
            field="excerpt"
            placeholder="Cliquer pour ajouter un extrait…"
          />
          <EditableText
            value={article.content}
            endpoint={`/lore/${article.id}`}
            field="content"
            multiline
            paragraphs
            wrapperClassName="prose-redlake hologram-border space-y-6 rounded-lg p-8"
            className="text-gray-300 leading-relaxed"
          />
        </>
      ) : (
        <>
          <h1 className="mb-3 text-4xl font-bold text-white">{article.title}</h1>
          <p className="mb-8 text-lg text-gray-500">{article.excerpt}</p>
          {renderParagraphs(article.content)}
        </>
      )}
    </>
  );
}
