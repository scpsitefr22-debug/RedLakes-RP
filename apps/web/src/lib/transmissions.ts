import { API_URL } from "@/lib/api";

export type TransmissionType =
  | "MESSAGE"
  | "ANNOUNCE"
  | "MEMBER_JOIN"
  | "MEMBER_LEAVE"
  | "EVENT"
  | "BOOST";

export interface Transmission {
  id: string;
  type: TransmissionType;
  channelLabel: string;
  clearance: number;
  isPublic: boolean;
  codename: string;
  authorDisplay: string | null;
  title: string;
  body: string;
  excerpt: string | null;
  occurredAt: string;
}

export const TRANSMISSION_TYPE_LABELS: Record<TransmissionType, string> = {
  MESSAGE: "Transmission",
  ANNOUNCE: "Directive",
  MEMBER_JOIN: "Accréditation",
  MEMBER_LEAVE: "Révocation",
  EVENT: "Évènement",
  BOOST: "Renfort",
};

/** Récupère le flux public des transmissions depuis l'API (lecture seule, sans clé). */
export async function getTransmissions(limit = 60): Promise<Transmission[]> {
  try {
    const res = await fetch(`${API_URL}/transmissions?limit=${limit}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    return (await res.json()) as Transmission[];
  } catch {
    return [];
  }
}

/** Horodatage "Fondation" : date FR + heure, préfixé Site-12. */
export function foundationTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Horodatage corrompu";
  const date = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${date} — ${time} (heure Site-12)`;
}
