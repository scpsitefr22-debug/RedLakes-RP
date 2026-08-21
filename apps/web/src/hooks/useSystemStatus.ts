"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { siteConfig } from "@/config/site";

export type AlertLevel = "NORMAL" | "VIGILANCE" | "ALERTE" | "CRISE";

export interface SystemStatus {
  serverOpen: boolean;
  recruitmentOpen: boolean;
  maintenance: boolean;
  alertLevel: AlertLevel;
  alertNote: string | null;
  alertUpdatedAt: string | null;
}

const FALLBACK: SystemStatus = {
  serverOpen: siteConfig.serverOpen,
  recruitmentOpen: siteConfig.recruitmentOpen,
  maintenance: false,
  alertLevel: "NORMAL",
  alertNote: null,
  alertUpdatedAt: null,
};

/**
 * Source unique "serveur ouvert / recrutement ouvert" (GET /system/status).
 * Retombe sur config/site.ts tant que la requête n'a pas abouti — jamais
 * d'état vide/cassé si l'API est indisponible.
 */
export function useSystemStatus(): SystemStatus {
  const [status, setStatus] = useState<SystemStatus>(FALLBACK);

  useEffect(() => {
    apiFetch<SystemStatus>("/system/status")
      .then(setStatus)
      .catch(() => undefined);
  }, []);

  return status;
}
