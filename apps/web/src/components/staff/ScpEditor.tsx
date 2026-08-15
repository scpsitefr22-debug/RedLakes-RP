"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Save, ArrowLeft, Trash2 } from "lucide-react";

const SCP_CLASSES = ["Safe", "Euclid", "Keter", "Thaumiel", "Apollyon"];

export interface ScpFormData {
  slug: string;
  number: string;
  name: string;
  class: string;
  threatLevel: string;
  containment: string;
  history: string;
  description: string;
  image: string;
  incidents: string;
  tests: string;
  addendums: string;
  containmentCost: string;
  personnelAssigned: string;
  breachCount: string;
  clearance: string;
}

interface ScpEditorProps {
  initial?: Partial<ScpFormData>;
  scpId?: string;
  mode: "create" | "edit";
}

const EMPTY_JSON = "[]";

export function ScpEditor({ initial, scpId, mode }: ScpEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<ScpFormData>({
    slug: initial?.slug ?? "",
    number: initial?.number ?? "",
    name: initial?.name ?? "",
    class: initial?.class ?? "Euclid",
    threatLevel: initial?.threatLevel ?? "1",
    containment: initial?.containment ?? "",
    history: initial?.history ?? "",
    description: initial?.description ?? "",
    image: initial?.image ?? "",
    incidents: initial?.incidents ?? EMPTY_JSON,
    tests: initial?.tests ?? EMPTY_JSON,
    addendums: initial?.addendums ?? EMPTY_JSON,
    containmentCost: initial?.containmentCost ?? "",
    personnelAssigned: initial?.personnelAssigned ?? "",
    breachCount: initial?.breachCount ?? "",
    clearance: initial?.clearance ?? "1",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (key: keyof ScpFormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "number" && mode === "create") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setForm((f) => ({ ...f, slug }));
    }
  };

  const parseJsonField = (label: string, value: string): unknown[] => {
    try {
      const parsed = JSON.parse(value || "[]");
      if (!Array.isArray(parsed)) throw new Error();
      return parsed;
    } catch {
      throw new Error(`${label} : JSON invalide (doit être un tableau)`);
    }
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        slug: form.slug,
        number: form.number,
        name: form.name,
        class: form.class,
        threatLevel: Number(form.threatLevel) || 0,
        containment: form.containment,
        history: form.history,
        description: form.description,
        image: form.image || undefined,
        incidents: parseJsonField("Incidents", form.incidents),
        tests: parseJsonField("Tests", form.tests),
        addendums: parseJsonField("Addendums", form.addendums),
        containmentCost: form.containmentCost || undefined,
        personnelAssigned: form.personnelAssigned === "" ? undefined : Number(form.personnelAssigned),
        breachCount: form.breachCount === "" ? undefined : Number(form.breachCount),
        clearance: form.clearance === "" ? undefined : Number(form.clearance),
      };

      if (mode === "create") {
        await apiFetch("/scp", { method: "POST", body: JSON.stringify(payload) });
        router.push("/staff/scp");
      } else if (scpId) {
        const { slug: _slug, ...updatePayload } = payload;
        await apiFetch(`/scp/${scpId}`, { method: "PATCH", body: JSON.stringify(updatePayload) });
        router.push("/staff/scp");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message}${err.message.includes("JSON") ? "" : " — connectez-vous en staff pour éditer."}`
          : "Erreur de sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!scpId || !confirm(`Supprimer définitivement "${form.name}" ?`)) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/scp/${scpId}`, { method: "DELETE" });
      router.push("/staff/scp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded border border-metal bg-black px-4 py-2 text-white outline-none focus:border-redlake";
  const monoClass = inputClass + " font-mono text-xs";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/staff/scp"
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Retour au wiki (staff)
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-white">
        {mode === "create" ? "Nouvel objet SCP" : `Modifier — ${form.name}`}
      </h1>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Numéro</label>
            <input className={inputClass} value={form.number} onChange={(e) => update("number", e.target.value)} placeholder="SCP-173" />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">
              Slug (URL — {mode === "edit" ? "non modifiable" : "généré depuis le numéro"})
            </label>
            <input className={inputClass} value={form.slug} onChange={(e) => update("slug", e.target.value)} disabled={mode === "edit"} />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Nom</label>
          <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="La Sculpture" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Classe</label>
            <select className={inputClass} value={form.class} onChange={(e) => update("class", e.target.value)}>
              {SCP_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Niveau de menace</label>
            <input type="number" min={0} max={5} className={inputClass} value={form.threatLevel} onChange={(e) => update("threatLevel", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Habilitation requise</label>
            <input type="number" min={1} max={5} className={inputClass} value={form.clearance} onChange={(e) => update("clearance", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Confinement</label>
          <textarea rows={2} className={inputClass} value={form.containment} onChange={(e) => update("containment", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Historique</label>
          <textarea rows={2} className={inputClass} value={form.history} onChange={(e) => update("history", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Description</label>
          <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Image (URL, optionnel)</label>
          <input className={inputClass} value={form.image} onChange={(e) => update("image", e.target.value)} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Coût de confinement</label>
            <input className={inputClass} value={form.containmentCost} onChange={(e) => update("containmentCost", e.target.value)} placeholder="12 000$/mois" />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Personnel assigné</label>
            <input type="number" min={0} className={inputClass} value={form.personnelAssigned} onChange={(e) => update("personnelAssigned", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Brèches recensées</label>
            <input type="number" min={0} className={inputClass} value={form.breachCount} onChange={(e) => update("breachCount", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">
            {'Incidents (JSON — [{"date","summary"}])'}
          </label>
          <textarea rows={3} className={monoClass} value={form.incidents} onChange={(e) => update("incidents", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">
            {'Tests (JSON — [{"date","researcher","result"}])'}
          </label>
          <textarea rows={3} className={monoClass} value={form.tests} onChange={(e) => update("tests", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">
            {'Addendums (JSON — [{"author","content"}])'}
          </label>
          <textarea rows={3} className={monoClass} value={form.addendums} onChange={(e) => update("addendums", e.target.value)} />
        </div>

        <button
          onClick={save}
          disabled={saving || !form.number || !form.name}
          className="flex w-full items-center justify-center gap-2 rounded border border-redlake bg-redlake/20 py-3 font-mono text-sm uppercase tracking-wider text-white hover:bg-redlake/30 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        {mode === "edit" && scpId && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-400/40 py-3 font-mono text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer l&apos;objet
          </button>
        )}
      </div>
    </div>
  );
}
