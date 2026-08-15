"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Save, ArrowLeft, Trash2 } from "lucide-react";

interface DepartmentOption {
  id: string;
  slug: string;
  name: string;
}

export interface TeamFormData {
  slug: string;
  name: string;
  departmentId: string;
  category: string;
  composition: string;
  hasMedic: boolean;
  customizableBy: string;
  chefId: string;
  quota: string;
  description: string;
}

interface TeamEditorProps {
  initial?: Partial<TeamFormData>;
  teamId?: string;
  mode: "create" | "edit";
}

export function TeamEditor({ initial, teamId, mode }: TeamEditorProps) {
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [form, setForm] = useState<TeamFormData>({
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    departmentId: initial?.departmentId ?? "",
    category: initial?.category ?? "",
    composition: initial?.composition ?? "",
    hasMedic: initial?.hasMedic ?? false,
    customizableBy: initial?.customizableBy ?? "",
    chefId: initial?.chefId ?? "",
    quota: initial?.quota ?? "",
    description: initial?.description ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<DepartmentOption[]>("/departments")
      .then(setDepartments)
      .catch(() => undefined);
  }, []);

  const update = (key: keyof TeamFormData, value: string | boolean) => {
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
        departmentId: form.departmentId,
        category: form.category,
        composition: toArray(form.composition),
        hasMedic: form.hasMedic,
        customizableBy: form.customizableBy || undefined,
        chefId: form.chefId || undefined,
        quota: form.quota === "" ? undefined : Number(form.quota),
        description: form.description || undefined,
      };

      if (mode === "create") {
        await apiFetch("/teams", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.push("/staff/teams");
      } else if (teamId) {
        const { slug: _slug, ...updatePayload } = payload;
        await apiFetch(`/teams/${teamId}`, {
          method: "PATCH",
          body: JSON.stringify(updatePayload),
        });
        router.push("/staff/teams");
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
    if (!teamId || !confirm(`Supprimer définitivement l'équipe "${form.name}" ?`)) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/teams/${teamId}`, { method: "DELETE" });
      router.push("/staff/teams");
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
        href="/staff/teams"
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la gestion des équipes
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-white">
        {mode === "create" ? "Nouvelle équipe" : `Modifier — ${form.name}`}
      </h1>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Nom</label>
          <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="TEAM ELITE : 01, FIM Nu-7..." />
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Département</label>
            <select
              className={inputClass}
              value={form.departmentId}
              onChange={(e) => update("departmentId", e.target.value)}
            >
              <option value="">— Choisir —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Catégorie</label>
            <input className={inputClass} value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Elite, FIM, Mobile, Entretien..." />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Composition (grades, séparés par virgule)</label>
          <input className={inputClass} value={form.composition} onChange={(e) => update("composition", e.target.value)} placeholder="Sergent, Caporal, Soldat ×3" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Quota (effectif max)</label>
            <input type="number" className={inputClass} value={form.quota} onChange={(e) => update("quota", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Personnalisable par</label>
            <input className={inputClass} value={form.customizableBy} onChange={(e) => update("customizableBy", e.target.value)} placeholder="Directeur Sécurité, Commandant..." />
          </div>
        </div>
        <label className="flex items-center gap-2 font-mono text-xs text-gray-500">
          <input
            type="checkbox"
            checked={form.hasMedic}
            onChange={(e) => update("hasMedic", e.target.checked)}
          />
          Médecin rattaché à l&apos;équipe
        </label>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Description</label>
          <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">ID chef (User, optionnel)</label>
          <input className={inputClass} value={form.chefId} onChange={(e) => update("chefId", e.target.value)} />
        </div>

        <button
          onClick={save}
          disabled={saving || !form.name || !form.departmentId || !form.category}
          className="flex w-full items-center justify-center gap-2 rounded border border-redlake bg-redlake/20 py-3 font-mono text-sm uppercase tracking-wider text-white hover:bg-redlake/30 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        {mode === "edit" && teamId && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-400/40 py-3 font-mono text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer l&apos;équipe
          </button>
        )}
      </div>
    </div>
  );
}
