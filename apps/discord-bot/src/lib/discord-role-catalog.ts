/**
 * Catalogue Discord REDLAKES — noms affichés (emojis), catégories, factions.
 * Aligné sur docs/DISCORD-ROLES-MANUEL.md
 */
import { normalizeRoleLabel } from "./rp-catalog.js";
import { sanitizeDiscordRoleName } from "./role-sanitize.js";
import type { BranchId, LayoutEntry } from "./role-layout.js";
import type { ParsedRoleEntry } from "./role-list-parser.js";
import {
  DISCORD_FOUNDATION_GRADES,
  DISCORD_GRADE_SECTIONS,
  DISCORD_MEMBER_PING_ROLES_GENERATED,
  GRADE_DISPLAY_NAMES as GENERATED_DISPLAY_NAMES,
} from "./discord-master-catalog.generated.js";

export {
  DISCORD_FOUNDATION_GRADES,
  DISCORD_GRADE_SECTIONS,
  DISCORD_MEMBER_PING_ROLES_GENERATED,
};

/** Séparateurs / catégories (ordre haut → bas) */
export const DISCORD_ROLE_CATEGORIES = [
  "━━━ 👑 CONSEIL OMEGA ━━━",
  "━━━ 🏛️ DIRECTION SITE-12 ━━━",
  "╰┈➤ 🔫 Branche Sécurité",
  "╰┈➤ 🔬 Branche Scientifique",
  "╰┈➤ 🔧 Branche Maintenance",
  "╰┈➤ 📋 Branche Générale",
  "━━━ 🏅 TITRES HONORIFIQUES ━━━",
  "━━━ ⛓️ PERSONNEL DÉTENU ━━━",
  "━━━ 🛡️ A.E.G.I.S. ━━━",
  "━━━ ☠️ FACTIONS HOSTILES ━━━",
  "╰┈➤ 💚 Insurrection du Chaos",
  "╰┈➤ 🐍 Main du Serpent",
  "╰┈➤ 🌐 Global Occult Coalition",
  "━━━ 🏙️ CIVIL & VILLE (REDLAKES, USA) ━━━",
  "━━━ 🏛️ GOUVERNEMENT MUNICIPAL ━━━",
  "━━━ 🚔 REDLAKES POLICE DEPARTMENT ━━━",
  "━━━ 🌃 CRIME ORGANISÉ (GLOBAL) ━━━",
] as const;

/** Rôles « Membre de… » — mentionnables pour @toute la faction */
export interface MemberPingRoleDef {
  id: string;
  displayName: string;
  branch: BranchId;
}

export const FACTION_MEMBER_PING_ROLES: readonly MemberPingRoleDef[] =
  DISCORD_MEMBER_PING_ROLES_GENERATED.map((displayName, i) => ({
    id: `ping-${i}`,
    displayName,
    branch: "general" as BranchId,
  }));

/** Nom du rôle ping pour une org illégale (legacy — orgs globales désormais) */
export function buildOrgMemberPingName(orgName: string): string {
  const clean = orgName.trim().slice(0, 70);
  return `👥 Membre · ${clean}`.slice(0, 100);
}

/** Titres honorifiques (cumulables, pas des grades) */
export const HONORARY_TITLES = [
  { displayName: "🏅 Elite", matchKey: "elite" },
  { displayName: "⭐ Prestige", matchKey: "prestige" },
] as const;

export type FactionGroupId =
  | "aegis"
  | "chaos"
  | "serpent"
  | "goc"
  | "civil"
  | "gouvernement"
  | "police"
  | "illegal";

export interface FactionRoleDef {
  displayName: string;
  branch: BranchId;
}

export interface FactionGroupDef {
  id: FactionGroupId;
  label: string;
  roles: FactionRoleDef[];
}

