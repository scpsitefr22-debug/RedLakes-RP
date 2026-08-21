"use client";

import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: string | null;
  status: "ASSIGNED" | "COMPLETED" | "FAILED" | "CANCELLED";
  dueAt: string | null;
  assignedTeam: { id: string; name: string } | null;
}

const STATUS_LABELS: Record<Mission["status"], string> = {
  ASSIGNED: "En cours",
  COMPLETED: "Terminée",
  FAILED: "Échouée",
  CANCELLED: "Annulée",
};

const STATUS_COLORS: Record<Mission["status"], string> = {
  ASSIGNED: "text-yellow-400 border-yellow-400/30",
  COMPLETED: "text-green-400 border-green-400/30",
  FAILED: "text-red-400 border-red-400/30",
  CANCELLED: "text-gray-500 border-metal",
};

export function MissionsWidget() {
  const [missions, setMissions] = useState<Mission[] | null>(null);

  useEffect(() => {
    apiFetch<Mission[]>("/missions/me")
      .then(setMissions)
      .catch(() => setMissions([]));
  }, []);

  if (missions === null || missions.length === 0) return null;

  return (
    <section className="mb-8 panel-flat rounded-lg p-6">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
        <Target className="h-5 w-5 text-redlake-glow" />
        Missions
      </h3>
      <div className="space-y-3">
        {missions.map((m) => (
          <div key={m.id} className="rounded border border-metal/40 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-bold text-white">{m.title}</p>
              <span
                className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase ${STATUS_COLORS[m.status]}`}
              >
                {STATUS_LABELS[m.status]}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">{m.description}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-gray-600">
              {m.assignedTeam && <span>Équipe : {m.assignedTeam.name}</span>}
              {m.reward && <span>Récompense : {m.reward}</span>}
              {m.dueAt && (
                <span>Échéance : {new Date(m.dueAt).toLocaleDateString("fr-FR")}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
