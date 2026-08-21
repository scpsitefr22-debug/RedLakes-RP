/**
 * Rangement hiérarchique : chaque séparateur ╰┈➤ / ━━━ puis ses grades en dessous.
 */
import type { Guild, Role } from "discord.js";
import { DISCORD_GRADE_SECTIONS } from "./discord-role-catalog.js";
import { getRoleRegistry } from "./discord-role-registry.js";
import { normalizeRoleLabel } from "./rp-catalog.js";
import {
  collectProtectedRoles,
  findRpBlockCeiling,
  isProtectedFromOrganize,
  restoreRolePositions,
  snapshotRolePositions,
} from "./role-protected.js";
import {
  BRANCH_COLORS,
  getBranchColor,
  isLayoutSeparatorName,
  type BranchId,
} from "./role-layout.js";
import { sanitizeDiscordRoleName } from "./role-sanitize.js";
import type { ParsedRoleEntry } from "./role-list-parser.js";
import type { OrganizeResult } from "./organize-rp-roles.js";

const SKIP_ROLE_NAMES = /^nouveau r[oô]le$/i;
const GRADE_MATCH_MIN = 58;

interface SubGroupDef {
  sepKeys: string[];
  roleKeys: string[];
}

/** Sous-catégories civil (séparateurs ╰┈➤ custom sur le serveur). */
const CIVIL_SUB_GROUPS: SubGroupDef[] = [
  {
    sepKeys: ["citoyen", "citoyens"],
    roleKeys: ["citoyen", "arrivant", "etudiant", "stagiaire"],
  },
  {
    sepKeys: ["urgence", "santé", "sante", "hopital", "hôpital"],
    roleKeys: [
      "hopital",
      "hôpital",
      "urgentiste",
      "infirmier",
      "paramedic",
      "emt",
    ],
  },
  {
    sepKeys: ["commerce", "media", "médias", "medias"],
    roleKeys: [
      "proprietaire",
      "propriétaire",
      "patron",
      "commerce",
      "bar",
      "journaliste",
      "redacteur",
      "rédacteur",
      "médias",
    ],
  },
  {
    sepKeys: ["services", "publics", "transit"],
    roleKeys: ["chauffeur", "transit", "technicien", "ouvrier"],
  },
];

function branchForSeparator(separator: string): BranchId {
  const s = sanitizeDiscordRoleName(separator).toLowerCase();
  if (s.includes("omega")) return "omega";
  if (s.includes("direction")) return "direction";
  if (s.includes("securite") || s.includes("sécurité")) return "securite";
  if (s.includes("scientifique")) return "scientifique";
  if (s.includes("maintenance")) return "maintenance";
  if (s.includes("generale") || s.includes("générale") || s.includes("general"))
    return "general";
  if (s.includes("detenu") || s.includes("détenu")) return "classes";
  if (s.includes("aegis")) return "general";
  if (s.includes("chaos") || s.includes("insurrection")) return "general";
  if (s.includes("serpent") || s.includes("goc") || s.includes("coalition"))
    return "general";
  if (s.includes("civil") || s.includes("ville") || s.includes("citoyen"))
    return "general";
  if (s.includes("gouvernement") || s.includes("municipal")) return "general";
  if (s.includes("police")) return "general";
  if (s.includes("crime") || s.includes("organise") || s.includes("organisé"))
    return "general";
  return "general";
}

