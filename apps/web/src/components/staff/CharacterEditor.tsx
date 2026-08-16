"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import { DepartmentMultiSelect } from "@/components/staff/DepartmentMultiSelect";

export interface CharacterFormData {
  slug: string;
  name: string;
  title: string;
  faction: string;
  biography: string;
  quotes: string;
  history: string;
  portrait: string;
  restrictedDepartmentIds: string[];
}

interface CharacterEditorProps {
  initial?: Partial<CharacterFormData>;
  characterId?: string;
  mode: "create" | "edit";
}

export function CharacterEditor({ initial, characterId, mode }: CharacterEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<CharacterFormData>({
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    title: initial?.title ?? "",
    faction: initial?.faction ?? "",
    biography: initial?.biography ?? "",
    quotes: initial?.quotes ?? "",
    history: initial?.history ?? "",
    portrait: initial?.portrait ?? "",
    restrictedDepartmentIds: initial?.restrictedDepartmentIds ?? [],
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (key: keyof CharacterFormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "name" && mode === "create") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setForm((f) => ({ ...f, slug }));
    }
  };

  const toLines = (value: string) =>
    value.split("\n").map((v) => v.trim()).filter(Boolean);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        slug: form.slug,
        name: form.name,
        title: form.title,
        faction: form.faction,
        biography: form.biography,
        quotes: toLines(form.quotes),
        history: toLines(form.history),
        portrait: form.portrait || undefined,
        restrictedDepartmentIds: form.restrictedDepartmentIds,
      };

      if (mode === "create") {
        await apiFetch("/characters", { method: "POST", body: JSON.stringify(payload) });
        router.push("/staff/personnages");
      } else if (characterId) {
        const { slug: _slug, ...updatePayload } = payload;
        await apiFetch(`/characters/${characterId}`, { method: "PATCH", body: JSON.stringify(updatePayload) });
        router.push("/staff/personnages");
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
    if (!characterId || !confirm(`Supprimer définitivement "${form.name}" ?`)) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/characters/${characterId}`, { method: "DELETE" });
      router.push("/staff/personnages");
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
        href="/staff/personnages"
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux personnages
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-white">
        {mode === "create" ? "Nouveau personnage" : `Modifier — ${form.name}`}
      </h1>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Nom</label>
          <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Directeur ████████" />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">
            Slug (URL — {mode === "edit" ? "non modifiable" : "généré depuis le nom"})
          </label>
          <input className={inputClass} value={form.slug} onChange={(e) => update("slug", e.target.value)} disabled={mode === "edit"} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Titre</label>
            <input className={inputClass} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Directeur du Site-12" />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Faction / affiliation</label>
            <input className={inputClass} value={form.faction} onChange={(e) => update("faction", e.target.value)} placeholder="Fondation SCP" />
          </div>
        </div>
        <DepartmentMultiSelect
          value={form.restrictedDepartmentIds}
          onChange={(ids) => setForm((f) => ({ ...f, restrictedDepartmentIds: ids }))}
        />
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Biographie</label>
          <textarea rows={4} className={inputClass} value={form.biography} onChange={(e) => update("biography", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Citations (une par ligne)</label>
          <textarea rows={3} className={inputClass} value={form.quotes} onChange={(e) => update("quotes", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Historique (une entrée par ligne)</label>
          <textarea rows={4} className={inputClass} value={form.history} onChange={(e) => update("history", e.target.value)} placeholder="2024 — Intègre le Site-12" />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Portrait (URL, optionnel)</label>
          <input className={inputClass} value={form.portrait} onChange={(e) => update("portrait", e.target.value)} />
        </div>

        <button
          onClick={save}
          disabled={saving || !form.name || !form.title || !form.faction}
          className="flex w-full items-center justify-center gap-2 rounded border border-redlake bg-redlake/20 py-3 font-mono text-sm uppercase tracking-wider text-white hover:bg-redlake/30 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        {mode === "edit" && characterId && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-400/40 py-3 font-mono text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer le personnage
          </button>
        )}
      </div>
    </div>
  );
}
