"use client";

import { useMemo, useState } from "react";
import {
  getFactionRoleCategories,
  type FactionRoleEntry,
} from "@/data/faction-role-catalog";
import { factions } from "@/data/factions";
import { Badge } from "@/components/ui/Badge";
import { CLEARANCE_LABELS } from "@/lib/clearance";
import { Shield, Target, Globe } from "lucide-react";

interface Props {
  factionId: string;
}

export function FactionRoleCategoriesPanel({ factionId }: Props) {
  const faction = factions.find((f) => f.id === factionId);
  const categories = useMemo(() => getFactionRoleCategories(factionId), [factionId]);
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");

  if (!categories.length) {
    return (
      <p className="text-sm text-gray-500">
        Catalogue de rôles en cours de rédaction pour cette faction.
      </p>
    );
  }

  const active = categories.find((c) => c.id === activeId) ?? categories[0];
  const accent = faction?.color ?? active.color;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveId(cat.id)}
            className={`rounded border px-4 py-2 font-mono text-xs transition-all ${
              active.id === cat.id
                ? "border-redlake text-white"
                : "border-metal/50 text-gray-500 hover:border-metal"
            }`}
            style={
              active.id === cat.id
                ? { borderColor: cat.color, color: cat.color }
                : undefined
            }
          >
            {cat.label}
            <span className="ml-1 text-gray-600">({cat.roles.length})</span>
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500">{active.summary}</p>

      <div className="grid gap-4 md:grid-cols-2">
        {active.roles.map((role) => (
          <RoleCard key={role.name} role={role} color={active.color} accent={accent} />
        ))}
      </div>
    </div>
  );
}

function RoleCard({
  role,
  color,
  accent,
}: {
  role: FactionRoleEntry;
  color: string;
  accent: string;
}) {
  return (
    <article
      className="hologram-border rounded-lg p-5"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-bold text-white">{role.name}</h3>
        <Shield className="h-4 w-4 shrink-0" style={{ color: accent }} />
      </div>

      <p className="mb-3 text-sm text-gray-500">{role.description}</p>

      <div className="mb-3 flex flex-wrap gap-2">
        {role.clearance != null && (
          <Badge variant="classified">
            {CLEARANCE_LABELS[role.clearance]}
          </Badge>
        )}
        {role.pay != null && (
          <Badge>{role.pay.toLocaleString("fr-FR")} $/sem.</Badge>
        )}
        {role.quota != null && <Badge>Quota {role.quota}</Badge>}
      </div>

      {role.missions && role.missions.length > 0 && (
        <div className="mb-2">
          <p className="mb-1 flex items-center gap-1 font-mono text-xs text-redlake-glow">
            <Target className="h-3 w-3" /> Missions
          </p>
          <ul className="space-y-1 text-xs text-gray-500">
            {role.missions.map((m) => (
              <li key={m}>▸ {m}</li>
            ))}
          </ul>
        </div>
      )}

      {role.siteAccess && role.siteAccess.length > 0 && (
        <div className="mt-2">
          <p className="mb-1 flex items-center gap-1 font-mono text-xs text-gray-600">
            <Globe className="h-3 w-3" /> Accès site
          </p>
          <div className="flex flex-wrap gap-1">
            {role.siteAccess.map((s) => (
              <span
                key={s}
                className="rounded bg-metal/30 px-2 py-0.5 font-mono text-[10px] text-gray-500"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