function cleanLabel(name: string): string {
  return sanitizeDiscordRoleName(name)
    .replace(/[【】〖〗╰┈➤━─═—|┃│]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function separatorKeywords(catalogSeparator: string): string[] {
  const s = cleanLabel(catalogSeparator).toLowerCase();
  const keys = new Set<string>();

  const add = (...parts: string[]) => {
    for (const p of parts) if (p) keys.add(p);
  };

  if (s.includes("omega") || s.includes("conseil")) add("omega", "conseil");
  if (s.includes("direction") || s.includes("site")) add("direction", "site");
  if (s.includes("securite") || s.includes("sécurité"))
    add("securite", "sécurité", "secur", "branche sécurité");
  if (s.includes("scientifique") || s.includes("science"))
    add("scientifique", "science", "scp", "branche scientifique");
  if (s.includes("maintenance") || s.includes("maint"))
    add("maintenance", "maint", "branche maintenance");
  if (s.includes("generale") || s.includes("générale") || s.includes("general"))
    add("generale", "générale", "general", "branche générale");
  if (s.includes("honorifique") || s.includes("titre"))
    add("honorifique", "titre", "elite");
  if (s.includes("detenu") || s.includes("détenu") || s.includes("personnel"))
    add("detenu", "détenu", "class");
  if (s.includes("aegis") || s.includes("a.e.g.i.s")) add("aegis");
  if (s.includes("chaos") || s.includes("insurrection"))
    add("chaos", "insurrection");
  if (s.includes("serpent")) add("serpent");
  if (s.includes("goc") || s.includes("coalition") || s.includes("occult"))
    add("goc", "coalition", "occult");
  if (s.includes("civil") || s.includes("ville") || s.includes("citoyen"))
    add("civil", "ville", "citoyen", "citoyens", "redlakes");
  if (s.includes("gouvernement") || s.includes("municipal"))
    add("gouvernement", "municipal", "maire");
  if (s.includes("police") || s.includes("rlpd")) add("police", "rlpd");
  if (s.includes("crime") || s.includes("organise") || s.includes("organisé"))
    add("crime", "organise", "organisé", "gang");

  for (const word of s.split(/\s+/)) {
    if (word.length >= 4) keys.add(word);
  }

  return [...keys];
}

function scoreSeparatorMatch(serverName: string, catalogSeparator: string): number {
  const server = cleanLabel(serverName).toLowerCase();
  const catalog = cleanLabel(catalogSeparator).toLowerCase();
  if (server === catalog) return 100;
  if (server.includes(catalog) || catalog.includes(server)) return 95;

  const keys = separatorKeywords(catalogSeparator);
  if (!keys.length) return 0;
  let hits = 0;
  for (const k of keys) {
    if (server.includes(k)) hits += 1;
  }
  return hits >= 2 ? 70 + hits : hits === 1 ? 50 : 0;
}

function findServerSeparator(
  guild: Guild,
  catalogSeparator: string,
  used: Set<string>,
): Role | undefined {
  const exact = guild.roles.cache.find(
    (r) => r.name === catalogSeparator && !used.has(r.id),
  );
  if (exact) return exact;

  const normCatalog = normalizeRoleLabel(cleanLabel(catalogSeparator));
  let best: { role: Role; score: number } | undefined;

  for (const role of guild.roles.cache.values()) {
    if (used.has(role.id) || isProtectedFromOrganize(role, guild)) continue;
    if (!isLayoutSeparatorName(role.name)) continue;

    const norm = normalizeRoleLabel(cleanLabel(role.name));
    let score = 0;
    if (norm === normCatalog) score = 100;
    else score = scoreSeparatorMatch(role.name, catalogSeparator);

    if (!best || score > best.score) best = { role, score };
  }

  return best && best.score >= 50 ? best.role : undefined;
}

function findSeparatorByKeys(
  guild: Guild,
  keys: string[],
  used: Set<string>,
): Role | undefined {
  let best: { role: Role; score: number } | undefined;

  for (const role of guild.roles.cache.values()) {
    if (used.has(role.id) || isProtectedFromOrganize(role, guild)) continue;
    if (!isLayoutSeparatorName(role.name)) continue;

    const server = cleanLabel(role.name).toLowerCase();
    let hits = 0;
    for (const k of keys) {
      if (server.includes(k)) hits += 1;
    }
    const score = hits >= 2 ? 80 + hits : hits === 1 ? 55 : 0;
    if (!best || score > best.score) best = { role, score };
  }

  return best && best.score >= 55 ? best.role : undefined;
}

function isCivilSection(separator: string): boolean {
  const s = cleanLabel(separator).toLowerCase();
  return s.includes("civil") || s.includes("ville") || s.includes("redlakes");
}

function findCivilSubSeparators(
  guild: Guild,
  used: Set<string>,
): { sep: Role; roleKeys: string[] }[] {
  const found: { sep: Role; roleKeys: string[] }[] = [];
  const probeUsed = new Set(used);
  for (const group of CIVIL_SUB_GROUPS) {
    const sep = findSeparatorByKeys(guild, group.sepKeys, probeUsed);
    if (!sep) continue;
    found.push({ sep, roleKeys: group.roleKeys });
    probeUsed.add(sep.id);
  }
  if (found.length < 2) return [];
  for (const { sep } of found) used.add(sep.id);
  return found;
}

async function polishSeparator(sep: Role): Promise<void> {
  await sep
    .edit({
      color: BRANCH_COLORS.separator,
      hoist: true,
      mentionable: false,
    })
    .catch(() => undefined);
}

/** Crée une catégorie ╰┈➤ manquante (rapide — peu de rate limit). */
async function ensureSeparatorRole(
  guild: Guild,
  name: string,
): Promise<Role | null> {
  const displayName = sanitizeDiscordRoleName(name).slice(0, 100);
  if (!displayName) return null;

  const exact = guild.roles.cache.find((r) => r.name === displayName);
  if (exact) return exact;

  try {
    const role = await guild.roles.create({
      name: displayName,
      color: BRANCH_COLORS.separator,
      hoist: true,
      mentionable: false,
      permissions: 0n,
      reason: "Catégorie RP REDLAKES — /roles-organize",
    });
    console.log(`[roles] Catégorie créée : ${displayName}`);
    return role;
  } catch (err) {
    console.warn(`[roles] Catégorie non créée "${displayName}" :`, err);
    return null;
  }
}

async function resolveSeparatorRole(
  guild: Guild,
  name: string,
  used: Set<string>,
  newSeparators: string[],
): Promise<Role | null> {
  const existing = findServerSeparator(guild, name, used);
  if (existing) return existing;

  const created = await ensureSeparatorRole(guild, name);
  if (!created) return null;

  newSeparators.push(created.name);
  await guild.roles.fetch().catch(() => undefined);
  return created;
}

function catalogRoleMatchesKeys(catalogRole: string, keys: string[]): boolean {
  const norm = cleanLabel(catalogRole).toLowerCase();
  return keys.some((k) => norm.includes(k));
}

function serverNameVariants(serverName: string): string[] {
  const clean = cleanLabel(serverName);
  const parts = clean.split(/\s*\+\s*/).map((p) => normalizeRoleLabel(p.trim()));
  return [normalizeRoleLabel(clean), ...parts.filter(Boolean)];
}

function significantTokens(label: string): string[] {
  return cleanLabel(label)
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9àâäéèêëïîôùûüç]/gi, ""))
    .filter((w) => w.length >= 4);
}

