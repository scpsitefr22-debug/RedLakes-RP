/**
 * Rôles jamais touchés par le rangement automatique (staff, bot, base joueur…).
 */
import { PermissionFlagsBits, type Guild, type Role } from "discord.js";
import { config } from "../config.js";
import { isStaffOrBaseRole } from "./rp-catalog.js";

const ELEVATED_STAFF_FLAGS =
  PermissionFlagsBits.Administrator |
  PermissionFlagsBits.ManageGuild |
  PermissionFlagsBits.ManageRoles |
  PermissionFlagsBits.BanMembers |
  PermissionFlagsBits.KickMembers |
  PermissionFlagsBits.ModerateMembers;

let protectedIdCache: Set<string> | null = null;

function protectedRoleIds(): Set<string> {
  if (protectedIdCache) return protectedIdCache;
  const ids = new Set<string>();
  for (const id of Object.values(config.roleMap)) {
    if (id) ids.add(id);
  }
  if (config.roleVerified) ids.add(config.roleVerified);
  const extra = process.env.DISCORD_PROTECTED_ROLE_IDS ?? "";
  for (const id of extra.split(/[,;\s]+/)) {
    if (id.trim()) ids.add(id.trim());
  }
  protectedIdCache = ids;
  return ids;
}

/** Rôle staff / base / bot — exclu du rangement RP. */
export function isProtectedFromOrganize(role: Role, guild: Guild): boolean {
  if (role.id === guild.id) return true;
  if (role.managed) return true;
  if (isStaffOrBaseRole(role.name)) return true;
  if (protectedRoleIds().has(role.id)) return true;

  if (role.permissions.has(ELEVATED_STAFF_FLAGS)) return true;

  const botTop = guild.members.me?.roles.highest.position;
  if (botTop !== undefined && role.position >= botTop) return true;

  return false;
}

export function collectProtectedRoles(guild: Guild): Role[] {
  return [...guild.roles.cache.values()].filter((r) =>
    isProtectedFromOrganize(r, guild),
  );
}

/** Plafond hiérarchique RP : juste sous le rôle staff le plus bas. */
export function findRpBlockCeiling(guild: Guild): number {
  const protectedRoles = collectProtectedRoles(guild);
  if (!protectedRoles.length) {
    const botTop = guild.members.me?.roles.highest.position ?? 1;
    return Math.max(botTop - 1, 1);
  }

  const staffFloor = Math.min(...protectedRoles.map((r) => r.position));
  return Math.max(staffFloor - 1, 1);
}

export function snapshotRolePositions(roles: Role[]): Map<string, number> {
  return new Map(roles.map((r) => [r.id, r.position]));
}

/** Restaure les positions d'origine si Discord les a déplacées par effet de bord. */
export async function restoreRolePositions(
  guild: Guild,
  snapshot: Map<string, number>,
): Promise<number> {
  let restored = 0;
  const items = [...snapshot.entries()]
    .map(([id, position]) => ({ id, position }))
    .sort((a, b) => b.position - a.position);

  for (const { id, position } of items) {
    const role = guild.roles.cache.get(id);
    if (!role || role.position === position) continue;
    await role
      .setPosition(position, { reason: "Restauration rôles staff REDLAKES" })
      .catch(() => undefined);
    restored += 1;
  }

  if (restored > 0) {
    console.log(`[roles] ${restored} rôle(s) staff/base restauré(s)`);
  }
  return restored;
}