export const FACTION_GROUPS: FactionGroupDef[] = [
  {
    id: "aegis",
    label: "A.E.G.I.S.",
    roles: [
      { displayName: "🛡️ Président du Directoire", branch: "general" },
      { displayName: "⚖️ Membre du Directoire", branch: "general" },
      { displayName: "🔍 Inspecteur principal", branch: "general" },
      { displayName: "📋 Inspecteur adjoint", branch: "general" },
      { displayName: "📊 Analyste AEGIS", branch: "general" },
      { displayName: "⚔️ Commandant de cellule", branch: "general" },
      { displayName: "👤 Agent d'application", branch: "general" },
    ],
  },
  {
    id: "chaos",
    label: "Insurrection du Chaos",
    roles: [
      { displayName: "💚 Commandant de secteur", branch: "general" },
      { displayName: "⚔️ Officier du Chaos", branch: "general" },
      { displayName: "🔴 Chef de cellule", branch: "general" },
      { displayName: "🪖 Vétéran du Chaos", branch: "general" },
      { displayName: "👤 Soldat Chaos", branch: "general" },
      { displayName: "〚🔍〛 Recrue Chaos", branch: "general" },
    ],
  },
  {
    id: "serpent",
    label: "Main du Serpent",
    roles: [
      { displayName: "🐍 Grand Maître", branch: "general" },
      { displayName: "🔮 Archimage", branch: "general" },
      { displayName: "📿 Initié", branch: "general" },
      { displayName: "🕯️ Acolyte", branch: "general" },
    ],
  },
  {
    id: "goc",
    label: "Global Occult Coalition",
    roles: [
      { displayName: "🌐 Directeur régional", branch: "general" },
      { displayName: "🤝 Officier de liaison", branch: "general" },
      { displayName: "⚔️ Commandant d'unité", branch: "general" },
      { displayName: "🪖 Soldat GOC", branch: "general" },
      { displayName: "☣️ Technicien PSYCHE", branch: "general" },
    ],
  },
  {
    id: "civil",
    label: "Civil & Ville",
    roles: [
      { displayName: "🧑 Citoyen REDLAKES", branch: "general" },
      { displayName: "🆕 Nouvel arrivant", branch: "general" },
      { displayName: "🎓 Étudiant / Stagiaire", branch: "general" },
      { displayName: "🏪 Propriétaire / Patron", branch: "general" },
      { displayName: "🍺 Employé bar & loisirs", branch: "general" },
      { displayName: "🛒 Employé commerce", branch: "general" },
      { displayName: "📰 Journaliste", branch: "general" },
      { displayName: "📺 Rédacteur / Médias", branch: "general" },
      { displayName: "🏥 Directeur hôpital", branch: "general" },
      { displayName: "🩺 Médecin urgentiste", branch: "general" },
      { displayName: "👨‍⚕️ Infirmier", branch: "general" },
      { displayName: "🚑 Paramedic / EMT", branch: "general" },
      { displayName: "🚌 Chauffeur / Transit", branch: "general" },
      { displayName: "🔧 Technicien municipal", branch: "general" },
      { displayName: "🏗️ Ouvrier municipal", branch: "general" },
    ],
  },
  {
    id: "gouvernement",
    label: "Gouvernement municipal",
    roles: [
      { displayName: "🏛️ Maire de REDLAKES", branch: "general" },
      { displayName: "📋 City Manager", branch: "general" },
      { displayName: "💼 Conseiller municipal", branch: "general" },
      { displayName: "📎 Attaché administratif", branch: "general" },
      { displayName: "👤 Employé municipal", branch: "general" },
    ],
  },
  {
    id: "police",
    label: "REDLAKES Police Department",
    roles: [
      { displayName: "🚔 Chief of Police", branch: "general" },
      { displayName: "🎖️ Lieutenant", branch: "general" },
      { displayName: "👮 Police Officer", branch: "general" },
      { displayName: "🔰 Deputy", branch: "general" },
      { displayName: "🔍 Detective", branch: "general" },
      { displayName: "🕵️ Investigator", branch: "general" },
    ],
  },
  {
    id: "illegal",
    label: "Crime organisé (global)",
    roles: [
      { displayName: "💀 Gang Member", branch: "general" },
      { displayName: "🔫 Gang Boss", branch: "general" },
      { displayName: "🍝 Mafia Associate", branch: "general" },
      { displayName: "🎩 Mafia Don", branch: "general" },
      { displayName: "🏍️ MC Member", branch: "general" },
      { displayName: "🏍️ MC President", branch: "general" },
      { displayName: "💊 Cartel Runner", branch: "general" },
      { displayName: "💊 Cartel Boss", branch: "general" },
      { displayName: "🌃 Criminel indépendant", branch: "general" },
    ],
  },
];

/** Noms Discord avec emojis — genere depuis Excel (discord-master-catalog.generated.ts) */
const GRADE_DISPLAY_NAMES: Record<string, string> = GENERATED_DISPLAY_NAMES;

export function isHonoraryGradeLabel(label: string): boolean {
  const n = normalizeRoleLabel(label);
  return (
    (n.includes("elite") || n.includes("prestige")) &&
    !n.includes("garde")
  );
}