function scoreGradeMatchSingle(serverNorm: string, catalogLabel: string): number {
  const catalog = normalizeRoleLabel(cleanLabel(catalogLabel));
  if (serverNorm === catalog) return 100;
  if (serverNorm.includes(catalog)) return 92;
  if (catalog.includes(serverNorm) && serverNorm.length >= 6) return 88;

  const tokens = significantTokens(catalogLabel);
  if (tokens.length) {
    const hit = tokens.filter((t) => serverNorm.includes(t)).length;
    const ratio = hit / tokens.length;
    if (ratio >= 0.75) return 80 + Math.floor(ratio * 10);
    if (hit >= 2) return 72;
    if (hit >= 1 && tokens[0] && serverNorm.includes(tokens[0])) return 62;
  }

  return 0;
}

function scoreGradeMatch(serverName: string, catalogLabel: string): number {
  let best = 0;
  for (const variant of serverNameVariants(serverName)) {
    best = Math.max(best, scoreGradeMatchSingle(variant, catalogLabel));
  }
  return best;
}

function findServerGradeRole(
  guild: Guild,
  catalogLabel: string,
  used: Set<string>,
): Role | undefined {
  const exact = guild.roles.cache.find(
    (r) => r.name === catalogLabel && !used.has(r.id),
  );
  if (exact) return exact;

  const registry = getRoleRegistry();
  const norm = normalizeRoleLabel(cleanLabel(catalogLabel));
  const regId = registry.gradeToRoleId.get(norm);
  if (regId && !used.has(regId)) {
    const role = guild.roles.cache.get(regId);
    if (role) return role;
  }

  let best: { role: Role; score: number } | undefined;

  for (const role of guild.roles.cache.values()) {
    if (used.has(role.id)) continue;
    if (isProtectedFromOrganize(role, guild) || isLayoutSeparatorName(role.name))
      continue;
    if (SKIP_ROLE_NAMES.test(role.name)) continue;

    const score = scoreGradeMatch(role.name, catalogLabel);
    if (!best || score > best.score) best = { role, score };
  }

  return best && best.score >= GRADE_MATCH_MIN ? best.role : undefined;
}

async function polishGrade(
  role: Role,
  branch: BranchId,
): Promise<boolean> {
  const color = getBranchColor(branch);
  if (role.color !== 0 && role.color !== 0x99aab5) return false;
  await role.edit({ color }).catch(() => undefined);
  return true;
}

