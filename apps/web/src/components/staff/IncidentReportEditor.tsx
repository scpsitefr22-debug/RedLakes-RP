"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Save, ArrowLeft, Trash2, Plus, X } from "lucide-react";
import { DepartmentMultiSelect } from "@/components/staff/DepartmentMultiSelect";

const THREAT_CLASSES = ["Safe", "Euclid", "Keter", "Thaumiel", "Apollyon"] as const;
const STATUS_OPTIONS = ["INTACT", "INTACTS", "BLESSÉ", "BLESSÉ GRAVE", "ISOLÉ", "ISOLÉS", "DÉCÉDÉ", "DÉCÉDÉS"];

interface PersonnelRow {
  unite: string;
  grade: string;
  statut: string;
  obs: string;
}

interface EquipmentRow {
  designation: string;
  quantite: string;
  etat: string;
  cout: string;
}

export interface IncidentReportFormData {
  slug: string;
  reference: string;
  incidentAt: string;
  anomalyLabel: string;
  threatClass: string;
  factsTag: string;
  narrative: string;
  personnelRows: PersonnelRow[];
  equipmentRows: EquipmentRow[];
  authorLabel: string;
  authorRole: string;
  validatorLabel: string;
  validatorRole: string;
  restrictedDepartmentIds: string[];
  minClearanceLevel: string;
}

interface IncidentReportEditorProps {
  initial?: Partial<IncidentReportFormData>;
  reportId?: string;
  mode: "create" | "edit";
}

const emptyPersonnelRow = (): PersonnelRow => ({ unite: "", grade: "", statut: STATUS_OPTIONS[0], obs: "" });
const emptyEquipmentRow = (): EquipmentRow => ({ designation: "", quantite: "", etat: "", cout: "" });

function toDatetimeLocal(iso: string) {
  // "2026-09-01T03:15:00.000Z" -> "2026-09-01T03:15", format attendu par <input type="datetime-local">
  return iso ? iso.slice(0, 16) : "";
}

