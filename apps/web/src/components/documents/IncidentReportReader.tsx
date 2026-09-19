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
}

const THREAT_COLORS: Record<string, string> = {
  Safe: "#16a34a",
  Euclid: "#ea580c",
  Keter: "#dc2626",
  Thaumiel: "#7c3aed",
  Apollyon: "#7f1d1d",
};

const STATUS_COLORS: Record<string, string> = {
  "DÉCÉDÉ": "text-red-400", "DÉCÉDÉS": "text-red-400",
  "BLESSÉ": "text-orange-400", "BLESSÉ GRAVE": "text-orange-400",
  "INTACT": "text-green-400", "INTACTS": "text-green-400",
  "ISOLÉ": "text-blue-400", "ISOLÉS": "text-blue-400",
};

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

  const accent = THREAT_COLORS[report.threatClass] ?? THREAT_COLORS.Euclid;

  return (
    <>
      <Link
        href="/rapports-incidents"
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Rapports d&apos;incident
      </Link>

      <div className="overflow-hidden rounded-lg border border-metal/40">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6" style={{ background: "#0a1120", borderLeft: `6px solid ${accent}` }}>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
              Fondation SCP — Rapport d&apos;incident officiel
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Rapport d&apos;Incident de Sécurité</h1>
          </div>
          <div className="rounded px-4 py-2 text-right" style={{ background: accent }}>
            <p className="font-bold text-white">{report.threatClass}</p>
            {report.minClearanceLevel > 1 && (
              <p className="font-mono text-[10px] uppercase text-white/80">Niveau {report.minClearanceLevel}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-metal/30 border-b border-metal/30 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {[
            ["Référence incident", report.reference],
            ["Date & heure", new Date(report.incidentAt).toLocaleString("fr-FR")],
            ["Anomalie & lieu", report.anomalyLabel],
            ["Classe menace", report.threatClass],
          ].map(([label, value]) => (
            <div key={label} className="p-4" style={{ borderLeft: `3px solid ${accent}` }}>
              <p className="font-mono text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
              <p className="mt-1 font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
            <AlertTriangle className="h-4 w-4" style={{ color: accent }} />
            Description détaillée des faits
            {report.factsTag && (
              <span className="rounded-full px-2 py-0.5 font-mono text-[10px] text-white" style={{ background: accent }}>
                {report.factsTag}
              </span>
            )}
          </h2>
          <p className="whitespace-pre-wrap text-gray-300">{report.narrative}</p>
        </div>

        {report.personnelRows.length > 0 && (
          <div className="border-t border-metal/30 p-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Bilan du personnel impacté</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-metal/40 text-gray-500">
                    <th className="py-2 pr-3 font-mono text-[10px] uppercase">Équipe / unité</th>
                    <th className="py-2 pr-3 font-mono text-[10px] uppercase">Personnel &amp; grade</th>
                    <th className="py-2 pr-3 font-mono text-[10px] uppercase">Statut</th>
                    <th className="py-2 font-mono text-[10px] uppercase">Observations</th>
                  </tr>
                </thead>
                <tbody>
                  {report.personnelRows.map((row, i) => (
                    <tr key={i} className="border-b border-metal/20">
                      <td className="py-2 pr-3 text-gray-300">{row.unite}</td>
                      <td className="py-2 pr-3 text-gray-300">{row.grade}</td>
                      <td className={`py-2 pr-3 font-bold ${STATUS_COLORS[row.statut] ?? "text-gray-300"}`}>{row.statut}</td>
                      <td className="py-2 text-gray-400">{row.obs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {report.equipmentRows.length > 0 && (
          <div className="border-t border-metal/30 p-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
              Bilan logistique, munitions &amp; récupération
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-metal/40 text-gray-500">
                    <th className="py-2 pr-3 font-mono text-[10px] uppercase">Désignation</th>
                    <th className="py-2 pr-3 font-mono text-[10px] uppercase">Quantité</th>
                    <th className="py-2 pr-3 font-mono text-[10px] uppercase">État / bilan</th>
                    <th className="py-2 text-right font-mono text-[10px] uppercase">Coût</th>
                  </tr>
                </thead>
                <tbody>
                  {report.equipmentRows.map((row, i) => (
                    <tr key={i} className="border-b border-metal/20">
                      <td className="py-2 pr-3 text-gray-300">{row.designation}</td>
                      <td className="py-2 pr-3 text-gray-400">{row.quantite}</td>
                      <td className="py-2 pr-3 text-gray-400">{row.etat}</td>
                      <td className="py-2 text-right font-mono text-gray-300">{row.cout.toLocaleString("fr-FR")} $</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between rounded p-3" style={{ background: `${accent}1a`, borderLeft: `4px solid ${accent}` }}>
              <span className="text-sm font-bold text-white">Perte financière totale du site</span>
              <span className="font-mono text-lg font-bold" style={{ color: accent }}>
                {report.totalCost.toLocaleString("fr-FR")} $
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 border-t border-metal/30 p-6 sm:grid-cols-2">
          <div className="rounded border border-metal/40 bg-black/30 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-gray-500">Rédacteur</p>
            <p className="font-bold text-white">{report.authorLabel}</p>
            {report.authorRole && <p className="text-xs text-gray-500">{report.authorRole}</p>}
          </div>
          <div className="rounded border border-metal/40 bg-black/30 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-gray-500">Validation officielle de sécurité</p>
            <p className="font-bold text-white">{report.validatorLabel || "—"}</p>
            {report.validatorRole && <p className="text-xs text-gray-500">{report.validatorRole}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
