"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Plus, AlertTriangle } from "lucide-react";

interface StaffIncidentReport {
  id: string;
  slug: string;
  reference: string;
  anomalyLabel: string;
  threatClass: string;
  incidentAt: string;
  author: { minecraftUsername: string } | null;
}

const THREAT_COLORS: Record<string, string> = {
  Safe: "text-green-400",
  Euclid: "text-yellow-400",
  Keter: "text-red-400",
  Thaumiel: "text-purple-400",
  Apollyon: "text-orange-400",
};

export default function StaffIncidentReportsPage() {
  const [reports, setReports] = useState<StaffIncidentReport[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<StaffIncidentReport[]>("/incident-reports/cms")
      .then(setReports)
      .catch(() => setError("Impossible de charger les rapports — API indisponible."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            GESTION DES RAPPORTS D&apos;INCIDENT — SÉCURITÉ
          </p>
          <h1 className="text-4xl font-bold text-white">Rapports d&apos;incident</h1>
          <p className="mt-4 text-gray-500">
            Journal officiel des incidents de sécurité du site, par le Directeur de la Sécurité et son équipe.
          </p>
        </div>
        <Link
          href="/staff/rapports-incidents/nouveau"
          className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30"
        >
          <Plus className="h-4 w-4" /> Nouveau rapport
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && !error && reports.length === 0 && (
        <p className="text-gray-500">Aucun rapport d&apos;incident enregistré.</p>
      )}

      <div className="space-y-3">
        {reports.map((r) => (
          <Link
            key={r.id}
            href={`/staff/rapports-incidents/${r.id}`}
            className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-redlake-glow" />
              <div>
                <h3 className="font-bold text-white">
                  {r.reference} — {r.anomalyLabel}
                </h3>
                <p className="font-mono text-xs text-gray-600">
                  {new Date(r.incidentAt).toLocaleString("fr-FR")}
                  {r.author ? ` — ${r.author.minecraftUsername}` : ""}
                </p>
              </div>
            </div>
            <span className={`font-mono text-xs uppercase ${THREAT_COLORS[r.threatClass] ?? "text-gray-500"}`}>
              {r.threatClass}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
