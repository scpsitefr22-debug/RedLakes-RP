import Link from "next/link";
import { newsArticles, categoryLabels } from "@/data/news";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Actualités" };

export default function ActualitesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white">Actualités</h1>
        <p className="mt-4 text-gray-500">
          Mises à jour, nouveaux SCP, événements et changements de lore.
        </p>
      </div>

      <div className="space-y-6">
        {newsArticles.map((article) => (
          <Link
            key={article.id}
            href={`/actualites/${article.id}`}
            className="group block hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
          >
            <div className="mb-3 flex items-center gap-3">
              <Badge variant="classified">{categoryLabels[article.category]}</Badge>
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
    </div>
  );
}
