import type { SiteStatus } from "@redlakes/narrative-core";
import { Wifi, Shield, User } from "lucide-react";

const STATUS_LABELS: Record<SiteStatus, string> = {
  stable: "STABLE",
  breach: "BRÈCHE",
  lockdown: "CONFINEMENT",
  audit: "AUDIT AEGIS",
  "xk-scenario": "SCÉNARIO XK",
};

interface StatusBarProps {
  siteTime: Date;
  clearance: number;
  siteStatus: SiteStatus;
  playerName: string;
  employeeId: string | null;
}

export function StatusBar({ siteTime, clearance, siteStatus, playerName, employeeId }: StatusBarProps) {
  const timeStr = siteTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = siteTime.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const statusColor =
    siteStatus === "stable"
      ? "text-terminal"
      : siteStatus === "breach" || siteStatus === "xk-scenario"
        ? "text-redlake"
        : "text-amber-500";

  return (
    <header className="flex items-center justify-between border-b border-panel-border bg-classified px-4 py-2 text-[11px]">
      <div className="flex items-center gap-4">
        <span className="tracking-widest text-foreground">SITE-12</span>
        <span className="text-metal">{dateStr}</span>
        <span className="font-mono text-foreground">{timeStr}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className={`flex items-center gap-1 ${statusColor}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {STATUS_LABELS[siteStatus]}
        </span>
        <span className="flex items-center gap-1 text-foreground" title={employeeId ?? undefined}>
          <User className="h-3 w-3" />
          {playerName}
          <span className="text-metal">— Recrue</span>
        </span>
        <span className="flex items-center gap-1 text-metal">
          <Shield className="h-3 w-3" />
          Clearance {clearance}
        </span>
        <span className="flex items-center gap-1 text-terminal">
          <Wifi className="h-3 w-3" />
          RÉSEAU SÉCURISÉ
        </span>
      </div>
    </header>
  );
}
