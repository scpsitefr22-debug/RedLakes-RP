import { notFound } from "next/navigation";
import { categoryLabels } from "@/data/news";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { API_URL } from "@/lib/api";
import { EditableText } from "@/components/staff/EditableText";

interface Props {
  params: Promise<{ id: string }>;
}

interface ApiNewsArticleDetail {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

async function getNewsArticle(slug: string): Promise<ApiNewsArticleDetail | null> {
  try {
    const res = await fetch(`${API_URL}/news/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ActualiteDetailPage({ params }: Props) {
  const { id } = await params;
  const article = await getNewsArticle(id);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Badge variant="classified" className="mb-4">
        {categoryLabels[article.category as keyof typeof categoryLabels] ?? article.category}
      </Badge>
      <p className="mb-2 font-mono text-sm text-gray-600">
        {formatDate(article.date)}
      </p>
      <EditableText
        as="h1"
        className="mb-8 text-4xl font-bold text-white"
        value={article.title}
        endpoint={`/news/${article.id}`}
        field="title"
      />
      <div className="prose-redlake hologram-border rounded-lg p-8">
        <EditableText
          value={article.excerpt}
          endpoint={`/news/${article.id}`}
          field="excerpt"
          multiline
          markdown
          className="text-lg"
        />
        <p className="mt-4 text-gray-500">
          Article complet à rédiger par l&apos;équipe lore. Cette section sera
          connectée au CMS NestJS pour permettre aux rédacteurs de publier du
          contenu enrichi avec images et vidéos.
        </p>
      </div>
    </div>
  );
}
