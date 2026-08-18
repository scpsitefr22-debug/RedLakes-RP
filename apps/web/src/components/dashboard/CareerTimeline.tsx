"use client";

import { useEffect, useState } from "react";
import { Milestone } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface CareerEntry {
  id: string;
  entityType: "FACTION" | "DEPARTMENT" | "TEAM";
  label: string;
  startedAt: string;
  endedAt: string | null;
}

const TYPE_LABELS: Record<CareerEntry["entityType"], string> = {
  FACTION: "Faction",
  DEPARTMENT: "Département",
  TEAM: "Équipe",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function CareerTimeline() {
  const [entries, setEntries] = useState<CareerEntry[] | null>(null);

  useEffect(() => {
    apiFetch<CareerEntry[]>("/players/me/career")
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  if (entries === null) return null;

  return (
    <section className="mb-8 panel-flat rounded-lg p-6">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
        <Milestone className="h-5 w-5 text-redlake-glow" />
        Carrière
      </h3>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-600">
          Aucun changement de faction ou de département enregistré pour le moment.
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="flex items-start gap-3 border-l-2 border-redlake/30 pl-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white">
                  {e.label}{" "}
                  <span className="font-mono text-[10px] text-gray-600">
                    ({TYPE_LABELS[e.entityType]})
                  </span>
                </p>
                <p className="font-mono text-[10px] text-gray-600">
                  {formatDate(e.startedAt)} — {e.endedAt ? formatDate(e.endedAt) : "en cours"}
                </p>
              </div>
              {!e.endedAt && (
                <span className="shrink-0 rounded border border-green-400/30 px-1.5 py-0.5 font-mono text-[9px] uppercase text-green-400">
                  Actuel
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
