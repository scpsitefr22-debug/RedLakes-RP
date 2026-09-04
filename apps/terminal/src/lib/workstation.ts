import type { ChapterId, GlobalNarrativeSave } from "@redlakes/narrative-core";

export type AppId =
  | "messenger"
  | "email"
  | "documents"
  | "scp-database"
  | "personnel"
  | "cameras"
  | "cassie"
  | "archives"
  | "site-plans"
  | "incident-log"
  | "calendar"
  | "settings"
  | "protocols"
  | "city-map"
  | "sewer-schematics"
  | "aegis-database"
  | "deleted-files"
  | "control-room"
  | "corrupted-server"
  | "admin-console"
  | "legacy-archive";

export const APP_TITLES: Record<AppId, string> = {
  messenger: "Messagerie inter-sites — Site-12",
  email: "Courrier interne",
  documents: "Documents — Site-12",
  "scp-database": "Base SCP",
  personnel: "Annuaire personnel",
  cameras: "Vidéosurveillance — Site-12",
  cassie: "CASSIE",
  archives: "Archives — Site-12",
  "site-plans": "Plans du site",
  "incident-log": "Journal des incidents",
  calendar: "Agenda Site-12",
  settings: "Paramètres terminal",
  protocols: "Protocoles de confinement",
  "city-map": "Plan municipal — REDLAKES",
  "sewer-schematics": "Schémas — Réseau souterrain",
  "aegis-database": "Base A.E.G.I.S.",
  "deleted-files": "Fichiers supprimés",
  "control-room": "Salle de contrôle — Confinement",
  "corrupted-server": "Serveur corrompu",
  "admin-console": "Console administrateur",
  "legacy-archive": "Archives héritées",
};

export const MINIMAL_DESKTOP_APPS: AppId[] = ["messenger", "email"];

export const FULL_WORKSTATION_APPS: AppId[] = [
  "messenger",
  "email",
  "documents",
  "scp-database",
  "personnel",
  "cameras",
  "cassie",
  "archives",
  "site-plans",
  "incident-log",
  "calendar",
  "settings",
];

export const DEPARTMENTS = [
  "Admin",
  "Recherche",
  "Sécurité",
  "RH",
  "FIM",
  "Maintenance",
  "Externe",
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
    "agent-parker": "Sécurité",
    "responsable-class-d": "Sécurité",
    "liaison-mtf-junior": "FIM",
    "commandant-nu7": "FIM",
    "technicien-maintenance": "Maintenance",
    "chef-moretti": "Externe",
    "initie-serpent": "Externe",
    "inspecteur-aegis": "Externe",
  };
  return map[characterId] ?? "Admin";
}

export function hasFullWorkstation(gns: GlobalNarrativeSave, chapterId: ChapterId): boolean {
  if (chapterId !== 1) return true;
  return Boolean(gns.flags.ch1_left_director_office);
}

/** Applications propres à un chapitre, en plus du socle commun */
export const CHAPTER_UNIQUE_APPS: Partial<Record<ChapterId, AppId[]>> = {
  2: ["protocols"],
  3: ["city-map"],
  4: ["sewer-schematics"],
  5: ["aegis-database"],
  6: ["deleted-files"],
  7: ["control-room"],
  8: ["corrupted-server", "admin-console"],
  9: ["legacy-archive"],
};

export function getEffectiveUnlockedApps(
  gns: GlobalNarrativeSave,
  chapterId: ChapterId
): AppId[] {
  if (!hasFullWorkstation(gns, chapterId)) {
    return MINIMAL_DESKTOP_APPS;
  }
  const unique = CHAPTER_UNIQUE_APPS[chapterId] ?? [];
  return [...FULL_WORKSTATION_APPS, ...unique];
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
