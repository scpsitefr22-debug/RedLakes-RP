"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import { DepartmentMultiSelect } from "@/components/staff/DepartmentMultiSelect";

const EVENT_TYPES = ["breach", "invasion", "guerre", "crise-xk", "experience"];

interface FactionOption {
  id: string;
  slug: string;
  name: string;
}

export interface GameEventFormData {
  slug: string;
  title: string;
  date: string;
  type: string;
  description: string;
  casualties: string;
  outcome: string;
  restrictedDepartmentIds: string[];
  factionId: string;
}

interface GameEventEditorProps {
  initial?: Partial<GameEventFormData>;
  eventId?: string;
  mode: "create" | "edit";
}

export function GameEventEditor({ initial, eventId, mode }: GameEventEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<GameEventFormData>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    date: initial?.date ?? "",
    type: initial?.type ?? "breach",
    description: initial?.description ?? "",
    casualties: initial?.casualties ?? "",
    outcome: initial?.outcome ?? "",
    restrictedDepartmentIds: initial?.restrictedDepartmentIds ?? [],
    factionId: initial?.factionId ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [factions, setFactions] = useState<FactionOption[]>([]);

  useEffect(() => {
    apiFetch<FactionOption[]>("/factions").then(setFactions).catch(() => undefined);
  }, []);

  const update = (key: keyof GameEventFormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "title" && mode === "create") {
      const slug = value
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
        date: form.date,
        type: form.type,
        description: form.description,
        casualties: form.casualties || undefined,
        outcome: form.outcome,
        restrictedDepartmentIds: form.restrictedDepartmentIds,
        factionId: form.factionId || undefined,
      };

      if (mode === "create") {
        await apiFetch("/events", { method: "POST", body: JSON.stringify(payload) });
        router.push("/staff/evenements");
      } else if (eventId) {
        const { slug: _slug, ...updatePayload } = payload;
        await apiFetch(`/events/${eventId}`, { method: "PATCH", body: JSON.stringify(updatePayload) });
        router.push("/staff/evenements");
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
    if (!eventId || !confirm(`Supprimer définitivement "${form.title}" ?`)) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/events/${eventId}`, { method: "DELETE" });
      router.push("/staff/evenements");
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
        href="/staff/evenements"
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux événements
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-white">
        {mode === "create" ? "Nouvel événement" : `Modifier — ${form.title}`}
      </h1>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Titre</label>
          <input className={inputClass} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Brèche Secteur Keter-02" />
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
            <label className="mb-1 block font-mono text-xs text-gray-500">Type</label>
            <select className={inputClass} value={form.type} onChange={(e) => update("type", e.target.value)}>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <DepartmentMultiSelect
          value={form.restrictedDepartmentIds}
          onChange={(ids) => setForm((f) => ({ ...f, restrictedDepartmentIds: ids }))}
        />
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">
            Faction liée (optionnel — affiché sur la fiche de la faction)
          </label>
          <select className={inputClass} value={form.factionId} onChange={(e) => update("factionId", e.target.value)}>
            <option value="">— Aucune —</option>
            {factions.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Description</label>
          <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Victimes (optionnel)</label>
          <input className={inputClass} value={form.casualties} onChange={(e) => update("casualties", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Issue</label>
          <textarea rows={2} className={inputClass} value={form.outcome} onChange={(e) => update("outcome", e.target.value)} />
        </div>

        <button
          onClick={save}
          disabled={saving || !form.title || !form.date || !form.outcome}
          className="flex w-full items-center justify-center gap-2 rounded border border-redlake bg-redlake/20 py-3 font-mono text-sm uppercase tracking-wider text-white hover:bg-redlake/30 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        {mode === "edit" && eventId && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-400/40 py-3 font-mono text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer l&apos;événement
          </button>
        )}
      </div>
    </div>
  );
}
