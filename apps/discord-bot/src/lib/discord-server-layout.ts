/**
 * Mise en page officielle du serveur Discord REDLAKES — comme les screenshots.
 * Séparateurs ╰┈➤ Branche + grades juste en dessous.
 */
import { DISCORD_GRADE_SECTIONS, FACTION_MEMBER_PING_ROLES } from "./discord-role-catalog.js";
import type { BranchId } from "./role-layout.js";
import type { ParsedRoleEntry } from "./role-list-parser.js";

/** Grades exclus du layout Discord (précision Minecraft / site) */
const EXCLUDED_DISCORD_GRADES = [/secretaire adj/i, /secrétaire adj/i];

function isExcludedDiscordGrade(name: string): boolean {
  return EXCLUDED_DISCORD_GRADES.some((re) => re.test(name));
}

const CIVIL_LAYOUT: { separator: string; match: (role: string) => boolean }[] = [
  {
    separator: "╰┈➤ 👤 Citoyens",
    match: (r) =>
      /citoyen|arrivant|étudiant|etudiant|stagiaire/i.test(r),
  },
  {
    separator: "╰┈➤ 🏬 Commerce & Médias",
    match: (r) =>
      /propriétaire|proprietaire|patron|commerce|bar|loisirs|journaliste|rédacteur|redacteur|médias|medias/i.test(
        r,
      ),
  },
  {
    separator: "╰┈➤ 🏥 Urgences & Santé",
    match: (r) =>
      /hôpital|hopital|urgentiste|infirmier|paramedic|emt|médecin urgentiste/i.test(
        r,
      ),
  },
  {
    separator: "╰┈➤ 🚌 Services publics",
    match: (r) =>
      /chauffeur|transit|technicien municipal|ouvrier municipal/i.test(r),
  },
];

function branchForSeparator(separator: string): BranchId {
  if (separator.includes("OMEGA") || separator.includes("Conseil")) return "omega";
  if (separator.includes("DIRECTION") || separator.includes("Site")) return "direction";
  if (separator.includes("Sécurité") || separator.includes("Securite") || separator.includes("MTF"))
    return "securite";
  if (separator.includes("Scientifique")) return "scientifique";
  if (separator.includes("Maintenance")) return "maintenance";
  if (separator.includes("Générale") || separator.includes("Generale")) return "general";
  if (separator.includes("HONORIFIQUES") || separator.includes("TITRES")) return "general";
  if (separator.includes("DÉTENU") || separator.includes("DETENU") || separator.includes("Class"))
    return "classes";
  if (separator.includes("A.E.G.I.S") || separator.includes("AEGIS")) return "general";
  if (separator.includes("Chaos") || separator.includes("Serpent") || separator.includes("GOC"))
    return "general";
  if (separator.includes("GOUVERNEMENT") || separator.includes("Municipal")) return "general";
  if (separator.includes("Police")) return "general";
  if (separator.includes("CRIME") || separator.includes("Gang") || separator.includes("Mafia"))
    return "general";
  if (
    separator.includes("Citoyen") ||
    separator.includes("Commerce") ||
    separator.includes("Urgence") ||
    separator.includes("Services")
  )
    return "general";
  return "general";
}

function pushSection(
  entries: ParsedRoleEntry[],
  separator: string,
  roles: string[],
): void {
  const branch = branchForSeparator(separator);
  entries.push({ kind: "separator", name: separator, branch });
  for (const role of roles) {
    entries.push({ kind: "grade", name: role, branch });
  }
}

function pushCivilSections(entries: ParsedRoleEntry[], roles: readonly string[]): void {
  const placed = new Set<string>();

  for (const group of CIVIL_LAYOUT) {
    const matched = roles.filter((r) => group.match(r));
    if (!matched.length) continue;
    pushSection(entries, group.separator, matched);
    for (const r of matched) placed.add(r);
  }

  const rest = roles.filter((r) => !placed.has(r));
  if (rest.length) {
    pushSection(entries, "╰┈➤ 👤 Citoyens", rest);
  }
}

/**
 * Layout complet Site-12 — ordre des screenshots / DISCORD-GRADES-COMPLET.md
 * avec sous-catégories civil en ╰┈➤ et Police en ╰┈➤ 🚓 Police.
 */
export function getServerRoleLayoutEntries(): ParsedRoleEntry[] {
  const entries: ParsedRoleEntry[] = [];

  for (const section of DISCORD_GRADE_SECTIONS) {
    const sep = section.separator;

    if (sep.includes("CIVIL") || sep.includes("VILLE") || sep.includes("REDLAKES, USA")) {
      pushCivilSections(entries, section.roles);
      continue;
    }

    if (sep.includes("POLICE") || sep.includes("RLPD")) {
      pushSection(entries, "╰┈➤ 🚓 Police", [...section.roles]);
      continue;
    }

    pushSection(entries, sep, [...section.roles]);
  }

  const filtered = entries.filter(
    (e) => e.kind === "separator" || !isExcludedDiscordGrade(e.name),
  );

  for (const ping of FACTION_MEMBER_PING_ROLES) {
    filtered.push({
      kind: "grade",
      name: ping.displayName,
      branch: ping.branch,
    });
  }

  return filtered;
}

/** Texte brut pour collage / debug */
export function getServerRoleLayoutText(): string {
  return getServerRoleLayoutEntries()
    .map((e) => e.name)
    .join("\n");
}
