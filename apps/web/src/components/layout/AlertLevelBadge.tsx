"use client";

import { useSystemStatus, type AlertLevel } from "@/hooks/useSystemStatus";

const ALERT_LABELS: Record<AlertLevel, string> = {
  NORMAL: "Niveau normal",
  VIGILANCE: "Vigilance",
  ALERTE: "Alerte",
  CRISE: "Crise",
};

const ALERT_STYLES: Record<AlertLevel, string> = {
  NORMAL: "text-emerald-400/90",
  VIGILANCE: "text-yellow-300",
  ALERTE: "text-orange-400",
  CRISE: "text-red-400 animate-pulse",
};

export function AlertLevelBadge() {
  const status = useSystemStatus();

  return (
    <span
      title={status.alertNote ?? undefined}
      className={`label-mono hidden items-center gap-2 text-[10px] sm:inline-flex ${ALERT_STYLES[status.alertLevel]}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {ALERT_LABELS[status.alertLevel]}
    </span>
  );
}
