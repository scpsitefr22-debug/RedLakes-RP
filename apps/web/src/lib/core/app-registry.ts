import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { UserSquare2, Bell, FileText, Map, Target, Users, Lock, MessageSquare, Skull, Mail } from "lucide-react";
import { ProfileApp } from "@/components/core/apps/ProfileApp";
import { NotificationsApp } from "@/components/core/apps/NotificationsApp";
import { ReportsApp } from "@/components/core/apps/ReportsApp";
import { CarteApp } from "@/components/core/apps/CarteApp";
import { MissionsApp } from "@/components/core/apps/MissionsApp";
import { PersonnelApp } from "@/components/core/apps/PersonnelApp";
import { EquipesApp } from "@/components/core/apps/EquipesApp";
import { DocumentsApp } from "@/components/core/apps/DocumentsApp";
import { CommunicationsApp } from "@/components/core/apps/CommunicationsApp";
import { OphisApp } from "@/components/core/apps/OphisApp";
import { MessagerieApp } from "@/components/core/apps/MessagerieApp";

export interface CoreAppDef {
  id: string;
  label: string;
  icon: LucideIcon;
  component: ComponentType;
}

type AppId =
  | "profil"
  | "notifications"
  | "rapports"
  | "carte"
  | "missions"
  | "personnel"
  | "equipes"
  | "documents"
  | "communications"
  | "messagerie"
  | "ophis";

const BASE_APPS: Record<AppId, Omit<CoreAppDef, "label">> = {
  profil: { id: "profil", icon: UserSquare2, component: ProfileApp },
  notifications: { id: "notifications", icon: Bell, component: NotificationsApp },
  rapports: { id: "rapports", icon: FileText, component: ReportsApp },
  carte: { id: "carte", icon: Map, component: CarteApp },
  missions: { id: "missions", icon: Target, component: MissionsApp },
  personnel: { id: "personnel", icon: Users, component: PersonnelApp },
  equipes: { id: "equipes", icon: Users, component: EquipesApp },
  documents: { id: "documents", icon: Lock, component: DocumentsApp },
  communications: { id: "communications", icon: MessageSquare, component: CommunicationsApp },
  messagerie: { id: "messagerie", icon: Mail, component: MessagerieApp },
  ophis: { id: "ophis", icon: Skull, component: OphisApp },
};

const DEFAULT_LABELS: Record<AppId, string> = {
  profil: "Profil",
  notifications: "Notifications",
  rapports: "Rapports",
  carte: "Carte",
  missions: "Missions",
  personnel: "Personnel",
  equipes: "Équipes",
  documents: "Documents",
  communications: "Communications",
  messagerie: "Messagerie",
  ophis: "OPHIS",
};

/**
 * Vocabulaire par faction — même moteur, même 9 apps partout (pas d'app
 * ajoutée/retirée), seul le libellé change pour coller à l'identité de
 * chaque faction. S'appuie sur les mêmes flavor déjà établis ailleurs
 * (lib/faction-theme.ts::reportLabels, ops boards de l'Intranet) plutôt que
 * d'inventer un nouveau vocabulaire isolé.
 */
const FACTION_LABEL_OVERRIDES: Partial<Record<string, Partial<Record<AppId, string>>>> = {
  fondation: {
    documents: "Archives",
  },
  police: {
    rapports: "Main courante",
    documents: "Dossiers",
    missions: "Patrouilles",
    personnel: "Effectifs",
    equipes: "Unités",
    communications: "Dispatch",
  },
  aegis: {
    rapports: "Signalements",
    documents: "Dossiers",
    missions: "Mandats",
    equipes: "Unités",
    communications: "Réseau AEGIS",
    messagerie: "Correspondance",
  },
  gouvernement: {
    rapports: "Signalements",
    documents: "Décrets",
    missions: "Dossiers admin.",
    personnel: "Services",
    equipes: "Départements",
    communications: "Communiqués",
    messagerie: "Courrier",
  },
  crime: {
    documents: "Informations",
    missions: "Opérations",
    personnel: "Contacts",
    equipes: "Réseau",
    communications: "Canal",
    messagerie: "Messages",
  },
  chaos: {
    rapports: "Rapports d'opération",
    documents: "Archives",
    missions: "Opérations",
    personnel: "Membres",
    equipes: "Cellules",
    communications: "Transmissions",
    messagerie: "Contact",
  },
  "main-serpent": {
    rapports: "Présages",
    documents: "Archives",
    personnel: "Membres",
    equipes: "Cercles",
    communications: "Signal libre",
    messagerie: "Missives",
  },
  goc: {
    rapports: "Rapports d'anomalie",
    documents: "Dossiers",
    missions: "Opérations",
    equipes: "Unités",
    communications: "GOC Network",
    messagerie: "Correspondance",
  },
  civil: {
    rapports: "Signalements",
    documents: "Services",
    missions: "Emploi",
    personnel: "Annuaire",
  },
};

export function getCoreApps(factionSlug: string): CoreAppDef[] {
  const overrides = FACTION_LABEL_OVERRIDES[factionSlug] ?? {};
  return (Object.keys(BASE_APPS) as AppId[]).map((id) => ({
    ...BASE_APPS[id],
    label: overrides[id] ?? DEFAULT_LABELS[id],
  }));
}
