import type { LucideIcon } from "lucide-react";
import {
  Archive,
  BookOpen,
  Bot,
  Camera,
  FileText,
  Mail,
  Map,
  MessageSquare,
  ScrollText,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import type { AppId } from "../../lib/workstation";

export type DashboardNavId = AppId | "cameras" | "archives" | "site-plans" | "tools";

export interface DashboardNavItem {
  id: DashboardNavId;
  label: string;
  icon: LucideIcon;
  appId: AppId | null;
}

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { id: "messenger", label: "Messagerie", icon: MessageSquare, appId: "messenger" },
  { id: "email", label: "Mail interne", icon: Mail, appId: "email" },
  { id: "documents", label: "Rapports", icon: FileText, appId: "documents" },
  { id: "scp-database", label: "Base SCP", icon: BookOpen, appId: "scp-database" },
  { id: "personnel", label: "Personnel", icon: Users, appId: "personnel" },
  { id: "cameras", label: "Caméras", icon: Camera, appId: null },
  { id: "cassie", label: "CASSIE", icon: Bot, appId: "cassie" },
  { id: "archives", label: "Archives", icon: Archive, appId: null },
  { id: "site-plans", label: "Plans du site", icon: Map, appId: null },
  { id: "incident-log", label: "Journal", icon: ScrollText, appId: "incident-log" },
  { id: "tools", label: "Outils", icon: Wrench, appId: "calendar" },
  { id: "settings", label: "Paramètres", icon: Settings, appId: "settings" },
];

export function resolveNavAppId(id: DashboardNavId): AppId | null {
  return DASHBOARD_NAV.find((n) => n.id === id)?.appId ?? null;
}
