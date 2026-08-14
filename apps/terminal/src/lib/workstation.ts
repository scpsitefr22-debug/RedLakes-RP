import type { ChapterId, GlobalNarrativeSave } from "@redlakes/narrative-core";

export type AppId =
  | "messenger"
  | "email"
  | "documents"
  | "scp-database"
  | "personnel"
  | "cassie"
  | "incident-log"
  | "calendar"
  | "settings";

export const APP_TITLES: Record<AppId, string> = {
  messenger: "Messagerie inter-sites — Site-12",
  email: "Courrier interne",
  documents: "Documents — Site-12",
  "scp-database": "Base SCP",
  personnel: "Annuaire personnel",
  cassie: "CASSIE",
  "incident-log": "Journal des incidents",
  calendar: "Agenda Site-12",
  settings: "Paramètres terminal",
};

export const MINIMAL_DESKTOP_APPS: AppId[] = ["messenger", "email"];

export const FULL_WORKSTATION_APPS: AppId[] = [
  "messenger",
  "email",
  "documents",
  "scp-database",
  "personnel",
  "cassie",
  "incident-log",
  "calendar",
  "settings",
];

export const DEPARTMENTS = [
  "Admin",
  "Recherche",
  "Sécurité",
  "RH",
  "MTF",
  "Maintenance",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export function getCharacterDepartment(characterId: string): Department {
  const map: Record<string, Department> = {
    "rh-terminal": "RH",
    "superviseur-rh": "RH",
    "directeur-site": "Admin",
    "archiviste-c2": "Admin",
    cassie: "Admin",
    "infirmier-site": "Admin",
    "dr-chen": "Recherche",
    "chercheur-junior-euclid": "Recherche",
    "agent-securite-perimetre": "Sécurité",
    "responsable-class-d": "Sécurité",
    "liaison-mtf-junior": "MTF",
    "commandant-nu7": "MTF",
    "technicien-maintenance": "Maintenance",
  };
  return map[characterId] ?? "Admin";
}

export function hasFullWorkstation(gns: GlobalNarrativeSave, chapterId: ChapterId): boolean {
  if (chapterId !== 1) return true;
  return Boolean(gns.flags.ch1_left_director_office);
}

export function getEffectiveUnlockedApps(
  gns: GlobalNarrativeSave,
  chapterId: ChapterId
): AppId[] {
  if (hasFullWorkstation(gns, chapterId)) {
    return FULL_WORKSTATION_APPS;
  }
  return MINIMAL_DESKTOP_APPS;
}

export function getContactStatus(
  started: boolean,
  isTyping: boolean,
  isActive: boolean
): "online" | "away" | "offline" {
  if (!started) return "offline";
  if (isTyping || isActive) return "online";
  return "away";
}

export const STATUS_DOT_COLORS = {
  online: "bg-terminal",
  away: "bg-amber-500",
  offline: "bg-metal",
} as const;
