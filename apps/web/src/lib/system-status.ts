import { API_URL } from "@/lib/api";
import { siteConfig } from "@/config/site";
import type { SystemStatus } from "@/hooks/useSystemStatus";

/** Équivalent serveur de useSystemStatus() — pour les pages non "use client". */
export async function getSystemStatus(): Promise<SystemStatus> {
  try {
    const res = await fetch(`${API_URL}/system/status`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return {
      serverOpen: siteConfig.serverOpen,
      recruitmentOpen: siteConfig.recruitmentOpen,
      maintenance: false,
      alertLevel: "NORMAL",
      alertNote: null,
      alertUpdatedAt: null,
    };
  }
}
