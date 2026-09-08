/**
 * Types/constantes pures uniquement — aucun fetch, aucun import serveur
 * (next/headers). Separe de faction-api.ts pour que les composants
 * client (ex. FactionRelationsPanel.tsx) puissent importer ces types
 * sans entrainer next/headers dans leur bundle navigateur.
 */

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

export interface FactionEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
  type: string;
  outcome: string;
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
