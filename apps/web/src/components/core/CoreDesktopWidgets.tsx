"use client";

import { useEffect, useState } from "react";
import { Bell, Wifi, WifiOff, Wrench } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { NotificationsPage } from "@/lib/platform-types";
import { useCoreShell } from "./CoreShellProvider";

interface ApiSystemStatus {
  serverOpen: boolean;
  recruitmentOpen: boolean;
  maintenance: boolean;
  alertLevel: "NORMAL" | "VIGILANCE" | "ALERTE" | "CRISE";
}

const ALERT_COLORS: Record<ApiSystemStatus["alertLevel"], string> = {
  NORMAL: "#4ade80",
  VIGILANCE: "#facc15",
  ALERTE: "#f97316",
  CRISE: "#ef4444",
};

function StatusRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <Wifi className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <WifiOff className="h-3.5 w-3.5 text-gray-600" />
      )}
      <span className={ok ? "text-gray-300" : "text-gray-600"}>{label}</span>
    </div>
  );
}

/**
 * Widgets posés directement sur le bureau (pas dans une fenêtre) — statut
 * réseau et aperçu des notifications. N'affiche QUE des états réels
 * (SystemState, /platform/notifications/me) : pas de faux "Discord en
 * ligne"/"Minecraft en ligne" qu'on ne peut pas vérifier depuis l'API.
 */
export function CoreDesktopWidgets() {
  const { session, openApp } = useCoreShell();
  const [status, setStatus] = useState<ApiSystemStatus | null>(null);
  const [notifs, setNotifs] = useState<NotificationsPage | null>(null);

  useEffect(() => {
    apiFetch<ApiSystemStatus>("/system/status").then(setStatus).catch(() => undefined);
    apiFetch<NotificationsPage>("/platform/notifications/me?limit=3")
      .then(setNotifs)
      .catch(() => undefined);
  }, []);

  return (
    <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
      <div className="faction-card p-4">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-gray-500">
          Statut du réseau
        </p>
        {status ? (
          <div className="space-y-2 font-mono text-xs">
            <StatusRow ok={status.serverOpen} label="Serveur ouvert" />
            <StatusRow ok={!status.maintenance} label={status.maintenance ? "Maintenance en cours" : "Aucune maintenance"} />
            <div className="flex items-center gap-2 pt-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: ALERT_COLORS[status.alertLevel], boxShadow: `0 0 6px ${ALERT_COLORS[status.alertLevel]}` }}
              />
              <span className="text-gray-300">Niveau d&apos;alerte : {status.alertLevel}</span>
            </div>
            {status.maintenance && (
              <p className="flex items-center gap-1.5 pt-1 text-[10px] text-yellow-400">
                <Wrench className="h-3 w-3" /> Le site est en maintenance.
              </p>
            )}
          </div>
        ) : (
          <p className="font-mono text-xs text-gray-600">Chargement…</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => openApp("notifications")}
        className="faction-card p-4 text-left transition-opacity hover:opacity-90"
      >
        <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-gray-500">
          <Bell className="h-3.5 w-3.5" />
          Notifications
          {notifs && notifs.unreadCount > 0 && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white"
              style={{ background: session.theme.colors.primary }}
            >
              {notifs.unreadCount}
            </span>
          )}
        </p>
        {!notifs || notifs.items.length === 0 ? (
          <p className="font-mono text-xs text-gray-600">Aucune notification récente.</p>
        ) : (
          <ul className="space-y-1.5">
            {notifs.items.map((n) => (
              <li key={n.id} className="truncate text-xs text-gray-400">
                <span className={n.readAt ? "" : "font-medium text-gray-200"}>{n.title}</span>
              </li>
            ))}
          </ul>
        )}
      </button>
    </div>
  );
}
