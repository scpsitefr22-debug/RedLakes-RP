import type { LucideIcon } from "lucide-react";
import {
  Archive,
  BookOpen,
  Bot,
  Building2,
  Camera,
  FileText,
  FileX2,
  History,
  Mail,
  Map,
  MessageSquare,
  Radio,
  ScrollText,
  ServerCrash,
  Settings,
  ShieldCheck,
  ShieldQuestion,
  Terminal,
  Users,
  Waypoints,
  Wrench,
} from "lucide-react";
import type { ChapterId } from "@redlakes/narrative-core";
import type { AppId } from "../../lib/workstation";

export type DashboardNavId = AppId | "tools";

export interface DashboardNavItem {
  id: DashboardNavId;
  label: string;
  icon: LucideIcon;
  appId: AppId | null;
}

export const BASE_DASHBOARD_NAV: DashboardNavItem[] = [
  { id: "messenger", label: "Messagerie", icon: MessageSquare, appId: "messenger" },
  { id: "email", label: "Mail interne", icon: Mail, appId: "email" },
  { id: "documents", label: "Rapports", icon: FileText, appId: "documents" },
  { id: "scp-database", label: "Base SCP", icon: BookOpen, appId: "scp-database" },
  { id: "personnel", label: "Personnel", icon: Users, appId: "personnel" },
  { id: "cameras", label: "Caméras", icon: Camera, appId: "cameras" },
  { id: "cassie", label: "CASSIE", icon: Bot, appId: "cassie" },
  { id: "archives", label: "Archives", icon: Archive, appId: "archives" },
  { id: "site-plans", label: "Plans du site", icon: Map, appId: "site-plans" },
  { id: "incident-log", label: "Journal", icon: ScrollText, appId: "incident-log" },
  { id: "tools", label: "Outils", icon: Wrench, appId: "calendar" },
  { id: "settings", label: "Paramètres", icon: Settings, appId: "settings" },
];

/** Entrées de nav propres à un chapitre — n'apparaissent que pendant ce chapitre */
export const CHAPTER_NAV_EXTRAS: Partial<Record<ChapterId, DashboardNavItem[]>> = {
  2: [{ id: "protocols", label: "Protocoles", icon: ShieldCheck, appId: "protocols" }],
  3: [{ id: "city-map", label: "Plan municipal", icon: Building2, appId: "city-map" }],
  4: [{ id: "sewer-schematics", label: "Réseau souterrain", icon: Waypoints, appId: "sewer-schematics" }],
  5: [{ id: "aegis-database", label: "Base AEGIS", icon: ShieldQuestion, appId: "aegis-database" }],
  6: [{ id: "deleted-files", label: "Fichiers supprimés", icon: FileX2, appId: "deleted-files" }],
  7: [{ id: "control-room", label: "Salle de contrôle", icon: Radio, appId: "control-room" }],
  8: [
    { id: "corrupted-server", label: "Serveur corrompu", icon: ServerCrash, appId: "corrupted-server" },
    { id: "admin-console", label: "Console admin", icon: Terminal, appId: "admin-console" },
  ],
  9: [{ id: "legacy-archive", label: "Archives héritées", icon: History, appId: "legacy-archive" }],
};

export function getDashboardNav(chapterId: ChapterId): DashboardNavItem[] {
  return [...BASE_DASHBOARD_NAV, ...(CHAPTER_NAV_EXTRAS[chapterId] ?? [])];
}

export function resolveNavAppId(nav: DashboardNavItem[], id: DashboardNavId): AppId | null {
  return nav.find((n) => n.id === id)?.appId ?? null;
}
