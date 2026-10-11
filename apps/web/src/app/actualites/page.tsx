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
  featured?: boolean;
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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="label-mono mb-3 flex items-center gap-2 text-redlake-glow">
          <span className="h-px w-8 bg-redlake-glow" aria-hidden />
          Fil d&apos;information
        </p>
        <h1 className="font-display text-5xl font-extrabold text-white">Actualités</h1>
        <p className="mt-4 max-w-2xl text-gray-400">
          Ce qui se passe en RP, les nouveaux dossiers SCP et les annonces du serveur.
        </p>
      </div>

      <ActualitesCatalog newsArticles={newsArticles} />
    </div>
  );
}
