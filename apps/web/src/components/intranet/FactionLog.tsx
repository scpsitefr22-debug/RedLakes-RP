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
    activeCharacter: { rpFirstName: string | null; rpLastName: string | null; grade: string } | null;
  };
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Non traité",
  REVIEWED: "Traité",
  ARCHIVED: "Archivé",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400 border-yellow-400/30",
  REVIEWED: "text-green-400 border-green-400/30",
  ARCHIVED: "text-gray-500 border-metal",
};

interface FactionLogProps {
  color: string;
  title?: string;
  icon?: typeof Users;
  onlyTypes?: string[];
  emptyText?: string;
  footerText?: string;
}

export function FactionLog({
  color,
  title = "Journal de faction",
  icon: Icon = Users,
  onlyTypes,
  emptyText = "Aucun rapport partagé par vos collègues pour le moment.",
  footerText = "Visible par les membres actuels de votre faction uniquement.",
}: FactionLogProps) {
  const [reports, setReports] = useState<FactionReport[] | null>(null);

  useEffect(() => {
    apiFetch<{ items: FactionReport[] }>("/reports/faction?limit=20")
      .then((res) => {
        const items = res.items ?? [];
        setReports(onlyTypes ? items.filter((r) => onlyTypes.includes(r.type)) : items);
      })
      .catch(() => setReports([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reports === null) return null;

  return (
    <section className="hologram-border rounded-lg p-6">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
        <Icon className="h-5 w-5" style={{ color }} />
        {title}
      </h3>
      {reports.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const rpName = r.user.activeCharacter
              ? [r.user.activeCharacter.rpFirstName, r.user.activeCharacter.rpLastName]
                  .filter(Boolean)
                  .join(" ")
              : "";
            const displayName = rpName || r.user.minecraftUsername || "Agent";
            return (
              <div key={r.id} className="border-l-2 pl-3" style={{ borderColor: `${color}66` }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-white">{r.subject}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase ${STATUS_COLORS[r.status] ?? "text-gray-500 border-metal"}`}
                    >
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                    <span className="font-mono text-[10px] text-gray-600">
                      {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-gray-400">{r.content}</p>
                <p className="mt-1 font-mono text-[10px] text-gray-600">
                  {displayName}
                  {r.user.activeCharacter?.grade ? ` — ${r.user.activeCharacter.grade}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-4 font-mono text-xs text-gray-600">{footerText}</p>
    </section>
  );
}
