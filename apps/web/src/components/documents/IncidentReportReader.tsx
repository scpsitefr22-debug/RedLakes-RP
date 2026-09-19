"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock, ArrowLeft, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api";

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
  cout: number;
}

interface IncidentReportFull {
  reference: string;
  incidentAt: string;
  anomalyLabel: string;
  threatClass: string;
  factsTag: string | null;
  narrative: string;
  personnelRows: PersonnelRow[];
  equipmentRows: EquipmentRow[];
  totalCost: number;
  authorLabel: string;
  authorRole: string | null;
  validatorLabel: string | null;
  validatorRole: string | null;
  minClearanceLevel: number;
  departmentRef: { name: string; slug: string } | null;
}

/** Couleur d'accent par classe de menace — même logique que sur les rapports papier d'origine. */
const THREAT_ACCENT: Record<string, string> = {
  Safe: "#16a34a",
  Euclid: "#ea580c",
  Keter: "#dc2626",
  Thaumiel: "#7c3aed",
  Apollyon: "#7f1d1d",
};

/** Mots-clés statut, teintes foncées pour rester lisibles sur fond clair (le document reste clair, contrairement au reste du site). */
const STATUS_COLORS: Record<string, string> = {
  "DÉCÉDÉ": "text-red-600", "DÉCÉDÉS": "text-red-600",
  "BLESSÉ": "text-orange-600", "BLESSÉ GRAVE": "text-orange-600",
  "INTACT": "text-green-600", "INTACTS": "text-green-600",
  "ISOLÉ": "text-blue-600", "ISOLÉS": "text-blue-600",
};

const CLEARANCE_WORDS: Record<number, string> = {
  1: "PUBLIC",
  2: "ARCHIVE",
  3: "CONFIDENTIEL",
  4: "RESTREINT",
  5: "CONSEIL OMÉGA",
};

const URGENT_CLASSES = new Set(["Keter", "Thaumiel", "Apollyon"]);

async function getIncidentReport(slug: string): Promise<IncidentReportFull | null> {
  try {
    return await apiFetch<IncidentReportFull>(`/incident-reports/${slug}`);
  } catch {
    return null;
  }
}

