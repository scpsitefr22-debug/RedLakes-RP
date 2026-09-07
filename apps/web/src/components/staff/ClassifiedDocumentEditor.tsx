"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import { DepartmentMultiSelect } from "@/components/staff/DepartmentMultiSelect";
import { EventMultiSelect } from "@/components/staff/EventMultiSelect";
import { ScpMultiSelect } from "@/components/staff/ScpMultiSelect";

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

interface FactionOption {
  id: string;
  name: string;
}

export interface ClassifiedDocumentFormData {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: string;
  restrictedDepartmentIds: string[];
  factionId: string;
  tags: string;
  attachments: string;
  linkedEventIds: string[];
  linkedScpIds: string[];
}

interface ClassifiedDocumentEditorProps {
  initial?: Partial<ClassifiedDocumentFormData>;
  documentId?: string;
  mode: "create" | "edit";
}

export function ClassifiedDocumentEditor({
  initial,
  documentId,
  mode,
}: ClassifiedDocumentEditorProps) {
  const router = useRouter();
  const [factions, setFactions] = useState<FactionOption[]>([]);
  const [form, setForm] = useState<ClassifiedDocumentFormData>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    status: initial?.status ?? "DRAFT",
    restrictedDepartmentIds: initial?.restrictedDepartmentIds ?? [],
    factionId: initial?.factionId ?? "",
    tags: initial?.tags ?? "",
    attachments: initial?.attachments ?? "",
    linkedEventIds: initial?.linkedEventIds ?? [],
    linkedScpIds: initial?.linkedScpIds ?? [],
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<FactionOption[]>("/factions").then(setFactions).catch(() => undefined);
  }, []);

  const update = (key: keyof ClassifiedDocumentFormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "title" && mode === "create") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setForm((f) => ({ ...f, slug }));
    }
  };

  const toArray = (value: string) =>
    value.split(",").map((v) => v.trim()).filter(Boolean);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        slug: form.slug,
        title: form.title,
        excerpt: form.excerpt || undefined,
        content: form.content,
        status: form.status,
        restrictedDepartmentIds: form.restrictedDepartmentIds,
        factionId: form.factionId || undefined,
        tags: toArray(form.tags),
        attachments: toArray(form.attachments),
        linkedEventIds: form.linkedEventIds,
        linkedScpIds: form.linkedScpIds,
      };

      if (mode === "create") {
        await apiFetch("/classified-documents", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.push("/staff/documents");
      } else if (documentId) {
        const { slug: _slug, ...updatePayload } = payload;
        await apiFetch(`/classified-documents/${documentId}`, {
          method: "PATCH",
          body: JSON.stringify(updatePayload),
        });
        router.push("/staff/documents");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!documentId || !confirm(`Supprimer définitivement le document "${form.title}" ?`)) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/classified-documents/${documentId}`, { method: "DELETE" });
      router.push("/staff/documents");
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
        href="/staff/documents"
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux documents classifiés
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-white">
        {mode === "create" ? "Nouveau document classifié" : `Modifier — ${form.title}`}
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
          <label className="mb-1 block font-mono text-xs text-gray-500">
            Slug (URL — {mode === "edit" ? "non modifiable" : "généré depuis le titre"})
          </label>
          <input
            className={inputClass}
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            disabled={mode === "edit"}
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Extrait</label>
          <input className={inputClass} value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Statut</label>
            <select className={inputClass} value={form.status} onChange={(e) => update("status", e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Faction concernée</label>
            <select className={inputClass} value={form.factionId} onChange={(e) => update("factionId", e.target.value)}>
              <option value="">— Aucune —</option>
              {factions.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>
        <DepartmentMultiSelect
          value={form.restrictedDepartmentIds}
          onChange={(ids) => setForm((f) => ({ ...f, restrictedDepartmentIds: ids }))}
        />
        <EventMultiSelect
          value={form.linkedEventIds}
          onChange={(ids) => setForm((f) => ({ ...f, linkedEventIds: ids }))}
        />
        <ScpMultiSelect
          value={form.linkedScpIds}
          onChange={(ids) => setForm((f) => ({ ...f, linkedScpIds: ids }))}
        />
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Tags (séparés par virgule)</label>
          <input className={inputClass} value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="confidentiel, o5, incident" />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Pièces jointes (URLs séparées par virgule)</label>
          <input className={inputClass} value={form.attachments} onChange={(e) => update("attachments", e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Contenu (Markdown supporté)</label>
          <textarea
            rows={16}
            className={inputClass}
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            placeholder="Rédigez le document ici..."
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
        {mode === "edit" && documentId && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-400/40 py-3 font-mono text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer le document
          </button>
        )}
        {form.status === "PUBLISHED" && form.slug && (
          <Link
            href={`/documents/${form.slug}`}
            className="block text-center font-mono text-xs text-gray-500 hover:text-redlake-glow"
          >
            Prévisualiser sur le site public →
          </Link>
        )}
      </div>
    </div>
  );
}
