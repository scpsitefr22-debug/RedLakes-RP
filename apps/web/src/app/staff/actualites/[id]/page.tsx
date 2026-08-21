"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { NewsEditor } from "@/components/staff/NewsEditor";
import { NewsRevisionHistory } from "@/components/staff/NewsRevisionHistory";
import { apiFetch } from "@/lib/api";

interface ApiNewsArticleFull {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string | null;
  featured: boolean;
}

export default function EditNewsArticlePage() {
  const params = useParams();
  const id = params.id as string;
  const [article, setArticle] = useState<ApiNewsArticleFull | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ApiNewsArticleFull>(`/news/by-id/${id}`)
      .then(setArticle)
      .catch(() => setError("Article introuvable ou API indisponible — connectez-vous en staff."));
  }, [id]);

  if (error) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-red-400">{error}</div>;
  }

  if (!article) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <>
      <NewsEditor
        mode="edit"
        articleId={id}
        initial={{
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          date: article.date.slice(0, 10),
          category: article.category,
          image: article.image ?? "",
          featured: article.featured,
        }}
      />
      <div className="mx-auto max-w-3xl px-4 pb-12">
        <NewsRevisionHistory articleId={id} />
      </div>
    </>
  );
}
