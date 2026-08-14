import type { Guild, Role } from "discord.js";
import {
  getCanonicalGradeLabels,
  isRpGradeName,
  isStaffOrBaseRole,
  normalizeRoleLabel,
} from "./rp-catalog.js";
import { isLayoutSeparatorName, LAYOUT_SEPARATOR_NAMES } from "./role-layout.js";
import {
  isExistingBranchSeparator,
  isFactionRole,
  resolveAliasGrade,
  sanitizeDiscordRoleName,
} from "./role-sanitize.js";

function isBotRpArtifact(name: string): boolean {
  const n = name.trim();
  return (
    isLayoutSeparatorName(n) ||
    /^━━━/.test(n) ||
    n === "." ||
    LAYOUT_SEPARATOR_NAMES.some(
      (sep) => normalizeRoleLabel(sep) === normalizeRoleLabel(n),
    )
  );
}

function matchesCatalogGrade(name: string): boolean {
  const canonical = getCanonicalGradeLabels();
  const clean = sanitizeDiscordRoleName(name);
  const norm = normalizeRoleLabel(clean);
  if (!norm) return false;
  if (canonical.has(norm)) return true;
  if (isRpGradeName(clean) || isRpGradeName(name)) return true;
  if (resolveAliasGrade(name)) return true;
  return false;
}

function isDeletableRpRole(guild: Guild, role: Role): boolean {
  if (role.managed || role.id === guild.id) return false;
  if (isStaffOrBaseRole(role.name)) return false;
  if (isFactionRole(role.name)) return false;
  if (isBotRpArtifact(role.name)) return true;
  if (isExistingBranchSeparator(role.name)) return true;
  if (matchesCatalogGrade(role.name)) return true;
  return false;
}

/**
 * Supprime tous les roles RP du serveur (grades catalogue + separateurs bot).
 * Conserve staff, Membre, Joueur, Civil, factions IC.
 */
export async function wipeAllRpRoles(guild: Guild): Promise<string[]> {
  await guild.roles.fetch();
  const removed: string[] = [];

  const targets = [...guild.roles.cache.values()]
    .filter((r) => isDeletableRpRole(guild, r))
    .sort((a, b) => a.position - b.position);

  for (const role of targets) {
    await role.delete("Rebuild complet roles RP Site-12 REDLAKES").catch((err) => {
      console.warn(`[roles] Suppression echouee "${role.name}" :`, err);
    });
    removed.push(role.name);
  }

  if (removed.length) {
    console.log(`[roles] ${removed.length} role(s) RP supprime(s) avant rebuild`);
  }
  return removed;
}
