"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Save, ArrowLeft, Trash2 } from "lucide-react";

interface FactionOption {
  id: string;
  slug: string;
  name: string;
}

export interface DepartmentFormData {
  slug: string;
  name: string;
  factionId: string;
  omegaTier: string;
  directorGradeName: string;
  color: string;
  utilities: string;
  objectives: string;
  chefId: string;
  deputyIds: string;
  budget: string;
}

interface DepartmentEditorProps {
  initial?: Partial<DepartmentFormData>;
  departmentId?: string;
  mode: "create" | "edit";
}

export function DepartmentEditor({ initial, departmentId, mode }: DepartmentEditorProps) {
  const router = useRouter();
  const [factions, setFactions] = useState<FactionOption[]>([]);
  const [form, setForm] = useState<DepartmentFormData>({
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    factionId: initial?.factionId ?? "",
    omegaTier: initial?.omegaTier ?? "",
    directorGradeName: initial?.directorGradeName ?? "",
    color: initial?.color ?? "",
    utilities: initial?.utilities ?? "",
    objectives: initial?.objectives ?? "",
    chefId: initial?.chefId ?? "",
    deputyIds: initial?.deputyIds ?? "",
    budget: initial?.budget ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<FactionOption[]>("/factions")
      .then(setFactions)
      .catch(() => undefined);
  }, []);

  const update = (key: keyof DepartmentFormData, value: string) => {
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

  const toArray = (value: string) =>
    value.split(",").map((v) => v.trim()).filter(Boolean);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        slug: form.slug,
        name: form.name,
        factionId: form.factionId || undefined,
        omegaTier: form.omegaTier || undefined,
        directorGradeName: form.directorGradeName || undefined,
        color: form.color || undefined,
        utilities: toArray(form.utilities),
        objectives: toArray(form.objectives),
        chefId: form.chefId || undefined,
        deputyIds: toArray(form.deputyIds),
        budget: form.budget === "" ? undefined : Number(form.budget),
      };

      if (mode === "create") {
        await apiFetch("/departments", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.push("/staff/departements");
      } else if (departmentId) {
        const { slug: _slug, ...updatePayload } = payload;
        await apiFetch(`/departments/${departmentId}`, {
          method: "PATCH",
          body: JSON.stringify(updatePayload),
        });
        router.push("/staff/departements");
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
    if (!departmentId || !confirm(`Supprimer définitivement le département "${form.name}" ?`)) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/departments/${departmentId}`, { method: "DELETE" });
      router.push("/staff/departements");
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
        href="/staff/departements"
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la gestion des départements
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-white">
        {mode === "create" ? "Nouveau département" : `Modifier — ${form.name}`}
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
          <label className="mb-1 block font-mono text-xs text-gray-500">Faction</label>
          <select
            className={inputClass}
            value={form.factionId}
            onChange={(e) => update("factionId", e.target.value)}
          >
            <option value="">— Aucune —</option>
            {factions.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Tier Oméga</label>
            <input className={inputClass} value={form.omegaTier} onChange={(e) => update("omegaTier", e.target.value)} placeholder="O2, O3..." />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Nom du grade de direction</label>
            <input className={inputClass} value={form.directorGradeName} onChange={(e) => update("directorGradeName", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Couleur (hex)</label>
            <input className={inputClass} value={form.color} onChange={(e) => update("color", e.target.value)} placeholder="#c41e1e" />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Budget</label>
            <input type="number" className={inputClass} value={form.budget} onChange={(e) => update("budget", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Domaines (séparés par virgule)</label>
          <input className={inputClass} value={form.utilities} onChange={(e) => update("utilities", e.target.value)} />
        </div>
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
        {mode === "edit" && departmentId && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-400/40 py-3 font-mono text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer le département
          </button>
        )}
        {form.slug && (
          <Link
            href={`/departements/${form.slug}`}
            className="block text-center font-mono text-xs text-gray-500 hover:text-redlake-glow"
          >
            Prévisualiser sur le site public →
          </Link>
        )}
      </div>
    </div>
  );
}
