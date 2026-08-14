import { notFound } from "next/navigation";
import { newsArticles, categoryLabels } from "@/data/news";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return newsArticles.map((a) => ({ id: a.id }));
}

export default async function ActualiteDetailPage({ params }: Props) {
  const { id } = await params;
  const article = newsArticles.find((a) => a.id === id);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Badge variant="classified" className="mb-4">
        {categoryLabels[article.category]}
      </Badge>
      <p className="mb-2 font-mono text-sm text-gray-600">
        {formatDate(article.date)}
      </p>
      <h1 className="mb-8 text-4xl font-bold text-white">{article.title}</h1>
      <div className="prose-redlake hologram-border rounded-lg p-8">
        <p className="text-lg">{article.excerpt}</p>
        <p className="mt-4 text-gray-500">
          Article complet à rédiger par l&apos;équipe lore. Cette section sera
          connectée au CMS NestJS pour permettre aux rédacteurs de publier du
          contenu enrichi avec images et vidéos.
        </p>
      </div>
    </div>
  );
}