export function IncidentReportEditor({ initial, reportId, mode }: IncidentReportEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<IncidentReportFormData>({
    slug: initial?.slug ?? "",
    reference: initial?.reference ?? "",
    incidentAt: initial?.incidentAt ? toDatetimeLocal(initial.incidentAt) : "",
    anomalyLabel: initial?.anomalyLabel ?? "",
    threatClass: initial?.threatClass ?? "Euclid",
    factsTag: initial?.factsTag ?? "",
    narrative: initial?.narrative ?? "",
    personnelRows: initial?.personnelRows?.length ? initial.personnelRows : [emptyPersonnelRow(), emptyPersonnelRow()],
    equipmentRows: initial?.equipmentRows?.length ? initial.equipmentRows : [emptyEquipmentRow()],
    authorLabel: initial?.authorLabel ?? "",
    authorRole: initial?.authorRole ?? "",
    validatorLabel: initial?.validatorLabel ?? "",
    validatorRole: initial?.validatorRole ?? "",
    restrictedDepartmentIds: initial?.restrictedDepartmentIds ?? [],
    minClearanceLevel: initial?.minClearanceLevel ?? "3",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (key: keyof IncidentReportFormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "reference" && mode === "create") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setForm((f) => ({ ...f, slug }));
    }
  };

  const updatePersonnelRow = (i: number, key: keyof PersonnelRow, value: string) => {
    setForm((f) => ({
      ...f,
      personnelRows: f.personnelRows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)),
    }));
  };
  const updateEquipmentRow = (i: number, key: keyof EquipmentRow, value: string) => {
    setForm((f) => ({
      ...f,
      equipmentRows: f.equipmentRows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)),
    }));
  };

  const totalCost = form.equipmentRows.reduce((sum, r) => sum + (parseFloat(r.cout) || 0), 0);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        slug: form.slug,
        reference: form.reference,
        incidentAt: new Date(form.incidentAt).toISOString(),
        anomalyLabel: form.anomalyLabel,
        threatClass: form.threatClass,
        factsTag: form.factsTag || undefined,
        narrative: form.narrative,
        personnelRows: form.personnelRows.filter((r) => r.unite || r.grade || r.obs),
        equipmentRows: form.equipmentRows
          .filter((r) => r.designation || r.etat)
          .map((r) => ({ ...r, cout: parseFloat(r.cout) || 0 })),
        totalCost,
        authorLabel: form.authorLabel,
        authorRole: form.authorRole || undefined,
        validatorLabel: form.validatorLabel || undefined,
        validatorRole: form.validatorRole || undefined,
        restrictedDepartmentIds: form.restrictedDepartmentIds,
        minClearanceLevel: parseInt(form.minClearanceLevel, 10) || 1,
      };

      if (mode === "create") {
        await apiFetch("/incident-reports", { method: "POST", body: JSON.stringify(payload) });
        router.push("/staff/rapports-incidents");
      } else if (reportId) {
        const { slug: _slug, ...updatePayload } = payload;
        await apiFetch(`/incident-reports/${reportId}`, {
          method: "PATCH",
          body: JSON.stringify(updatePayload),
        });
        router.push("/staff/rapports-incidents");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!reportId || !confirm(`Supprimer définitivement le rapport "${form.reference}" ?`)) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/incident-reports/${reportId}`, { method: "DELETE" });
      router.push("/staff/rapports-incidents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded border border-metal bg-black px-4 py-2 text-white outline-none focus:border-redlake";
  const cellClass =
    "w-full rounded border border-metal/60 bg-black px-2 py-1.5 text-sm text-white outline-none focus:border-redlake";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/staff/rapports-incidents"
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux rapports d&apos;incident
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-white">
        {mode === "create" ? "Nouveau rapport d'incident" : `Modifier — ${form.reference}`}
      </h1>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Référence incident</label>
            <input
              className={inputClass}
              value={form.reference}
              onChange={(e) => update("reference", e.target.value)}
              placeholder="#INC-2026-0901-B"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">
              Slug (URL — {mode === "edit" ? "non modifiable" : "généré depuis la référence"})
            </label>
            <input
              className={inputClass}
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              disabled={mode === "edit"}
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Date &amp; heure de l&apos;incident</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.incidentAt}
              onChange={(e) => update("incidentAt", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Anomalie &amp; lieu</label>
            <input
              className={inputClass}
              value={form.anomalyLabel}
              onChange={(e) => update("anomalyLabel", e.target.value)}
              placeholder="SCP-106 (Confinement)"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Classe de menace</label>
            <select className={inputClass} value={form.threatClass} onChange={(e) => update("threatClass", e.target.value)}>
              {THREAT_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Étiquette des faits</label>
            <input
              className={inputClass}
              value={form.factsTag}
              onChange={(e) => update("factsTag", e.target.value)}
              placeholder="RUPTURE DE CONFINEMENT"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Description détaillée des faits</label>
          <textarea
            rows={6}
            className={inputClass}
            value={form.narrative}
            onChange={(e) => update("narrative", e.target.value)}
            placeholder="Déroulé chronologique de l'incident..."
          />
        </div>

        {/* Personnel impacté */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="font-mono text-xs text-gray-500">Bilan du personnel impacté</label>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, personnelRows: [...f.personnelRows, emptyPersonnelRow()] }))}
              className="flex items-center gap-1 rounded border border-metal px-2 py-1 font-mono text-[11px] text-gray-400 hover:border-redlake hover:text-white"
            >
              <Plus className="h-3 w-3" /> Ligne
            </button>
          </div>
          <div className="space-y-2">
            {form.personnelRows.map((row, i) => (
              <div key={i} className="grid grid-cols-1 gap-1.5 rounded border border-metal/40 p-2 sm:grid-cols-[1fr_1fr_1fr_1.5fr_auto]">
                <input className={cellClass} placeholder="Équipe/unité" value={row.unite} onChange={(e) => updatePersonnelRow(i, "unite", e.target.value)} />
                <input className={cellClass} placeholder="Personnel & grade" value={row.grade} onChange={(e) => updatePersonnelRow(i, "grade", e.target.value)} />
                <select className={cellClass} value={row.statut} onChange={(e) => updatePersonnelRow(i, "statut", e.target.value)}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input className={cellClass} placeholder="Observations" value={row.obs} onChange={(e) => updatePersonnelRow(i, "obs", e.target.value)} />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, personnelRows: f.personnelRows.filter((_, idx) => idx !== i) }))}
                  className="flex items-center justify-center rounded border border-metal/60 text-gray-500 hover:border-red-400/60 hover:text-red-400"
                  title="Supprimer la ligne"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Équipements */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="font-mono text-xs text-gray-500">Bilan logistique, munitions &amp; récupération</label>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, equipmentRows: [...f.equipmentRows, emptyEquipmentRow()] }))}
              className="flex items-center gap-1 rounded border border-metal px-2 py-1 font-mono text-[11px] text-gray-400 hover:border-redlake hover:text-white"
            >
              <Plus className="h-3 w-3" /> Ligne
            </button>
          </div>
          <div className="space-y-2">
            {form.equipmentRows.map((row, i) => (
              <div key={i} className="grid grid-cols-1 gap-1.5 rounded border border-metal/40 p-2 sm:grid-cols-[1.5fr_1fr_1.5fr_0.8fr_auto]">
                <input className={cellClass} placeholder="Désignation" value={row.designation} onChange={(e) => updateEquipmentRow(i, "designation", e.target.value)} />
                <input className={cellClass} placeholder="Quantité" value={row.quantite} onChange={(e) => updateEquipmentRow(i, "quantite", e.target.value)} />
                <input className={cellClass} placeholder="État / bilan" value={row.etat} onChange={(e) => updateEquipmentRow(i, "etat", e.target.value)} />
                <input className={cellClass} placeholder="Coût $" inputMode="decimal" value={row.cout} onChange={(e) => updateEquipmentRow(i, "cout", e.target.value)} />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, equipmentRows: f.equipmentRows.filter((_, idx) => idx !== i) }))}
                  className="flex items-center justify-center rounded border border-metal/60 text-gray-500 hover:border-red-400/60 hover:text-red-400"
                  title="Supprimer la ligne"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-right font-mono text-sm text-redlake-glow">
            Perte financière totale : {totalCost.toLocaleString("fr-FR")} $
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Rédacteur (nom)</label>
            <input className={inputClass} value={form.authorLabel} onChange={(e) => update("authorLabel", e.target.value)} placeholder="Chef d'Équipe Élite" />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Rédacteur (fonction)</label>
            <input className={inputClass} value={form.authorRole} onChange={(e) => update("authorRole", e.target.value)} placeholder="Commandant de la Team Élite 01" />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Validation officielle (nom)</label>
            <input className={inputClass} value={form.validatorLabel} onChange={(e) => update("validatorLabel", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Validation officielle (fonction)</label>
            <input className={inputClass} value={form.validatorRole} onChange={(e) => update("validatorRole", e.target.value)} placeholder="Responsable de la Sécurité du Site" />
          </div>
        </div>

        <DepartmentMultiSelect
          value={form.restrictedDepartmentIds}
          onChange={(ids) => setForm((f) => ({ ...f, restrictedDepartmentIds: ids }))}
        />
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">
            Habilitation minimale requise (en plus du département)
          </label>
          <select
            className={inputClass}
            value={form.minClearanceLevel}
            onChange={(e) => update("minClearanceLevel", e.target.value)}
          >
            <option value="1">Niveau 1 — aucune exigence</option>
            <option value="2">Niveau 2</option>
            <option value="3">Niveau 3</option>
            <option value="4">Niveau 4</option>
            <option value="5">Niveau 5 — Conseil Oméga uniquement</option>
          </select>
        </div>

        <button
          onClick={save}
          disabled={saving || !form.reference || !form.narrative || !form.authorLabel || !form.incidentAt}
          className="flex w-full items-center justify-center gap-2 rounded border border-redlake bg-redlake/20 py-3 font-mono text-sm uppercase tracking-wider text-white hover:bg-redlake/30 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        {mode === "edit" && reportId && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-400/40 py-3 font-mono text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer le rapport
          </button>
        )}
        {form.slug && (
          <Link
            href={`/rapports-incidents/${form.slug}`}
            className="block text-center font-mono text-xs text-gray-500 hover:text-redlake-glow"
          >
            Prévisualiser sur le site →
          </Link>
        )}
      </div>
    </div>
  );
}
