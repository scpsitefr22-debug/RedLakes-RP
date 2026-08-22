"use client";

import { useEffect, useState } from "react";
import { Clock, Target } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type MissionStatus = "ASSIGNED" | "COMPLETED" | "FAILED" | "CANCELLED";

interface ApiMission {
  id: string;
  title: string;
  description: string;
  reward: string | null;
  status: MissionStatus;
  dueAt: string | null;
  assignedTeam: { id: string; name: string } | null;
}

const STATUS_LABELS: Record<MissionStatus, { label: string; color: string }> = {
  ASSIGNED: { label: "En cours", color: "text-yellow-400" },
  COMPLETED: { label: "Réussie", color: "text-green-400" },
  FAILED: { label: "Échouée", color: "text-redlake-glow" },
  CANCELLED: { label: "Annulée", color: "text-gray-500" },
};

export function MissionsApp() {
  const [missions, setMissions] = useState<ApiMission[] | null>(null);

  useEffect(() => {
    apiFetch<ApiMission[]>("/missions/me")
      .then(setMissions)
      .catch(() => setMissions([]));
  }, []);

  if (missions === null) return <p className="text-sm text-gray-500">Chargement…</p>;

  if (missions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-600">
        Aucune mission assignée pour le moment — à vous ou à votre équipe.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {missions.map((m) => {
        const status = STATUS_LABELS[m.status];
        return (
          <div key={m.id} className="rounded-lg border border-metal/40 bg-black/30 p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-redlake-glow" />
                <h3 className="font-bold text-white">{m.title}</h3>
              </div>
              <span className={cn("font-mono text-xs uppercase", status.color)}>
                {status.label}
              </span>
            </div>
            <DiscordMarkdown text={m.description} className="mb-3 text-sm text-gray-400" />
            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-gray-600">
              {m.assignedTeam && <Badge>Équipe {m.assignedTeam.name}</Badge>}
              {m.reward && <span>Récompense : {m.reward}</span>}
              {m.dueAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Échéance : {formatDate(m.dueAt)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