export function IncidentReportReader({ slug }: { slug: string }) {
  const [report, setReport] = useState<IncidentReportFull | null | undefined>(undefined);

  useEffect(() => {
    (async () => setReport(await getIncidentReport(slug)))();
  }, [slug]);

  if (report === undefined) {
    return <p className="text-gray-500">Chargement du rapport…</p>;
  }

  if (!report) {
    return (
      <div className="hologram-border rounded-lg p-8 text-center">
        <Lock className="mx-auto mb-4 h-8 w-8 text-red-400" />
        <h2 className="text-xl font-bold text-white">Accès refusé ou rapport introuvable</h2>
        <p className="mt-2 text-gray-500">
          Ce rapport est réservé à un autre département ou à une habilitation supérieure, ou n&apos;existe pas.{" "}
          <Link href="/connexion" className="text-redlake-glow hover:underline">
            Connectez-vous
          </Link>{" "}
          si vous pensez y avoir accès.
        </p>
        <Link
          href="/rapports-incidents"
          className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" /> Retour aux rapports
        </Link>
      </div>
    );
  }

  const accent = THREAT_ACCENT[report.threatClass] ?? THREAT_ACCENT.Euclid;
  const severityWord = URGENT_CLASSES.has(report.threatClass) ? "URGENCE" : "CLASSE";
  const clearanceWord = CLEARANCE_WORDS[report.minClearanceLevel] ?? "CONFIDENTIEL";
  const departmentName = report.departmentRef?.name.toUpperCase() ?? "DÉPARTEMENT SÉCURITÉ";

  return (
    <>
      <Link
        href="/rapports-incidents"
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Rapports d&apos;incident
      </Link>

      {/* Reproduction fidèle du gabarit PDF officiel — volontairement en dehors du thème sombre du site : c'est un document, pas une page du site. */}
      <div className="overflow-hidden rounded-lg border border-black/10 bg-white text-slate-900 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6" style={{ background: "#0a1120" }}>
          <div className="flex items-center gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2"
              style={{ borderColor: accent, background: "#0f1729" }}
            >
              <AlertTriangle className="h-5 w-5" style={{ color: accent }} />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Fondation SCP — {departmentName}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Rapport d&apos;Incident</h1>
            </div>
          </div>
          <div className="rounded px-4 py-2 text-right" style={{ background: accent }}>
            <p className="text-sm font-bold uppercase text-white">{severityWord} {report.threatClass}</p>
            <p className="font-mono text-[10px] uppercase text-white/80">
              Niveau {report.minClearanceLevel} / {clearanceWord}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-200 border-b border-slate-200 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {[
            ["Référence incident", report.reference],
            ["Date & heure", new Date(report.incidentAt).toLocaleString("fr-FR")],
            ["Anomalie & lieu", report.anomalyLabel],
            ["Classe menace", report.threatClass],
          ].map(([label, value]) => (
            <div key={label} className="bg-slate-50 p-4" style={{ borderLeft: `3px solid ${accent}` }}>
              <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="p-6">
          <div className="mb-3 flex items-center justify-between gap-2 rounded px-3 py-2" style={{ background: "#0a1120" }}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-white">1. Description détaillée des faits</h2>
            {report.factsTag && (
              <span className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] text-white" style={{ background: accent }}>
                {report.factsTag}
              </span>
            )}
          </div>
          <p className="whitespace-pre-wrap text-slate-700">{report.narrative}</p>
        </div>

        {report.personnelRows.length > 0 && (
          <div className="border-t border-slate-200 p-6">
            <div className="mb-3 flex items-center justify-between gap-2 rounded px-3 py-2" style={{ background: "#0a1120" }}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-white">2. Bilan du personnel impacté</h2>
              <span className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] text-white" style={{ background: accent }}>
                IMPACT PHYSIQUE &amp; SÉCURITÉ
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ background: "#0a1120" }}>
                    <th className="py-2 px-3 font-mono text-[10px] uppercase text-white">Équipe / unité</th>
                    <th className="py-2 px-3 font-mono text-[10px] uppercase text-white">Personnel &amp; grade</th>
                    <th className="py-2 px-3 font-mono text-[10px] uppercase text-white">Statut</th>
                    <th className="py-2 px-3 font-mono text-[10px] uppercase text-white">Observations</th>
                  </tr>
                </thead>
                <tbody>
                  {report.personnelRows.map((row, i) => (
                    <tr key={i} className={`border-b border-slate-200 ${i % 2 === 1 ? "bg-slate-50" : "bg-white"}`}>
                      <td className="py-2 px-3 text-slate-700">{row.unite}</td>
                      <td className="py-2 px-3 text-slate-700">{row.grade}</td>
                      <td className={`py-2 px-3 font-bold ${STATUS_COLORS[row.statut] ?? "text-slate-700"}`}>{row.statut}</td>
                      <td className="py-2 px-3 text-slate-600">{row.obs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {report.equipmentRows.length > 0 && (
          <div className="border-t border-slate-200 p-6">
            <div className="mb-3 flex items-center justify-between gap-2 rounded px-3 py-2" style={{ background: "#0a1120" }}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-white">
                3. Bilan logistique, munitions &amp; récupération
              </h2>
              <span className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] text-white" style={{ background: accent }}>
                ÉQUIPEMENTS &amp; COÛTS
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ background: "#0a1120" }}>
                    <th className="py-2 px-3 font-mono text-[10px] uppercase text-white">Désignation</th>
                    <th className="py-2 px-3 font-mono text-[10px] uppercase text-white">Quantité</th>
                    <th className="py-2 px-3 font-mono text-[10px] uppercase text-white">État / bilan</th>
                    <th className="py-2 px-3 text-right font-mono text-[10px] uppercase text-white">Coût</th>
                  </tr>
                </thead>
                <tbody>
                  {report.equipmentRows.map((row, i) => (
                    <tr key={i} className={`border-b border-slate-200 ${i % 2 === 1 ? "bg-slate-50" : "bg-white"}`}>
                      <td className="py-2 px-3 text-slate-700">{row.designation}</td>
                      <td className="py-2 px-3 text-slate-600">{row.quantite}</td>
                      <td className="py-2 px-3 text-slate-600">{row.etat}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">{row.cout.toLocaleString("fr-FR")} $</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              className="mt-3 flex items-center justify-between rounded p-3"
              style={{ background: `${accent}14`, borderLeft: `4px solid ${accent}` }}
            >
              <span className="text-sm font-bold text-slate-900">Perte financière totale du site</span>
              <span className="font-mono text-lg font-bold" style={{ color: accent }}>
                {report.totalCost.toLocaleString("fr-FR")} $
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 border-t border-slate-200 p-6 sm:grid-cols-2">
          <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">Rédacteur</p>
            <p className="font-bold text-slate-900">{report.authorLabel}</p>
            {report.authorRole && <p className="text-xs text-slate-500">{report.authorRole}</p>}
            <p className="mt-2 rounded border border-dashed border-slate-300 px-2 py-1 text-center font-mono text-[10px] text-slate-500">
              [ SIGNÉ ÉLECTRONIQUEMENT ]
            </p>
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">Validation officielle</p>
            <p className="font-bold text-slate-900">{report.validatorLabel || "—"}</p>
            {report.validatorRole && <p className="text-xs text-slate-500">{report.validatorRole}</p>}
            {report.validatorLabel && (
              <p className="mt-2 rounded border border-dashed border-slate-300 px-2 py-1 text-center font-mono text-[10px] text-slate-500">
                [ APPROUVÉ ]
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
            Fondation SCP — Rapport d&apos;incident officiel
          </p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Accès {clearanceWord.toLowerCase()}</p>
        </div>
      </div>
    </>
  );
}
