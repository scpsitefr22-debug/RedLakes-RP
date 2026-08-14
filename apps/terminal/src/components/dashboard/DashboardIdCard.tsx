import type { GlobalNarrativeSave } from "@redlakes/narrative-core";
import { Check, X } from "lucide-react";
import { DashboardWidget } from "./DashboardWidget";

interface DashboardIdCardProps {
  gns: GlobalNarrativeSave;
  clearance: number;
  playerName: string;
  employeeId: string | null;
}

function buildAuthRows(gns: GlobalNarrativeSave, clearance: number) {
  const rows: Array<{ label: string; granted: boolean }> = [
    { label: `Zones sécurisées niveau 1-${clearance}`, granted: true },
    { label: "Messagerie inter-sites", granted: Boolean(gns.flags.ch1_left_director_office) },
    { label: "Données AEGIS", granted: Boolean(gns.flags.ch1_aegis_noted) },
    { label: "Secteurs Euclid", granted: Boolean(gns.flags.ch1_chen_logs_received) },
    { label: "Caméras surveillance", granted: clearance >= 2 },
  ];
  return rows;
}

export function DashboardIdCard({
  gns,
  clearance,
  playerName,
  employeeId,
}: DashboardIdCardProps) {
  const displayId = (employeeId ?? playerName.toUpperCase()) || "RECRUE-????";
  const authRows = buildAuthRows(gns, clearance);

  return (
    <DashboardWidget title="Carte d'identité" bodyClassName="p-3">
      <div className="flex gap-3">
        <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-end border border-dashboard-border bg-[#0a1018]">
          <div className="mb-2 h-10 w-8 rounded-t-full bg-gradient-to-b from-metal/50 to-metal/20" />
          <div className="w-full border-t border-dashboard-border py-0.5 text-center text-[7px] text-metal">
            PHOTO
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-foreground">
            {displayId}
          </p>
          <p className="truncate text-[9px] text-metal">{playerName}</p>
          <p className="mt-2 inline-block bg-dashboard-clearance/15 px-1.5 py-0.5 text-[10px] font-bold text-dashboard-clearance">
            NIVEAU {clearance}
          </p>
        </div>
      </div>

      <div className="mt-3 border-t border-dashboard-border/60 pt-2">
        <p className="mb-1.5 text-[9px] uppercase tracking-wider text-metal">Autorisations</p>
        <ul className="space-y-1">
          {authRows.map((row) => (
            <li key={row.label} className="flex items-start gap-1.5 text-[9px]">
              {row.granted ? (
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-terminal" />
              ) : (
                <X className="mt-0.5 h-3 w-3 shrink-0 text-red-400/80" />
              )}
              <span className={row.granted ? "text-foreground/85" : "text-metal/70"}>
                {row.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardWidget>
  );
}
