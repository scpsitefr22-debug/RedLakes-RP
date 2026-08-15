"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Save, ArrowLeft, Trash2 } from "lucide-react";

const CATEGORIES = ["mise-a-jour", "scp", "evenement", "lore"];

export interface NewsFormData {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  featured: boolean;
}

interface NewsEditorProps {
  initial?: Partial<NewsFormData>;
  articleId?: string;
  mode: "create" | "edit";
}

export function NewsEditor({ initial, articleId, mode }: NewsEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<NewsFormData>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    date: initial?.date ?? "",
    category: initial?.category ?? "mise-a-jour",
    image: initial?.image ?? "",
    featured: initial?.featured ?? false,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (key: keyof NewsFormData, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "title" && mode === "create") {
      const slug = (value as string)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setForm((f) => ({ ...f, slug }));
    }
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        slug: form.slug,
        title: form.title,
        excerpt: form.excerpt,
        date: form.date,
        category: form.category,
        image: form.image || undefined,
        featured: form.featured,
      };

      if (mode === "create") {
        await apiFetch("/news", { method: "POST", body: JSON.stringify(payload) });
        router.push("/staff/actualites");
      } else if (articleId) {
        const { slug: _slug, ...updatePayload } = payload;
        await apiFetch(`/news/${articleId}`, { method: "PATCH", body: JSON.stringify(updatePayload) });
        router.push("/staff/actualites");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} — connectez-vous en staff pour éditer.`
          : "Erreur de sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!articleId || !confirm(`Supprimer définitivement "${form.title}" ?`)) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/news/${articleId}`, { method: "DELETE" });
      router.push("/staff/actualites");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded border border-metal bg-black px-4 py-2 text-white outline-none focus:border-redlake";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/staff/actualites"
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux actualités
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-white">
        {mode === "create" ? "Nouvel article" : `Modifier — ${form.title}`}
      </h1>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Titre</label>
          <input className={inputClass} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="REDLAKES RP — Phase de préparation" />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">
            Slug (URL — {mode === "edit" ? "non modifiable" : "généré depuis le titre"})
          </label>
          <input className={inputClass} value={form.slug} onChange={(e) => update("slug", e.target.value)} disabled={mode === "edit"} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Date</label>
            <input type="date" className={inputClass} value={form.date} onChange={(e) => update("date", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Catégorie</label>
            <select className={inputClass} value={form.category} onChange={(e) => update("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Résumé</label>
          <textarea rows={3} className={inputClass} value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Image (URL, optionnel)</label>
          <input className={inputClass} value={form.image} onChange={(e) => update("image", e.target.value)} />
        </div>
        <label className="flex items-center gap-2 font-mono text-xs text-gray-500">
          <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
          Article mis en avant
        </label>

        <button
          onClick={save}
          disabled={saving || !form.title || !form.date || !form.excerpt}
          className="flex w-full items-center justify-center gap-2 rounded border border-redlake bg-redlake/20 py-3 font-mono text-sm uppercase tracking-wider text-white hover:bg-redlake/30 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        {mode === "edit" && articleId && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-400/40 py-3 font-mono text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer l&apos;article
          </button>
        )}
      </div>
    </div>
  );
}
