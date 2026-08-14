"use client";

import { useMemo, useState } from "react";
import { rpGrades, type RpBranch, type RpGradeMeta } from "@/data/rp-grades";
import { Badge } from "@/components/ui/Badge";
import { CLEARANCE_LABELS } from "@/lib/clearance";
import { Lock, Shield, Target, Users } from "lucide-react";

const BRANCH_LABELS: Record<RpBranch, string> = {
  omega: "Conseil Oméga",
  direction: "Direction",
  securite: "Sécurité",
  scientifique: "Scientifique",
  maintenance: "Maintenance",
  general: "Général",
  classes: "Personnel détenu",
};

const BRANCH_COLORS: Record<RpBranch, string> = {
  omega: "#8b0a0a",
  direction: "#991b1b",
  securite: "#1e40af",
  scientifique: "#15803d",
  maintenance: "#c2410c",
  general: "#6b7280",
  classes: "#374151",
};

interface Props {
  /** Grade du joueur connecte — filtre les sections accessibles */
  playerGrade?: string | null;
}

export function FactionGradesPanel({ playerGrade }: Props) {
  const branches = useMemo(() => {
    const map = new Map<RpBranch, RpGradeMeta[]>();
    for (const g of rpGrades) {
      const list = map.get(g.branch) ?? [];
      list.push(g);
      map.set(g.branch, list);
    }
    return [...map.entries()];
  }, []);

  const [activeBranch, setActiveBranch] = useState<RpBranch>("omega");
  const activeGrades = branches.find(([b]) => b === activeBranch)?.[1] ?? [];

  const playerMeta = playerGrade
    ? rpGrades.find((g) => g.name.toLowerCase() === playerGrade.toLowerCase())
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {branches.map(([branch]) => (
          <button
            key={branch}
            type="button"
            onClick={() => setActiveBranch(branch)}
            className={`rounded border px-4 py-2 font-mono text-xs transition-all ${
              activeBranch === branch
                ? "border-redlake text-white"
                : "border-metal/50 text-gray-500 hover:border-metal"
            }`}
            style={
              activeBranch === branch
                ? { borderColor: BRANCH_COLORS[branch], color: BRANCH_COLORS[branch] }
                : undefined
            }
          >
            {BRANCH_LABELS[branch]}
          </button>
        ))}
      </div>

      {playerMeta && (
        <div className="rounded border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          Votre grade : <strong>{playerMeta.name}</strong> — accès aux onglets{" "}
          {playerMeta.siteSections.slice(0, 4).join(", ")}
          {playerMeta.siteSections.length > 4 ? "…" : ""}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {activeGrades.map((grade) => {
          const locked =
            playerGrade &&
            playerMeta &&
            playerMeta.branch !== grade.branch &&
            !["omega", "direction"].includes(playerMeta.branch) &&
            grade.clearance > playerMeta.clearance;

          return (
            <article
              key={grade.id}
              className={`hologram-border rounded-lg p-5 ${locked ? "opacity-60" : ""}`}
              style={{ borderLeftColor: BRANCH_COLORS[grade.branch], borderLeftWidth: 3 }}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white">{grade.name}</h3>
                  <p className="font-mono text-xs text-gray-600">
                    {BRANCH_LABELS[grade.branch]} • {grade.tier}
                  </p>
                </div>
                {locked ? (
                  <Lock className="h-4 w-4 shrink-0 text-gray-600" />
                ) : (
                  <Shield className="h-4 w-4 shrink-0" style={{ color: BRANCH_COLORS[grade.branch] }} />
                )}
              </div>

              <p className="mb-3 text-sm text-gray-500">{grade.description}</p>

              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="classified">{CLEARANCE_LABELS[grade.clearance as 1 | 2 | 3 | 4 | 5]}</Badge>
                {grade.pay != null && (
                  <Badge>{grade.pay.toLocaleString("fr-FR")} $/sem.</Badge>
                )}
                {grade.quota != null && <Badge>Quota {grade.quota}</Badge>}
              </div>

              {grade.objectives.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 flex items-center gap-1 font-mono text-xs text-redlake-glow">
                    <Target className="h-3 w-3" /> Missions
                  </p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    {grade.objectives.slice(0, 5).map((o) => (
                      <li key={o}>▸ {o}</li>
                    ))}
                  </ul>
                </div>
              )}

              {grade.utilities.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 flex items-center gap-1 font-mono text-xs text-gray-600">
                    <Users className="h-3 w-3" /> Domaines
                  </p>
                  <p className="text-xs text-gray-500">{grade.utilities.join(" • ")}</p>
                </div>
              )}

              {grade.accessZones.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {grade.accessZones.slice(0, 8).map((z) => (
                    <span
                      key={z}
                      className="rounded bg-metal/30 px-2 py-0.5 font-mono text-[10px] text-gray-500"
                    >
                      {z.toUpperCase()}
                    </span>
                  ))}
                  {grade.accessZones.length > 8 && (
                    <span className="text-[10px] text-gray-600">
                      +{grade.accessZones.length - 8}
                    </span>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
