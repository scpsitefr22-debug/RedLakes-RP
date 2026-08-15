import type { Guild, Role } from "discord.js";
import { config } from "../config.js";
import { getRoleRegistry } from "./discord-role-registry.js";
import { getCanonicalGradeLabels, normalizeRoleLabel } from "./rp-catalog.js";
import { isStaffOrBaseRole } from "./rp-catalog.js";
import { findRpBlockCeiling, isProtectedFromOrganize } from "./role-protected.js";
import {
  BRANCH_COLORS,
  getBranchColor,
  getLayoutBranchForGrade,
  isLayoutSeparatorName,
  LAYOUT_SEPARATOR_NAMES,
  RP_ROLE_LAYOUT,
  type BranchId,
} from "./role-layout.js";
import { inferRpRoleStyle } from "./role-style.js";
import { isExistingBranchSeparator } from "./role-sanitize.js";
import {
  buildDiscordCatalogLayout,
  CATALOG_SEPARATOR_NAMES,
} from "./discord-role-catalog.js";
import { sanitizeDiscordRoleName } from "./role-sanitize.js";
import type { ParsedRoleEntry } from "./role-list-parser.js";

export interface OrganizeResult {
  positioned: number;
  separatorsCreated: number;
  /** Catégories ╰┈➤ créées à la volée (manquantes sur le serveur). */
  newSeparators: string[];
  colorsUpdated: number;
}

function canManageRoles(guild: Guild): boolean {
  return guild.members.me?.permissions.has("ManageRoles") ?? false;
}

/** Position de depart : juste sous les roles staff / joueur de base */
function findRpBlockStart(guild: Guild): number {
  return findRpBlockCeiling(guild);
}

function findSeparatorRole(guild: Guild, name: string): Role | undefined {
  const exact = guild.roles.cache.find((r) => r.name === name);
  if (exact) return exact;
  return guild.roles.cache.find(
    (r) => isLayoutSeparatorName(r.name) && normalizeRoleLabel(r.name) === normalizeRoleLabel(name),
  );
}

async function ensureSeparators(
  guild: Guild,
  options?: { useDiscordCategories?: boolean },
): Promise<Role[]> {
  const created: Role[] = [];
  const names = options?.useDiscordCategories
    ? [...CATALOG_SEPARATOR_NAMES]
    : LAYOUT_SEPARATOR_NAMES;

  for (const name of names) {
    let role = findSeparatorRole(guild, name);
    if (role) {
      await role
        .edit({
          color: BRANCH_COLORS.separator,
          hoist: true,
          mentionable: false,
          permissions: 0n,
        })
        .catch(() => undefined);
      created.push(role);
      continue;
    }

    try {
      role = await guild.roles.create({
        name: name.slice(0, 100),
        color: BRANCH_COLORS.separator,
        hoist: true,
        mentionable: false,
        permissions: 0n,
        reason: "Separateur hierarchie RP Site-12 REDLAKES",
      });
      created.push(role);
    } catch (err) {
      console.warn(`[roles] Separateur non cree "${name}" :`, err);
    }
  }

  return created;
}

function resolveGradeRoleId(guild: Guild, label: string): string | undefined {
  const exact = guild.roles.cache.find((r) => r.name === label);
  if (exact && !exact.managed && exact.id !== guild.id) return exact.id;

  const registry = getRoleRegistry();
  const norm = normalizeRoleLabel(sanitizeDiscordRoleName(label));
  if (registry.gradeToRoleId.has(norm)) {
    return registry.gradeToRoleId.get(norm);
  }
  const canonical = getCanonicalGradeLabels().get(norm) ?? label;
  const targetNorm = normalizeRoleLabel(sanitizeDiscordRoleName(canonical));
  for (const role of guild.roles.cache.values()) {
    if (role.managed || role.id === guild.id) continue;
    if (isProtectedFromOrganize(role, guild) || isLayoutSeparatorName(role.name)) continue;
    const roleNorm = normalizeRoleLabel(sanitizeDiscordRoleName(role.name));
    if (roleNorm === targetNorm || roleNorm === norm) {
      return role.id;
    }
  }
  return undefined;
}

async function polishGradeRole(role: Role, branch: ReturnType<typeof getLayoutBranchForGrade>): Promise<boolean> {
  const targetColor = getBranchColor(branch);
  const base = inferRpRoleStyle(role.guild);
  let changed = false;

  if (role.color === 0 || role.color === 0x99aab5) {
    await role.edit({ color: targetColor }).catch(() => undefined);
    changed = true;
  }

  if (role.hoist !== base.hoist) {
    await role.edit({ hoist: base.hoist }).catch(() => undefined);
  }

  return changed;
}

