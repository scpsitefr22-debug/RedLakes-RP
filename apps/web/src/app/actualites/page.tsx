import { API_URL } from "@/lib/api";
import { ActualitesCatalog } from "@/components/actualites/ActualitesCatalog";

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

      <ActualitesCatalog newsArticles={newsArticles} />
    </div>
  );
}
