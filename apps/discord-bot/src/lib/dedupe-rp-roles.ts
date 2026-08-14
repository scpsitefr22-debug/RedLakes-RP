import type { Guild } from "discord.js";
import { config } from "../config.js";
import { getRoleRegistry } from "./discord-role-registry.js";
import { isLayoutSeparatorName } from "./role-layout.js";
import { normalizeRoleLabel } from "./rp-catalog.js";
import { isFactionRole, isExistingBranchSeparator } from "./role-sanitize.js";
import type { RoleGradeMatch } from "./role-matcher.js";

function isBotSeparatorDuplicate(name: string): boolean {
  return /^━━━/.test(name.trim()) || name.trim() === ".";
}

function hasEmojiOrServerDecoration(name: string): boolean {
  return /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(name) ||
    /^[╰┈➤〖〚\[]/.test(name);
}

/**
 * Supprime les doublons vides crees par le bot (━━━ separateurs, noms canoniques en bas).
 * Ne fetch pas tous les membres (gros serveurs) — supprime uniquement si role.members.size === 0.
 */
export async function removeEmptyBotDuplicates(
  guild: Guild,
  matches: RoleGradeMatch[],
): Promise<string[]> {
  if (!config.roles.removeDuplicates) return [];

  const bestByGrade = new Map<string, { id: string; position: number }>();
  for (const m of matches) {
    const role = guild.roles.cache.get(m.roleId);
    if (!role) continue;
    const cur = bestByGrade.get(m.gradeNorm);
    if (!cur || role.position > cur.position) {
      bestByGrade.set(m.gradeNorm, { id: role.id, position: role.position });
    }
  }

  const removed: string[] = [];
  const registry = getRoleRegistry();

  for (const role of guild.roles.cache.values()) {
    if (role.managed || role.id === guild.id) continue;
    if (isFactionRole(role.name) || isExistingBranchSeparator(role.name)) continue;

    const isSep = isBotSeparatorDuplicate(role.name) || isLayoutSeparatorName(role.name);
    const isLowCanon =
      !hasEmojiOrServerDecoration(role.name) &&
      role.position < 100 &&
      [...registry.gradeToRoleId.entries()].some(
        ([norm, id]) => id === role.id && bestByGrade.get(norm)?.id !== role.id,
      );

    if (!isSep && !isLowCanon) continue;
    if (role.members.size > 0) continue;

    await role.delete("Doublon bot REDLAKES (vide)").catch(() => undefined);
    removed.push(role.name);
    registry.managedRoleIds.delete(role.id);
    registry.roleNames.delete(role.id);
  }

  if (removed.length) {
    console.log(`[roles] ${removed.length} doublon(s) bot supprime(s)`);
  }

  return removed;
}
