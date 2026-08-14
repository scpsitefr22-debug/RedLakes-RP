import type { SiteStatus } from "@redlakes/narrative-core";
import { Bell, Mail, MessageSquare, Volume2, VolumeX } from "lucide-react";
import type { ChapterId } from "@redlakes/narrative-core";

interface DashboardHeaderProps {
  siteTime: Date;
  clearance: number;
  siteStatus: SiteStatus;
  playerName: string;
  employeeId: string | null;
  chapterId: ChapterId;
  muted: boolean;
  onToggleMute: () => void;
  onExit: () => void;
}

export function DashboardHeader({
  siteTime,
  clearance,
  playerName,
  employeeId,
  muted,
  onToggleMute,
  onExit,
}: DashboardHeaderProps) {
  const timeStr = siteTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const displayUser = (employeeId ?? playerName.toUpperCase()) || "RECRUE";
  const clearancePct = Math.min(100, (clearance / 5) * 100);

  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-dashboard-border bg-dashboard-header px-4">
      <div className="flex min-w-0 shrink-0 items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashboard-accent/50 bg-dashboard-accent/10 text-[10px] font-bold text-dashboard-accent">
          RL
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-[11px] font-semibold tracking-wide text-foreground">
            REDLAKES TERMINAL
          </p>
          <p className="truncate text-[9px] text-metal">SITE-12 SECURE OS v.2.4.1</p>
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 items-center justify-center gap-6 md:flex">
        <div className="text-center">
          <p className="text-[8px] uppercase tracking-wider text-metal">Utilisateur</p>
          <p className="text-[11px] font-medium text-foreground">{displayUser}</p>
        </div>
        <div className="w-44">
          <div className="flex justify-between text-[8px] uppercase tracking-wider text-metal">
            <span>Niveau d&apos;accréditation</span>
            <span className="text-dashboard-clearance">{clearance}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-background">
            <div
              className="h-full bg-dashboard-clearance transition-all"
              style={{ width: `${clearancePct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <div className="hidden items-center gap-2 text-metal sm:flex">
          <Mail size={15} className="opacity-70" />
          <MessageSquare size={15} className="opacity-70" />
          <Bell size={15} className="opacity-70" />
        </div>
        <span className="font-mono text-sm text-foreground">{timeStr}</span>
        <button
          type="button"
          onClick={onToggleMute}
          className="text-metal transition-colors hover:text-dashboard-accent"
          title={muted ? "Activer ambiance" : "Couper ambiance"}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="border border-dashboard-border px-2 py-0.5 text-[10px] text-metal transition-colors hover:border-dashboard-accent hover:text-dashboard-accent"
        >
          Quitter
        </button>
      </div>
    </header>
  );
}
