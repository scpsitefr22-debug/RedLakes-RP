"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface FactionReport {
  id: string;
  type: string;
  subject: string;
  content: string;
  status: string;
  createdAt: string;
  user: {
    minecraftUsername: string | null;
    player: { rpFirstName: string | null; rpLastName: string | null; grade: string } | null;
  };
}

export function FactionLog({ color }: { color: string }) {
  const [reports, setReports] = useState<FactionReport[] | null>(null);

  useEffect(() => {
    apiFetch<{ items: FactionReport[] }>("/reports/faction?limit=10")
      .then((res) => setReports(res.items ?? []))
      .catch(() => setReports([]));
  }, []);

  if (reports === null) return null;

  return (
    <section className="hologram-border rounded-lg p-6">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
        <Users className="h-5 w-5" style={{ color }} />
        Journal de faction
      </h3>
      {reports.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aucun rapport partagé par vos collègues pour le moment.
        </p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const rpName = r.user.player
              ? [r.user.player.rpFirstName, r.user.player.rpLastName]
                  .filter(Boolean)
                  .join(" ")
              : "";
            const displayName = rpName || r.user.minecraftUsername || "Agent";
            return (
              <div key={r.id} className="border-l-2 pl-3" style={{ borderColor: `${color}66` }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-white">{r.subject}</p>
                  <span className="shrink-0 font-mono text-[10px] text-gray-600">
                    {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-gray-400">{r.content}</p>
                <p className="mt-1 font-mono text-[10px] text-gray-600">
                  {displayName}
                  {r.user.player?.grade ? ` — ${r.user.player.grade}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-4 font-mono text-xs text-gray-600">
        Visible par les membres actuels de votre faction uniquement.
      </p>
    </section>
  );
}
