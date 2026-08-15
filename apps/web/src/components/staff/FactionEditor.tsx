"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Save, ArrowLeft, Trash2 } from "lucide-react";

export interface FactionFormData {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  history: string;
  color: string;
  clearance: number;
  playable: boolean;
  objectives: string;
  chefId: string;
  deputyIds: string;
  budget: string;
}

interface FactionEditorProps {
  initial?: Partial<FactionFormData>;
  factionId?: string;
  mode: "create" | "edit";
}

export function FactionEditor({ initial, factionId, mode }: FactionEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<FactionFormData>({
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    tagline: initial?.tagline ?? "",
    description: initial?.description ?? "",
    history: initial?.history ?? "",
    color: initial?.color ?? "",
    clearance: initial?.clearance ?? 1,
    playable: initial?.playable ?? true,
    objectives: initial?.objectives ?? "",
    chefId: initial?.chefId ?? "",
    deputyIds: initial?.deputyIds ?? "",
    budget: initial?.budget ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (key: keyof FactionFormData, value: string | number | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "name" && mode === "create") {
      const slug = (value as string)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
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
        name: form.name,
        tagline: form.tagline || undefined,
        description: form.description || undefined,
        history: form.history || undefined,
        color: form.color || undefined,
        clearance: form.clearance,
        playable: form.playable,
        objectives: toArray(form.objectives),
        chefId: form.chefId || undefined,
        deputyIds: toArray(form.deputyIds),
        budget: form.budget === "" ? undefined : Number(form.budget),
      };

      if (mode === "create") {
        await apiFetch("/factions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.push("/staff/factions");
      } else if (factionId) {
        const { slug: _slug, ...updatePayload } = payload;
        await apiFetch(`/factions/${factionId}`, {
          method: "PATCH",
          body: JSON.stringify(updatePayload),
        });
        router.push("/staff/factions");
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
    if (!factionId || !confirm(`Supprimer définitivement la faction "${form.name}" ?`)) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/factions/${factionId}`, { method: "DELETE" });
      router.push("/staff/factions");
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
        href="/staff/factions"
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la gestion des factions
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-white">
        {mode === "create" ? "Nouvelle faction" : `Modifier — ${form.name}`}
      </h1>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Nom</label>
          <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">
            Slug (URL — {mode === "edit" ? "non modifiable" : "généré depuis le nom"})
          </label>
          <input
            className={inputClass}
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            disabled={mode === "edit"}
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Slogan</label>
          <input className={inputClass} value={form.tagline} onChange={(e) => update("tagline", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Description</label>
          <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Historique</label>
          <textarea rows={3} className={inputClass} value={form.history} onChange={(e) => update("history", e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Couleur (hex)</label>
            <input className={inputClass} value={form.color} onChange={(e) => update("color", e.target.value)} placeholder="#c41e1e" />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Habilitation (min. 1)</label>
            <input
              type="number" min={1}
              className={inputClass}
              value={form.clearance}
              onChange={(e) => update("clearance", parseInt(e.target.value) || 1)}
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Budget</label>
            <input type="number" className={inputClass} value={form.budget} onChange={(e) => update("budget", e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 font-mono text-xs text-gray-500">
          <input
            type="checkbox"
            checked={form.playable}
            onChange={(e) => update("playable", e.target.checked)}
          />
          Jouable (affichée dans le catalogue public)
        </label>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Objectifs (séparés par virgule)</label>
          <input className={inputClass} value={form.objectives} onChange={(e) => update("objectives", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">ID chef (User, optionnel)</label>
          <input className={inputClass} value={form.chefId} onChange={(e) => update("chefId", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">ID adjoints (séparés par virgule)</label>
          <input className={inputClass} value={form.deputyIds} onChange={(e) => update("deputyIds", e.target.value)} />
        </div>

        <button
          onClick={save}
          disabled={saving || !form.name}
          className="flex w-full items-center justify-center gap-2 rounded border border-redlake bg-redlake/20 py-3 font-mono text-sm uppercase tracking-wider text-white hover:bg-redlake/30 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        {mode === "edit" && factionId && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-400/40 py-3 font-mono text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer la faction
          </button>
        )}
        {form.slug && (
          <Link
            href={`/factions/${form.slug}`}
            className="block text-center font-mono text-xs text-gray-500 hover:text-redlake-glow"
          >
            Prévisualiser sur le site public →
          </Link>
        )}
      </div>
    </div>
  );
}
