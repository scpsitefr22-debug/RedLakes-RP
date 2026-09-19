"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface ApiIncidentReport {
  slug: string;
  reference: string;
  anomalyLabel: string;
  threatClass: string;
  incidentAt: string;
  factsTag: string | null;
}

const THREAT_COLORS: Record<string, string> = {
  Safe: "text-green-400 border-green-400/30",
  Euclid: "text-yellow-400 border-yellow-400/30",
  Keter: "text-red-400 border-red-400/30",
  Thaumiel: "text-purple-400 border-purple-400/30",
  Apollyon: "text-orange-400 border-orange-400/30",
};

export default function RapportsIncidentsPage() {
  const [reports, setReports] = useState<ApiIncidentReport[] | null>(null);

  useEffect(() => {
    apiFetch<ApiIncidentReport[]>("/incident-reports")
      .then(setReports)
      .catch(() => setReports([]));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          DÉPARTEMENT DE LA SÉCURITÉ DU SITE
        </p>
        <h1 className="text-4xl font-bold text-white">Rapports d&apos;incident</h1>
        <p className="mt-4 max-w-2xl text-gray-500">
          Journal officiel des incidents de sécurité — accès filtré selon votre département et votre habilitation.
        </p>
      </div>

      {reports === null ? (
        <p className="text-gray-500">Chargement…</p>
      ) : reports.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          Aucun rapport accessible pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Link
              key={r.slug}
              href={`/rapports-incidents/${r.slug}`}
              className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-redlake-glow" />
                <div>
                  <h3 className="font-bold text-white">
                    {r.reference} — {r.anomalyLabel}
                  </h3>
                  <p className="font-mono text-xs text-gray-600">
                    {new Date(r.incidentAt).toLocaleDateString("fr-FR")}
                    {r.factsTag ? ` — ${r.factsTag}` : ""}
                  </p>
                </div>
              </div>
              <span className={`rounded border px-2 py-1 font-mono text-xs uppercase ${THREAT_COLORS[r.threatClass] ?? "text-gray-500 border-metal"}`}>
                {r.threatClass}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
