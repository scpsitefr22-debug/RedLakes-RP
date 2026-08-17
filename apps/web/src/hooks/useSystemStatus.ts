"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { siteConfig } from "@/config/site";

export interface SystemStatus {
  serverOpen: boolean;
  recruitmentOpen: boolean;
  maintenance: boolean;
}

const FALLBACK: SystemStatus = {
  serverOpen: siteConfig.serverOpen,
  recruitmentOpen: siteConfig.recruitmentOpen,
  maintenance: false,
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
