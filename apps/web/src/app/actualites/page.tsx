import Link from "next/link";
import { categoryLabels } from "@/data/news";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { API_URL } from "@/lib/api";

export const metadata = { title: "Actualités" };

interface ApiNewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

async function getNewsArticles(): Promise<ApiNewsArticle[]> {
  try {
    const res = await fetch(`${API_URL}/news`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ActualitesPage() {
  const newsArticles = await getNewsArticles();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white">Actualités</h1>
        <p className="mt-4 text-gray-500">
          Mises à jour, nouveaux SCP, événements et changements de lore.
        </p>
      </div>

      {newsArticles.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          Aucun article disponible pour le moment.
        </div>
      ) : (
        <div className="space-y-6">
          {newsArticles.map((article) => (
            <Link
              key={article.id}
              href={`/actualites/${article.slug}`}
              className="group block hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
            >
              <div className="mb-3 flex items-center gap-3">
                <Badge variant="classified">
                  {categoryLabels[article.category as keyof typeof categoryLabels] ?? article.category}
                </Badge>
                <span className="font-mono text-xs text-gray-600">
                  {formatDate(article.date)}
                </span>
              </div>
              <h2 className="mb-2 text-xl font-bold text-white group-hover:text-redlake-glow">
                {article.title}
              </h2>
              <p className="text-gray-500">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