async function applyPositions(
  guild: Guild,
  orderedIds: string[],
  protectedSnapshot: Map<string, number>,
): Promise<void> {
  const ceiling = findRpBlockCeiling(guild);
  let pos = ceiling;
  const rolePositions = orderedIds.map((id) => {
    const item = { role: id, position: pos };
    pos = Math.max(pos - 1, 1);
    return item;
  });

  try {
    await guild.roles.setPositions(rolePositions);
  } catch (err) {
    console.warn("[roles] setPositions batch échoué, un par un…", err);
    for (const item of rolePositions) {
      const role = guild.roles.cache.get(item.role);
      if (!role) continue;
      await role
        .setPosition(item.position, { reason: "Rangement catalogue REDLAKES" })
        .catch(() => undefined);
    }
  }

  await restoreRolePositions(guild, protectedSnapshot);
}

function scoreOrphanUnderSeparator(roleName: string, sepName: string): number {
  const role = cleanLabel(roleName).toLowerCase();
  const sep = cleanLabel(sepName).toLowerCase();
  const sepKeys = sep
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9àâäéèêëïîôùûüç]/gi, ""))
    .filter((w) => w.length >= 4);

  let hits = 0;
  for (const k of sepKeys) {
    if (role.includes(k)) hits += 1;
  }

  for (const group of CIVIL_SUB_GROUPS) {
    if (!group.sepKeys.some((k) => sep.includes(k))) continue;
    if (group.roleKeys.some((k) => role.includes(k))) return 85;
  }

  return hits >= 2 ? 75 : hits === 1 ? 55 : 0;
}

export interface OrganizeFromListResult extends OrganizeResult {
  notFound: string[];
}

/**
 * Range selon TA liste collée — ordre exact, ligne par ligne.
 * Format : ╰┈➤ 🔫 Branche Sécurité puis ⚔️ Commandant, etc.
 */
export async function organizeRolesFromUserList(
  guild: Guild,
  entries: ParsedRoleEntry[],
): Promise<OrganizeFromListResult> {
  if (!guild.members.me?.permissions.has("ManageRoles")) {
    return {
      positioned: 0,
      separatorsCreated: 0,
      newSeparators: [],
      colorsUpdated: 0,
      notFound: [],
    };
  }

  await guild.roles.fetch();

  const protectedRoles = collectProtectedRoles(guild);
  const protectedSnapshot = snapshotRolePositions(protectedRoles);
  const protectedIds = new Set(protectedRoles.map((r) => r.id));
  const usedIds = new Set<string>(protectedIds);
  const orderedIds: string[] = [];
  const notFound: string[] = [];
  const newSeparators: string[] = [];
  let colorsUpdated = 0;
  let separatorsMatched = 0;

  for (const entry of entries) {
    if (entry.kind === "separator") {
      const sep = await resolveSeparatorRole(
        guild,
        entry.name,
        usedIds,
        newSeparators,
      );
      if (!sep) {
        notFound.push(entry.name);
        continue;
      }
      orderedIds.push(sep.id);
      usedIds.add(sep.id);
      separatorsMatched += 1;
      await polishSeparator(sep);
      continue;
    }

    const role = findServerGradeRole(guild, entry.name, usedIds);
    if (!role) {
      notFound.push(entry.name);
      continue;
    }
    orderedIds.push(role.id);
    usedIds.add(role.id);
    const branch = entry.branch ?? "general";
    if (await polishGrade(role, branch)) colorsUpdated += 1;
  }

  const movableIds = orderedIds.filter((id) => !protectedIds.has(id));
  if (!movableIds.length) {
    return {
      positioned: 0,
      separatorsCreated: separatorsMatched,
      newSeparators,
      colorsUpdated,
      notFound,
    };
  }

  await applyPositions(guild, movableIds, protectedSnapshot);

  console.log(
    `[roles] Liste utilisateur rangée : ${movableIds.length} rôles, ${newSeparators.length} catégorie(s) créée(s), ${notFound.length} introuvable(s)`,
  );

  return {
    positioned: movableIds.length,
    separatorsCreated: separatorsMatched,
    newSeparators,
    colorsUpdated,
    notFound,
  };
}

/**
 * Range séparateurs + grades dans l'ordre du catalogue.
 * Chaque ╰┈➤ / ━━━ est suivi immédiatement de ses rôles.
 */
