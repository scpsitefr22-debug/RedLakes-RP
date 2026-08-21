"use client";

import { useSystemStatus, type AlertLevel } from "@/hooks/useSystemStatus";

const ALERT_LABELS: Record<AlertLevel, string> = {
  NORMAL: "Niveau normal",
  VIGILANCE: "Vigilance",
  ALERTE: "Alerte",
  CRISE: "Crise",
};

const ALERT_STYLES: Record<AlertLevel, string> = {
  NORMAL: "border-metal/50 text-gray-500",
  VIGILANCE: "border-yellow-400/40 text-yellow-400",
  ALERTE: "border-orange-400/50 text-orange-400",
  CRISE: "border-red-500/60 text-red-500 animate-pulse",
};

export function AlertLevelBadge() {
  const status = useSystemStatus();

  return (
    <span
      title={status.alertNote ?? undefined}
      className={`hidden items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider sm:inline-flex ${ALERT_STYLES[status.alertLevel]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {ALERT_LABELS[status.alertLevel]}
    </span>
  );
}
