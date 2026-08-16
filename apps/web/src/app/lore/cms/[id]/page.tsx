"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LoreEditor } from "@/components/lore/LoreEditor";
import { apiFetch } from "@/lib/api";

export default function EditLorePage() {
  const params = useParams();
  const id = params.id as string;
  const [article, setArticle] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Record<string, unknown>>(`/lore/cms`)
      .then((articles) => {
        const found = (articles as unknown as { id: string }[]).find((a) => a.id === id);
        if (found) setArticle(found as Record<string, unknown>);
        else setError("Article introuvable");
      })
      .catch(() => setError("API indisponible — lancez Lancer-REDLAKES.bat"));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-red-400">
        {error}
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <LoreEditor
      mode="edit"
      articleId={id}
      initial={{
        slug: article.slug as string,
        title: article.title as string,
        excerpt: (article.excerpt as string) ?? "",
        content: article.content as string,
        category: article.category as string,
        status: article.status as string,
        restrictedDepartmentIds: Array.isArray(article.restrictedDepartmentIds)
          ? (article.restrictedDepartmentIds as string[])
          : [],
        featured: article.featured as boolean,
        tags: Array.isArray(article.tags) ? (article.tags as string[]).join(", ") : "",
      }}
    />
  );
}
