"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { fetchLoreArticleBySlug, getMergedLoreArticles, type LoreArticleView } from "@/lib/lore-feed";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";
import { EditableText } from "@/components/staff/EditableText";

export function LoreArticleReader({ slug }: { slug: string }) {
  const [article, setArticle] = useState<LoreArticleView | null | undefined>(undefined);
  const [related, setRelated] = useState<LoreArticleView[]>([]);

  useEffect(() => {
    (async () => {
      const [found, all] = await Promise.all([fetchLoreArticleBySlug(slug), getMergedLoreArticles()]);
      setArticle(found);
      // Les autres articles de la même catégorie, à lire ensuite.
      setRelated(found ? all.filter((a) => a.category === found.category && a.slug !== found.slug).slice(0, 4) : []);
    })();
  }, [slug]);

  if (article === undefined) {
    return <p className="text-gray-400">Chargement du dossier…</p>;
  }

  if (!article) {
    return (
      <div className="hologram-border mx-auto max-w-xl p-8 text-center">
        <Lock className="mx-auto mb-4 h-8 w-8 text-red-400" />
        <h2 className="font-display text-2xl font-bold uppercase text-white">Accès refusé ou dossier introuvable</h2>
        <p className="mt-2 text-gray-400">
          Ce dossier est réservé à un autre département, ou n&apos;existe pas.{" "}
          <Link href="/connexion" className="text-redlake-glow hover:underline">
            Connectez-vous
          </Link>{" "}
          si vous pensez y avoir accès.
        </p>
        <Link href="/lore" className="label-mono mt-5 inline-block text-[11px] text-gray-400 hover:text-white">
          ← Retour au lore
        </Link>
      </div>
    );
  }

  const isCms = article.source === "cms";

  return (
    <>
      <Link href="/lore" className="label-mono text-[11px] text-gray-400 transition-colors hover:text-white">
        ← Encyclopédie narrative
      </Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-mono border border-redlake-glow/50 px-1.5 py-0.5 text-[10px] text-redlake-glow">
              {article.categoryLabel}
            </span>
            {isCms && <span className="label-mono border border-line-strong px-1.5 py-0.5 text-[10px] text-gray-300">Dossier staff</span>}
          </div>

          {isCms ? (
            <>
              <EditableText
                as="h1"
                className="font-display mt-4 text-5xl font-extrabold uppercase leading-[0.95] text-white"
                value={article.title}
                endpoint={`/lore/${article.id}`}
                field="title"
              />
              <EditableText
                as="p"
                className="mt-5 max-w-[65ch] text-xl leading-relaxed text-gray-300"
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
                wrapperClassName="prose-redlake mt-8 max-w-[65ch] space-y-5 border-t border-line pt-8"
                className="leading-relaxed text-gray-300"
              />
            </>
          ) : (
            <>
              <h1 className="font-display mt-4 text-5xl font-extrabold uppercase leading-[0.95] text-white">{article.title}</h1>
              <p className="mt-5 max-w-[65ch] text-xl leading-relaxed text-gray-300">{article.excerpt}</p>
              <div className="prose-redlake mt-8 max-w-[65ch] space-y-5 border-t border-line pt-8">
                {article.content
                  .split("\n\n")
                  .filter(Boolean)
                  .map((p, i) => (
                    <DiscordMarkdown key={i} text={p} className="leading-relaxed text-gray-300" />
                  ))}
              </div>
            </>
          )}
        </article>

        {related.length > 0 && (
          <aside>
            <h2 className="label-mono mb-3 flex items-center gap-3 text-[11px] text-gray-400">
              Dans la même catégorie
              <span className="h-px flex-1 bg-line" aria-hidden />
            </h2>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/lore/${r.slug}`} className="block border border-line bg-[#0d1117] p-4 transition-colors hover:border-line-strong">
                    <p className="font-display text-lg font-bold uppercase leading-tight text-white">{r.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-400">{r.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </>
  );
}
