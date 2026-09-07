import { API_URL } from "@/lib/api";

export interface ApiDepartment {
  id: string;
  slug: string;
  name: string;
  factionId: string;
  omegaTier: string | null;
  directorGradeName: string | null;
  color: string | null;
  utilities: string[];
  objectives: string[];
  chefId: string | null;
  deputyIds: string[];
  budget: number;
}

export interface ApiFaction {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  history: string | null;
  color: string | null;
  playable: boolean;
  objectives: string[];
  chefId: string | null;
  deputyIds: string[];
  budget: number;
  departments: ApiDepartment[];
  memberCount: number;
  topGrade: { name: string; pay: number } | null;
}

export interface FactionMember {
  rpFirstName: string | null;
  rpLastName: string | null;
  grade: string;
  minecraftUsername: string | null;
  avatarUrl: string | null;
}

export async function getFactionMembers(slug: string): Promise<FactionMember[]> {
  try {
    const res = await fetch(`${API_URL}/factions/${slug}/members`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export interface FactionEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
  type: string;
  outcome: string;
}

/** Pattern de fetch établi (server component + revalidate ISR) — voir src/app/grades/page.tsx */
export async function getFactions(): Promise<ApiFaction[]> {
  try {
    const res = await fetch(`${API_URL}/factions`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getFaction(slug: string): Promise<ApiFaction | null> {
  try {
    const res = await fetch(`${API_URL}/factions/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export type FactionRelationStatus = "ALLIE" | "NEUTRE" | "TENSION" | "HOSTILE";

export const FACTION_RELATION_LABELS: Record<FactionRelationStatus, string> = {
  ALLIE: "Alliée",
  NEUTRE: "Neutre",
  TENSION: "Tensions",
  HOSTILE: "Hostile / En guerre",
};

export const FACTION_RELATION_COLORS: Record<FactionRelationStatus, string> = {
  ALLIE: "border-green-400/40 text-green-400",
  NEUTRE: "border-metal text-gray-400",
  TENSION: "border-yellow-400/40 text-yellow-400",
  HOSTILE: "border-red-400/40 text-red-400",
};

export interface ApiFactionRelation {
  id: string;
  status: FactionRelationStatus;
  note: string | null;
  faction: { id: string; slug: string; name: string; color: string | null };
}

export async function getFactionRelations(
  factionId: string,
): Promise<ApiFactionRelation[]> {
  try {
    const res = await fetch(`${API_URL}/faction-relations/faction/${factionId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