function hasExistingBranchStructure(guild: Guild): boolean {
  return [...guild.roles.cache.values()].some(
    (r) => isExistingBranchSeparator(r.name) && r.position > 80,
  );
}

/**
 * Range les roles RP. Si le serveur a deja une structure (Branche Sécurité, etc.),
 * on ne deplace pas tout — on nettoie seulement les doublons bot.
 */
export async function organizeGuildRpRoles(
  guild: Guild,
  options?: { force?: boolean },
): Promise<OrganizeResult> {
  const forced = options?.force === true;
  if ((!config.roles.autoOrganize && !forced) || !canManageRoles(guild)) {
    return { positioned: 0, separatorsCreated: 0, newSeparators: [], colorsUpdated: 0 };
  }

  await guild.roles.fetch();

  if (!options?.force && hasExistingBranchStructure(guild)) {
    console.log(
      "[roles] Structure existante detectee — conservation de la hierarchie serveur",
    );
    return { positioned: 0, separatorsCreated: 0, newSeparators: [], colorsUpdated: 0 };
  }

  const hasSeparators = [...guild.roles.cache.values()].some((r) =>
    isLayoutSeparatorName(r.name),
  );

  if (options?.force && hasSeparators) {
    const { buildCatalogParsedEntries } = await import("./discord-role-catalog.js");
    return organizeRolesUnderParsedList(guild, buildCatalogParsedEntries());
  }

  const useCatalog = options?.force === true;

  await ensureSeparators(guild, {
    useDiscordCategories: useCatalog,
  });

  const orderedIds: string[] = [];
  let colorsUpdated = 0;

  const layout = useCatalog ? buildDiscordCatalogLayout() : RP_ROLE_LAYOUT;

  for (const entry of layout) {
    if (entry.kind === "separator") {
      const sep = findSeparatorRole(guild, entry.name);
      if (sep) orderedIds.push(sep.id);
      continue;
    }

    const roleId = resolveGradeRoleId(guild, entry.label);
    if (!roleId) continue;
    orderedIds.push(roleId);

    const role = guild.roles.cache.get(roleId);
    if (role) {
      const changed = await polishGradeRole(role, entry.branch);
      if (changed) colorsUpdated += 1;
    }
  }

  // Roles RP hors layout (extras du catalogue) — a la fin
  const registry = getRoleRegistry();
  for (const id of registry.managedRoleIds) {
    if (!orderedIds.includes(id)) orderedIds.push(id);
  }

  if (!orderedIds.length) {
    return { positioned: 0, separatorsCreated: LAYOUT_SEPARATOR_NAMES.length, newSeparators: [], colorsUpdated };
  }

  let pos = findRpBlockStart(guild);
  const rolePositions = orderedIds.map((id) => {
    const current = { role: id, position: pos };
    pos = Math.max(pos - 1, 1);
    return current;
  });

  try {
    await guild.roles.setPositions(rolePositions);
  } catch (err) {
    console.warn("[roles] Reorganisation partielle (rate limit ?) :", err);
    for (const item of rolePositions) {
      const role = guild.roles.cache.get(item.role);
      if (!role) continue;
      await role.setPosition(item.position, { reason: "Hierarchie RP Site-12" }).catch(() => undefined);
    }
  }

  console.log(
    `[roles] Hierarchie rangee : ${orderedIds.length} roles (separateurs par departement)`,
  );

  return {
    positioned: orderedIds.length,
    separatorsCreated: LAYOUT_SEPARATOR_NAMES.length,
    newSeparators: [],
    colorsUpdated,
  };
}

function branchForSeparatorName(separator: string): BranchId {
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

function findSeparatorAnchorForBranch(
  guild: Guild,
  branch: BranchId,
): number | null {
  for (const sepName of CATALOG_SEPARATOR_NAMES) {
    if (branchForSeparatorName(sepName) !== branch) continue;
    const sep = findSeparatorRole(guild, sepName);
    if (sep) return sep.position;
  }
  return null;
}

/**
 * Range uniquement les grades sous les séparateurs déjà en place sur le serveur.
 * Utilise le catalogue complet : séparateur puis tous ses grades, dans l'ordre.
 */
export async function organizeRolesUnderParsedList(
  guild: Guild,
  entries: ParsedRoleEntry[],
): Promise<OrganizeResult> {
  const { organizeRolesFromUserList } = await import("./role-organize-catalog.js");
  const result = await organizeRolesFromUserList(guild, entries);
  return {
    positioned: result.positioned,
    separatorsCreated: result.separatorsCreated,
    newSeparators: result.newSeparators,
    colorsUpdated: result.colorsUpdated,
  };
}
