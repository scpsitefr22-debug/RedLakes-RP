"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCoreShell } from "./CoreShellProvider";

interface ApiSystemStatus {
  alertLevel: "NORMAL" | "VIGILANCE" | "ALERTE" | "CRISE";
  alertNote: string | null;
  alertUpdatedAt: string | null;
}

const ACK_KEY_PREFIX = "redlakes_core_alert_ack_";

/**
 * Le bureau réagit à un vrai changement d'état déclaré par le staff (voir
 * SystemService.updateStatus — jamais automatique/simulé). Une alerte
 * n'est réaffichée qu'une fois par déclaration réelle (clé sessionStorage
 * dérivée de alertUpdatedAt) : rechargée à chaque connexion tant qu'elle
 * n'a pas été explicitement accusée réception, mais jamais répétée pour
 * une alerte déjà vue et inchangée.
 */
export function CoreAlertOverlay() {
  const { session, openApp } = useCoreShell();
  const [status, setStatus] = useState<ApiSystemStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    apiFetch<ApiSystemStatus>("/system/status")
      .then(setStatus)
      .catch(() => undefined);
  }, []);

  if (!status || status.alertLevel === "NORMAL" || dismissed) return null;
  if (status.alertUpdatedAt && sessionStorage.getItem(ACK_KEY_PREFIX + status.alertUpdatedAt)) {
    return null;
  }

  const acknowledge = () => {
    if (status.alertUpdatedAt) {
      sessionStorage.setItem(ACK_KEY_PREFIX + status.alertUpdatedAt, "1");
    }
    setDismissed(true);
  };

  const consult = () => {
    acknowledge();
    openApp("notifications");
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 p-4">
      <div
        className="faction-card w-full max-w-sm p-6 text-center"
        style={{ boxShadow: `0 0 40px ${session.theme.rgba.surface}` }}
      >
        <AlertTriangle
          className="mx-auto mb-3 h-8 w-8"
          style={{ color: session.theme.colors.glow }}
        />
        <p
          className="mb-1 font-mono text-xs font-bold tracking-[0.2em]"
          style={{ color: session.theme.colors.glow }}
        >
          ALERTE DE SÉCURITÉ
        </p>
        <p className="mb-3 text-lg font-bold text-white">
          Niveau {status.alertLevel}
        </p>
        {status.alertNote && (
          <p className="mb-4 text-sm text-gray-400">{status.alertNote}</p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={consult}
            className="flex-1 rounded border px-3 py-2 font-mono text-xs"
            style={{ borderColor: session.theme.colors.glow, color: session.theme.colors.glow }}
          >
            Consulter
          </button>
          <button
            type="button"
            onClick={acknowledge}
            className="flex-1 rounded border border-metal px-3 py-2 font-mono text-xs text-gray-400 hover:text-white"
          >
            Accuser réception
          </button>
        </div>
      </div>
    </div>
  );
}
