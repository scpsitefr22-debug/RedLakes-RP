"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Save, ArrowLeft, Trash2 } from "lucide-react";

const BRANCHES = [
  "omega",
  "direction",
  "securite",
  "scientifique",
  "maintenance",
  "general",
  "classes",
] as const;

interface DepartmentOption {
  id: string;
  slug: string;
  name: string;
}

export interface GradeFormData {
  slug: string;
  name: string;
  branch: string;
  tier: string;
  departmentId: string;
  departmentRefId: string;
  pay: string;
  quota: string;
  clearance: number;
  description: string;
  objectives: string;
  utilities: string;
  accessZones: string;
  siteSections: string;
}

interface GradeEditorProps {
  initial?: Partial<GradeFormData>;
  gradeId?: string;
  mode: "create" | "edit";
}

export function GradeEditor({ initial, gradeId, mode }: GradeEditorProps) {
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [form, setForm] = useState<GradeFormData>({
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    branch: initial?.branch ?? "securite",
    tier: initial?.tier ?? "",
    departmentId: initial?.departmentId ?? "",
    departmentRefId: initial?.departmentRefId ?? "",
    pay: initial?.pay ?? "",
    quota: initial?.quota ?? "",
    clearance: initial?.clearance ?? 1,
    description: initial?.description ?? "",
    objectives: initial?.objectives ?? "",
    utilities: initial?.utilities ?? "",
    accessZones: initial?.accessZones ?? "",
    siteSections: initial?.siteSections ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<DepartmentOption[]>("/departments")
      .then(setDepartments)
      .catch(() => undefined);
  }, []);

  const update = (
    key: keyof GradeFormData,
    value: string | number,
  ) => {
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
        branch: form.branch,
        tier: form.tier,
        departmentId: form.departmentId || undefined,
        departmentRefId: form.departmentRefId || undefined,
        pay: form.pay === "" ? undefined : Number(form.pay),
        quota: form.quota === "" ? undefined : Number(form.quota),
        clearance: form.clearance,
        description: form.description || undefined,
        objectives: toArray(form.objectives),
        utilities: toArray(form.utilities),
        accessZones: toArray(form.accessZones),
        siteSections: toArray(form.siteSections),
      };

      if (mode === "create") {
        await apiFetch("/grades", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.push("/staff/grades");
      } else if (gradeId) {
        const { slug: _slug, ...updatePayload } = payload;
        await apiFetch(`/grades/${gradeId}`, {
          method: "PATCH",
          body: JSON.stringify(updatePayload),
        });
        router.push("/staff/grades");
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
    if (!gradeId || !confirm(`Supprimer définitivement le grade "${form.name}" ?`)) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/grades/${gradeId}`, { method: "DELETE" });
      router.push("/staff/grades");
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
        href="/staff/grades"
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la gestion des grades
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-white">
        {mode === "create" ? "Nouveau grade" : `Modifier — ${form.name}`}
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Branche</label>
            <select className={inputClass} value={form.branch} onChange={(e) => update("branch", e.target.value)}>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Tier</label>
            <input className={inputClass} value={form.tier} onChange={(e) => update("tier", e.target.value)} placeholder="officier, troupe, admin..." />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Département</label>
          <select
            className={inputClass}
            value={form.departmentRefId}
            onChange={(e) => update("departmentRefId", e.target.value)}
          >
            <option value="">— Aucun —</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Salaire ($/sem.)</label>
            <input type="number" className={inputClass} value={form.pay} onChange={(e) => update("pay", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Quota</label>
            <input type="number" className={inputClass} value={form.quota} onChange={(e) => update("quota", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Habilitation (1-5)</label>
            <input
              type="number" min={1} max={5}
              className={inputClass}
              value={form.clearance}
              onChange={(e) => update("clearance", parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Description</label>
          <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Objectifs (séparés par virgule)</label>
          <input className={inputClass} value={form.objectives} onChange={(e) => update("objectives", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Domaines de compétence (séparés par virgule)</label>
          <input className={inputClass} value={form.utilities} onChange={(e) => update("utilities", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Zones d&apos;accès (codes séparés par virgule)</label>
          <input className={inputClass} value={form.accessZones} onChange={(e) => update("accessZones", e.target.value)} placeholder="n1, n2, keter, safe..." />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Sections du site accessibles (séparées par virgule)</label>
          <input className={inputClass} value={form.siteSections} onChange={(e) => update("siteSections", e.target.value)} />
        </div>

        <button
          onClick={save}
          disabled={saving || !form.name || !form.branch}
          className="flex w-full items-center justify-center gap-2 rounded border border-redlake bg-redlake/20 py-3 font-mono text-sm uppercase tracking-wider text-white hover:bg-redlake/30 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        {mode === "edit" && gradeId && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-400/40 py-3 font-mono text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer le grade
          </button>
        )}
        {form.slug && (
          <Link
            href={`/grades/${form.slug}`}
            className="block text-center font-mono text-xs text-gray-500 hover:text-redlake-glow"
          >
            Prévisualiser sur le site public →
          </Link>
        )}
      </div>
    </div>
  );
}
