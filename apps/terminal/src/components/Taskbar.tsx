import type { SiteStatus } from "@redlakes/narrative-core";
import {
  Grid3x3,
  LogOut,
  Shield,
  Volume2,
  VolumeX,
  Wifi,
} from "lucide-react";
import type { AppId } from "../lib/workstation";
import { APP_TITLES } from "../lib/workstation";

const STATUS_LABELS: Record<SiteStatus, string> = {
  stable: "STABLE",
  breach: "BRÈCHE",
  lockdown: "CONFINEMENT",
  audit: "AUDIT AEGIS",
  "xk-scenario": "SCÉNARIO XK",
};

interface TaskbarProps {
  siteTime: Date;
  clearance: number;
  siteStatus: SiteStatus;
  playerName: string;
  chapterId: number;
  openApps: AppId[];
  focusedApp: AppId | null;
  muted: boolean;
  onToggleStart: () => void;
  onOpenApp: (id: AppId) => void;
  onToggleMute: () => void;
  onExit: () => void;
}

export function Taskbar({
  siteTime,
  clearance,
  siteStatus,
  playerName,
  chapterId,
  openApps,
  focusedApp,
  muted,
  onToggleStart,
  onOpenApp,
  onToggleMute,
  onExit,
}: TaskbarProps) {
  const timeStr = siteTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateStr = siteTime.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  const statusColor =
    siteStatus === "stable"
      ? "text-terminal"
      : siteStatus === "breach" || siteStatus === "xk-scenario"
        ? "text-redlake"
        : "text-amber-500";

  return (
    <footer className="relative z-30 flex h-10 shrink-0 items-stretch border-t border-panel-border bg-[#0a0a0a]/95 backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggleStart}
        className="flex items-center gap-2 border-r border-panel-border px-3 text-[11px] text-foreground transition-colors hover:bg-classified"
        aria-label="Menu applications"
      >
        <Grid3x3 className="h-3.5 w-3.5 text-redlake" />
        <span className="hidden sm:inline">Site-12</span>
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto px-1">
        {openApps.map((id) => {
          const focused = focusedApp === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onOpenApp(id)}
              className={`max-w-[160px] truncate px-3 py-2 text-[10px] transition-colors ${
                focused
                  ? "border-t-2 border-redlake bg-panel text-foreground"
                  : "border-t-2 border-transparent text-metal hover:bg-classified hover:text-foreground"
              }`}
            >
              {APP_TITLES[id].split(" — ")[0]}
            </button>
          );
        })}
        {openApps.length === 0 && (
          <span className="px-3 text-[10px] text-metal/60 italic">
            Aucune application ouverte
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 border-l border-panel-border px-2 text-[10px]">
        <span className={`flex items-center gap-1 px-1.5 ${statusColor}`} title="Statut site">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {STATUS_LABELS[siteStatus]}
        </span>

        <button
          type="button"
          onClick={onToggleMute}
          className="p-1.5 text-metal hover:text-foreground"
          title={muted ? "Activer l'ambiance" : "Couper l'ambiance"}
          aria-label={muted ? "Activer l'ambiance" : "Couper l'ambiance"}
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>

        <span className="p-1.5 text-terminal" title="Réseau sécurisé">
          <Wifi className="h-3.5 w-3.5" />
        </span>

        <span className="flex items-center gap-1 px-1.5 text-metal" title={`Clearance ${clearance}`}>
          <Shield className="h-3 w-3" />
          C-{clearance}
        </span>

        <div className="hidden border-l border-panel-border pl-2 text-right md:block">
          <div className="font-mono text-[11px] text-foreground">{timeStr}</div>
          <div className="text-[9px] text-metal">{dateStr}</div>
        </div>

        <span className="max-w-[80px] truncate px-1.5 text-[10px] text-metal" title={playerName}>
          {playerName}
        </span>

        <span className="px-1 text-metal/50">|</span>
        <span className="text-[9px] text-metal">Ch.{chapterId}</span>

        <button
          type="button"
          onClick={onExit}
          className="ml-1 flex items-center gap-1 p-1.5 text-metal hover:text-redlake"
          title="Quitter le terminal"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </footer>
  );
}