export interface FoundationGradeDef {
  layoutLabel: string;
  displayName: string;
  branch: BranchId;
}

export function getFoundationGrades(): FoundationGradeDef[] {
  return DISCORD_FOUNDATION_GRADES.map((g) => ({
    layoutLabel: g.excelName,
    displayName: g.displayName,
    branch: g.branch as BranchId,
  }));
}

export function getDiscordDisplayName(layoutLabel: string): string {
  return GRADE_DISPLAY_NAMES[layoutLabel] ?? layoutLabel;
}

export function roleNamesMatch(a: string, b: string): boolean {
  return normalizeRoleLabel(a) === normalizeRoleLabel(b);
}

export interface CatalogRoleHit {
  displayName: string;
  branch: BranchId;
  mentionable?: boolean;
}

/** Retrouve un rôle du catalogue à partir d'un libellé collé (avec ou sans emoji). */
export function lookupCatalogRole(name: string): CatalogRoleHit | null {
  const norm = normalizeRoleLabel(sanitizeDiscordRoleName(name));

  for (const section of DISCORD_GRADE_SECTIONS) {
    const branch = branchForSeparator(section.separator);
    for (const role of section.roles) {
      if (
        role === name ||
        roleNamesMatch(role, name) ||
        normalizeRoleLabel(sanitizeDiscordRoleName(role)) === norm
      ) {
        return { displayName: role, branch };
      }
    }
  }

  for (const t of HONORARY_TITLES) {
    if (roleNamesMatch(t.displayName, name)) {
      return { displayName: t.displayName, branch: "general" };
    }
  }

  for (const group of FACTION_GROUPS) {
    for (const r of group.roles) {
      if (roleNamesMatch(r.displayName, name)) {
        return { displayName: r.displayName, branch: r.branch };
      }
    }
  }

  for (const ping of FACTION_MEMBER_PING_ROLES) {
    if (roleNamesMatch(ping.displayName, name)) {
      return {
        displayName: ping.displayName,
        branch: ping.branch,
        mentionable: true,
      };
    }
  }

  for (const [excel, display] of Object.entries(GRADE_DISPLAY_NAMES)) {
    if (
      roleNamesMatch(display, name) ||
      roleNamesMatch(excel, name) ||
      normalizeRoleLabel(sanitizeDiscordRoleName(display)) === norm
    ) {
      const foundation = DISCORD_FOUNDATION_GRADES.find(
        (g) => g.displayName === display || g.excelName === excel,
      );
      const branch = (foundation?.branch ?? "general") as BranchId;
      return { displayName: display, branch };
    }
  }

  return null;
}

/** Séparateurs du catalogue généré (ordre Excel) */
export const CATALOG_SEPARATOR_NAMES = DISCORD_GRADE_SECTIONS.map(
  (s) => s.separator,
);

function branchForSeparator(separator: string): BranchId {
  if (separator.includes("OMEGA")) return "omega";
  if (separator.includes("DIRECTION")) return "direction";
  if (separator.includes("Sécurité") || separator.includes("Securite"))
    return "securite";
  if (separator.includes("Scientifique")) return "scientifique";
  if (separator.includes("Maintenance")) return "maintenance";
  if (separator.includes("Générale") || separator.includes("Generale"))
    return "general";
  if (separator.includes("HONORIFIQUES") || separator.includes("TITRES"))
    return "general";
  if (separator.includes("DÉTENU") || separator.includes("DETENU"))
    return "classes";
  return "general";
}

/** Layout hiérarchique aligné sur DISCORD-GRADES-COMPLET.md */
export function buildDiscordCatalogLayout(): LayoutEntry[] {
  const layout: LayoutEntry[] = [];
  for (const section of DISCORD_GRADE_SECTIONS) {
    const branch = branchForSeparator(section.separator);
    layout.push({ kind: "separator", name: section.separator, branch });
    for (const role of section.roles) {
      layout.push({ kind: "grade", label: role, branch });
    }
  }
  for (const ping of FACTION_MEMBER_PING_ROLES) {
    layout.push({
      kind: "grade",
      label: ping.displayName,
      branch: ping.branch,
    });
  }
  return layout;
}

/** Entrées pour l'organisation sous catégories existantes (catalogue complet). */
export function buildCatalogParsedEntries(): ParsedRoleEntry[] {
  return buildDiscordCatalogLayout().map((entry) => ({
    kind: entry.kind,
    name: entry.kind === "separator" ? entry.name : entry.label,
    branch: entry.branch,
  }));
}
