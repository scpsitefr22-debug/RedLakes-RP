import type { Guild, Role } from "discord.js";
import { config } from "../config.js";
import {
  getCanonicalGradeLabels,
  normalizeRoleLabel,
} from "./rp-catalog.js";
import { getRoleRegistry } from "./discord-role-registry.js";
import {
  getBranchColor,
  getLayoutBranchForGrade,
} from "./role-layout.js";
import { organizeGuildRpRoles } from "./organize-rp-roles.js";
import { inferRpRoleStyle } from "./role-style.js";

interface EnsureResult {
  created: string[];
  skipped: number;
}

function isMapped(norm: string): boolean {
  return getRoleRegistry().gradeToRoleId.has(norm);
}

/**
 * Cree les roles RP manquants (couleur par departement) puis reorganise la hierarchie.
 */
export async function ensureMissingRpRoles(
  guild: Guild,
  options?: { onlyGrades?: string[]; organize?: boolean },
): Promise<EnsureResult> {
  if (!config.roles.autoCreate) {
    return { created: [], skipped: 0 };
  }

  await guild.roles.fetch();
  const registry = getRoleRegistry();
  const canonical = getCanonicalGradeLabels();
  const base = inferRpRoleStyle(guild);

  const onlyNorms = options?.onlyGrades?.map((g) => normalizeRoleLabel(g));
  const toCreate: Array<{ norm: string; label: string }> = [];

  for (const [norm, label] of canonical) {
    if (onlyNorms && !onlyNorms.includes(norm)) continue;
    if (isMapped(norm)) continue;
    toCreate.push({ norm, label });
  }

  if (!toCreate.length) {
    if (options?.organize !== false && config.roles.autoOrganize) {
      await organizeGuildRpRoles(guild);
    }
    return { created: [], skipped: canonical.size };
  }

  const createdLabels: string[] = [];

  for (const { norm, label } of toCreate) {
    const branch = getLayoutBranchForGrade(label);
    const color = getBranchColor(branch);

    try {
      const role = await guild.roles.create({
        name: label.slice(0, 100),
        colors: { primaryColor: color },
        hoist: base.hoist,
        mentionable: base.mentionable,
        permissions: base.permissions,
        reason: "Auto-creation grade RP Site-12 REDLAKES",
      });

      registry.gradeToRoleId.set(norm, role.id);
      registry.managedRoleIds.add(role.id);
      registry.roleNames.set(role.id, role.name);
      createdLabels.push(label);
      console.log(`[roles] Cree : ${label}`);
      await new Promise((r) => setTimeout(r, 350));
    } catch (err) {
      console.warn(`[roles] Impossible de creer "${label}" :`, err);
    }
  }

  if (createdLabels.length) {
    console.log(`[roles] ${createdLabels.length} role(s) RP cree(s) et classes par departement`);
  }

  if (options?.organize !== false && config.roles.autoOrganize) {
    await organizeGuildRpRoles(guild);
  }

  return {
    created: createdLabels,
    skipped: canonical.size - createdLabels.length,
  };
}

/** Cree un seul role si le grade in-game n'existe pas encore sur Discord */
export async function ensureGradeRole(
  guild: Guild,
  grade: string,
): Promise<string | undefined> {
  const norm = normalizeRoleLabel(grade);
  const registry = getRoleRegistry();
  const existing = registry.gradeToRoleId.get(norm);
  if (existing) return existing;

  await ensureMissingRpRoles(guild, { onlyGrades: [grade], organize: true });
  return registry.gradeToRoleId.get(norm);
}