export async function organizeRolesByCatalog(
  guild: Guild,
): Promise<OrganizeResult> {
  if (!guild.members.me?.permissions.has("ManageRoles")) {
    return { positioned: 0, separatorsCreated: 0, newSeparators: [], colorsUpdated: 0 };
  }

  await guild.roles.fetch();

  const protectedRoles = collectProtectedRoles(guild);
  const protectedSnapshot = snapshotRolePositions(protectedRoles);
  const protectedIds = new Set(protectedRoles.map((r) => r.id));

  const usedIds = new Set<string>(protectedIds);
  const orderedIds: string[] = [];
  const newSeparators: string[] = [];
  const colorsUpdated = { n: 0 };
  let separatorsMatched = 0;

  for (const section of DISCORD_GRADE_SECTIONS) {
    const branch = branchForSeparator(section.separator);

    if (isCivilSection(section.separator)) {
      const subGroups = findCivilSubSeparators(guild, usedIds);
      if (subGroups.length >= 2) {
        const placed = new Set<string>();

        for (const { sep, roleKeys } of subGroups) {
          orderedIds.push(sep.id);
          separatorsMatched += 1;
          await polishSeparator(sep);

          for (const catalogRole of section.roles) {
            if (!catalogRoleMatchesKeys(catalogRole, roleKeys)) continue;
            const role = findServerGradeRole(guild, catalogRole, usedIds);
            if (!role) continue;
            orderedIds.push(role.id);
            usedIds.add(role.id);
            placed.add(catalogRole);
            if (await polishGrade(role, branch)) colorsUpdated.n += 1;
          }
        }

        for (const catalogRole of section.roles) {
          if (placed.has(catalogRole)) continue;
          const role = findServerGradeRole(guild, catalogRole, usedIds);
          if (!role) continue;
          orderedIds.push(role.id);
          usedIds.add(role.id);
          if (await polishGrade(role, branch)) colorsUpdated.n += 1;
        }
        continue;
      }
    }

    const sep = await resolveSeparatorRole(
      guild,
      section.separator,
      usedIds,
      newSeparators,
    );
    if (sep) {
      orderedIds.push(sep.id);
      usedIds.add(sep.id);
      separatorsMatched += 1;
      await polishSeparator(sep);
    }

    for (const catalogRole of section.roles) {
      const role = findServerGradeRole(guild, catalogRole, usedIds);
      if (!role) continue;
      orderedIds.push(role.id);
      usedIds.add(role.id);
      if (await polishGrade(role, branch)) colorsUpdated.n += 1;
    }
  }

  const extraSeps = [...guild.roles.cache.values()]
    .filter(
      (r) =>
        !usedIds.has(r.id) &&
        !isProtectedFromOrganize(r, guild) &&
        isLayoutSeparatorName(r.name),
    )
    .sort((a, b) => b.position - a.position);

  let orphans = [...guild.roles.cache.values()]
    .filter(
      (r) =>
        !usedIds.has(r.id) &&
        !isProtectedFromOrganize(r, guild) &&
        !isLayoutSeparatorName(r.name) &&
        !SKIP_ROLE_NAMES.test(r.name),
    )
    .sort((a, b) => b.position - a.position);

  for (const sep of extraSeps) {
    orderedIds.push(sep.id);
    usedIds.add(sep.id);

    const matched: Role[] = [];
    const rest: Role[] = [];
    for (const role of orphans) {
      const score = scoreOrphanUnderSeparator(role.name, sep.name);
      if (score >= 55) matched.push(role);
      else rest.push(role);
    }

    for (const role of matched) {
      orderedIds.push(role.id);
      usedIds.add(role.id);
    }
    orphans = rest;
  }

  for (const role of orphans) {
    orderedIds.push(role.id);
    usedIds.add(role.id);
  }

  const movableIds = orderedIds.filter((id) => !protectedIds.has(id));

  if (!movableIds.length) {
    return {
      positioned: 0,
      separatorsCreated: separatorsMatched,
      newSeparators,
      colorsUpdated: 0,
    };
  }

  await applyPositions(guild, movableIds, protectedSnapshot);

  console.log(
    `[roles] Catalogue rangé : ${movableIds.length} rôles RP, ${separatorsMatched} séparateurs (${newSeparators.length} créés, ${protectedRoles.length} protégés)`,
  );

  return {
    positioned: movableIds.length,
    separatorsCreated: separatorsMatched,
    newSeparators,
    colorsUpdated: colorsUpdated.n,
  };
}
