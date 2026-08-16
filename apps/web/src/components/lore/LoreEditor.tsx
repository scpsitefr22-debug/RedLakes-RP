"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import { DepartmentMultiSelect } from "@/components/staff/DepartmentMultiSelect";

const CATEGORIES = [
  "MONDE", "SITE", "CHRONOLOGIE", "GUERRES", "CATASTROPHES",
  "PERSONNAGES", "SCP", "FACTION", "EVENEMENT",
] as const;

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export interface LoreFormData {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: string;
  restrictedDepartmentIds: string[];
  featured: boolean;
  tags: string;
}

interface LoreEditorProps {
  initial?: Partial<LoreFormData>;
  articleId?: string;
  mode: "create" | "edit";
}

export function LoreEditor({ initial, articleId, mode }: LoreEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<LoreFormData>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    category: initial?.category ?? "MONDE",
    status: initial?.status ?? "DRAFT",
    restrictedDepartmentIds: initial?.restrictedDepartmentIds ?? [],
    featured: initial?.featured ?? false,
    tags: initial?.tags ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (key: keyof LoreFormData, value: string | number | boolean) => {
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
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      if (mode === "create") {
        await apiFetch("/lore", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.push("/lore/cms");
      } else if (articleId) {
        await apiFetch(`/lore/${articleId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        router.push("/lore/cms");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} — Lancez l'API (Lancer-REDLAKES.bat) et connectez-vous en staff.`
          : "Erreur de sauvegarde"
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!articleId || !confirm("Supprimer définitivement cet article ?")) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/lore/${articleId}`, { method: "DELETE" });
      router.push("/lore/cms");
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
        href="/lore/cms"
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Retour au CMS
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-white">
        {mode === "create" ? "Nouvel article" : "Modifier l'article"}
      </h1>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Titre</label>
          <input className={inputClass} value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Slug (URL)</label>
          <input className={inputClass} value={form.slug} onChange={(e) => update("slug", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Extrait</label>
          <input className={inputClass} value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Catégorie</label>
            <select className={inputClass} value={form.category} onChange={(e) => update("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Statut</label>
            <select className={inputClass} value={form.status} onChange={(e) => update("status", e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <DepartmentMultiSelect
          value={form.restrictedDepartmentIds}
          onChange={(ids) => setForm((f) => ({ ...f, restrictedDepartmentIds: ids }))}
        />
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Tags (séparés par virgule)</label>
          <input className={inputClass} value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="aegis, faction, lore" />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={form.featured}
            onChange={(e) => update("featured", e.target.checked)}
            className="accent-red-700"
          />
          <label htmlFor="featured" className="font-mono text-sm text-gray-400">Article mis en avant</label>
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Contenu (Markdown supporté)</label>
          <textarea
            rows={16}
            className={inputClass}
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            placeholder="Rédigez le lore ici..."
          />
        </div>
        <button
          onClick={save}
          disabled={saving || !form.title || !form.content}
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
        {form.status === "PUBLISHED" && form.slug && (
          <Link
            href={`/lore/${form.slug}`}
            className="block text-center font-mono text-xs text-gray-500 hover:text-redlake-glow"
          >
            Prévisualiser sur le site public →
          </Link>
        )}
      </div>
    </div>
  );
}
