"use client";

import { useEffect, useState } from "react";
import { Scale, Users, CheckCircle2, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { MetricCard } from "@/components/ui/MetricCard";

interface PermissionRow {
  label: string;
  gradeName: string | null;
  clearanceLevel: number;
  departmentName: string | null;
  factionName: string | null;
  isDepartmentChief: boolean;
  isFactionChief: boolean;
  isTeamChief: boolean;
  currentRole: string;
  currentStaffRank: string | null;
  derivedLead: boolean;
  currentlyStaff: boolean;
  matches: boolean;
}

interface PermissionsReport {
  generatedAt: string;
  total: number;
  agreementCount: number;
  rows: PermissionRow[];
}

function chiefLabel(row: PermissionRow): string {
  const roles: string[] = [];
  if (row.isFactionChief) roles.push("Faction");
  if (row.isDepartmentChief) roles.push("Département");
  if (row.isTeamChief) roles.push("Équipe");
  return roles.length ? roles.join(", ") : "—";
}

export default function StaffPermissionsPage() {
  const [report, setReport] = useState<PermissionsReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<PermissionsReport>("/players/permissions-report")
      .then(setReport)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Chargement impossible — accès staff requis."),
      );
  }, []);

  const disagreements = report?.rows.filter((r) => !r.matches) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          ADMINISTRATION SITE-12 — OUTIL DE PREUVE
        </p>
        <h1 className="text-4xl font-bold text-white">Permissions dérivées du Grade</h1>
        <p className="mt-4 max-w-3xl text-gray-500">
          Compare, pour chaque compte avec un personnage actif, ce que son Grade RP impliquerait
          (chef de faction/département/équipe → « devrait être staff ») avec son rôle réel
          (PLAYER/STAFF/ADMIN). Purement informatif : rien ici ne modifie un accès. Le système de
          rôles actuel reste la seule source de vérité tant que ce rapport n&apos;aura pas prouvé,
          sur la durée, que les deux coïncident.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {!report && !error && (
        <div className="flex min-h-[30vh] items-center justify-center font-mono text-gray-500">
          Chargement du rapport…
        </div>
      )}

      {report && (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            <MetricCard icon={Users} value={report.total} label="Comptes analysés" />
            <MetricCard icon={CheckCircle2} value={report.agreementCount} label="En accord" />
            <MetricCard
              icon={AlertTriangle}
              value={disagreements.length}
              label="Écarts à examiner"
              className={disagreements.length > 0 ? "border-yellow-500/40" : undefined}
            />
          </div>

          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
              <Scale className="h-5 w-5 text-redlake-glow" />
              Détail par compte
            </h2>
            {report.rows.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun compte avec personnage actif pour le moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] font-mono text-sm">
                  <thead>
                    <tr className="border-b border-metal text-left text-gray-600">
                      <th className="pb-3 pr-4">Agent</th>
                      <th className="pb-3 pr-4">Grade</th>
                      <th className="pb-3 pr-4">Habilitation</th>
                      <th className="pb-3 pr-4">Faction / Département</th>
                      <th className="pb-3 pr-4">Chef de</th>
                      <th className="pb-3 pr-4">Rôle réel</th>
                      <th className="pb-3">Accord</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-b border-metal/30 text-gray-400 ${!row.matches ? "bg-yellow-500/5" : ""}`}
                      >
                        <td className="py-3 pr-4 text-white">{row.label}</td>
                        <td className="py-3 pr-4">{row.gradeName ?? "—"}</td>
                        <td className="py-3 pr-4">Niveau {row.clearanceLevel}</td>
                        <td className="py-3 pr-4">
                          {[row.factionName, row.departmentName].filter(Boolean).join(" / ") || "—"}
                        </td>
                        <td className="py-3 pr-4">{chiefLabel(row)}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`rounded border px-2 py-0.5 text-[10px] uppercase ${
                              row.currentlyStaff
                                ? "border-redlake/40 text-redlake-glow"
                                : "border-metal text-gray-500"
                            }`}
                          >
                            {row.currentStaffRank ?? row.currentRole}
                          </span>
                        </td>
                        <td className="py-3">
                          {row.matches ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="mt-4 font-mono text-[10px] text-gray-600">
            Généré le {new Date(report.generatedAt).toLocaleString("fr-FR")}.
          </p>
        </>
      )}
    </div>
  );
}
