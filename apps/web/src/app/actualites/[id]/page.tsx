import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryHex } from "@/data/news";
import { NewsCategory } from "@/components/actualites/NewsCategory";
import { formatDate } from "@/lib/utils";
import { API_URL } from "@/lib/api";
import { EditableText } from "@/components/staff/EditableText";

interface Props {
  params: Promise<{ id: string }>;
}

interface ApiNewsArticleDetail {
  id: string;
  slug?: string;
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

async function getLatestNews(): Promise<ApiNewsArticleDetail[]> {
  try {
    const res = await fetch(`${API_URL}/news`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const article = await getNewsArticle(id);
  return { title: article?.title ?? "Actualité introuvable" };
}

export default async function ActualiteDetailPage({ params }: Props) {
  const { id } = await params;
  const [article, latest] = await Promise.all([getNewsArticle(id), getLatestNews()]);
  if (!article) notFound();

  const color = categoryHex[article.category] ?? "#e5392f";
  const others = latest
    .filter((a) => a.id !== article.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/actualites" className="label-mono text-[11px] text-gray-400 transition-colors hover:text-white">
        ← Toutes les actualités
      </Link>

      <article className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <NewsCategory category={article.category} />
            <time className="label-mono text-[11px] text-gray-400" dateTime={article.date}>
              {formatDate(article.date)}
            </time>
          </div>
          <EditableText
            as="h1"
            className="font-display mt-4 text-5xl font-extrabold uppercase leading-[0.95] text-white"
            value={article.title}
            endpoint={`/news/${article.id}`}
            field="title"
          />
          <div className="mt-8 border-l-4 pl-6" style={{ borderColor: color }}>
            <EditableText
              value={article.excerpt}
              endpoint={`/news/${article.id}`}
              field="excerpt"
              multiline
              markdown
              className="prose-redlake text-lg leading-relaxed text-gray-200"
            />
          </div>
        </div>

        {others.length > 0 && (
          <aside>
            <h2 className="label-mono mb-3 flex items-center gap-3 text-[11px] text-gray-400">
              Autres actualités
              <span className="h-px flex-1 bg-line" aria-hidden />
            </h2>
            <ul className="space-y-3">
              {others.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/actualites/${o.slug ?? o.id}`}
                    className="block border border-line bg-[#0d1117] p-4 transition-colors hover:border-line-strong"
                    style={{ boxShadow: `inset 3px 0 0 ${categoryHex[o.category] ?? "#9ca3af"}` }}
                  >
                    <time className="label-mono text-[10px] text-gray-500" dateTime={o.date}>
                      {formatDate(o.date)}
                    </time>
                    <p className="font-display mt-1 text-lg font-bold uppercase leading-tight text-white">{o.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </article>
    </div>
  );
}
