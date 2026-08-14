import type { Guild } from "discord.js";
import { config } from "../config.js";
import {
  isRpGradeName,
  isStaffOrBaseRole,
  normalizeRoleLabel,
} from "./rp-catalog.js";
import { isLayoutSeparatorName } from "./role-layout.js";
import { matchExistingRolesToGrades } from "./role-matcher.js";
import { isFactionRole, isExistingBranchSeparator } from "./role-sanitize.js";

interface RegistryState {
  gradeToRoleId: Map<string, string>;
  managedRoleIds: Set<string>;
  roleNames: Map<string, string>;
  /** role ID -> score de correspondance fuzzy */
  matchScores: Map<string, number>;
  refreshedAt: number;
}

let state: RegistryState = {
  gradeToRoleId: new Map(),
  managedRoleIds: new Set(),
  roleNames: new Map(),
  matchScores: new Map(),
  refreshedAt: 0,
};

function applyManualOverrides(): void {
  for (const [grade, roleId] of Object.entries(config.roleMap)) {
    if (!roleId) continue;
    const key = normalizeRoleLabel(grade);
    state.gradeToRoleId.set(key, roleId);
    state.managedRoleIds.add(roleId);
  }
  if (config.roleVerified) {
    state.managedRoleIds.add(config.roleVerified);
  }
}

function isEligibleRole(guild: Guild, role: { id: string; name: string; managed: boolean; position: number }): boolean {
  if (role.managed) return false;
  if (role.id === guild.id) return false;
  if (isStaffOrBaseRole(role.name)) return false;
  if (isLayoutSeparatorName(role.name)) return false;
  if (isExistingBranchSeparator(role.name)) return false;
  if (isFactionRole(role.name)) return false;
  return true;
}

/** Reconstruit le mapping depuis les roles Discord existants (noms proches acceptes) */
export async function refreshRoleRegistry(
  guild: Guild,
  options?: { ensureMissing?: boolean; organize?: boolean },
): Promise<RegistryState> {
  await guild.roles.fetch();

  const gradeToRoleId = new Map<string, string>();
  const managedRoleIds = new Set<string>();
  const roleNames = new Map<string, string>();
  const matchScores = new Map<string, number>();

  const eligible = [...guild.roles.cache.values()].filter((r) =>
    isEligibleRole(guild, r),
  );

  const fuzzy = matchExistingRolesToGrades(
    eligible.map((r) => ({ id: r.id, name: r.name, position: r.position })),
  );

  for (const hit of fuzzy) {
    gradeToRoleId.set(hit.gradeNorm, hit.roleId);
    managedRoleIds.add(hit.roleId);
    roleNames.set(hit.roleId, hit.roleName);
    matchScores.set(hit.roleId, hit.score);
  }

  for (const role of eligible) {
    if (managedRoleIds.has(role.id)) continue;
    if (!isRpGradeName(role.name)) continue;

    const normalized = normalizeRoleLabel(role.name);
    if (!normalized || gradeToRoleId.has(normalized)) continue;

    gradeToRoleId.set(normalized, role.id);
    managedRoleIds.add(role.id);
    roleNames.set(role.id, role.name);
    matchScores.set(role.id, 100);
  }

  state = {
    gradeToRoleId,
    managedRoleIds,
    roleNames,
    matchScores,
    refreshedAt: Date.now(),
  };

  applyManualOverrides();

  if (options?.ensureMissing !== false && config.roles.autoCreate) {
    const { ensureMissingRpRoles } = await import("./ensure-rp-roles.js");
    await ensureMissingRpRoles(guild, { organize: false });
  }

  const { removeEmptyBotDuplicates } = await import("./dedupe-rp-roles.js");
  await removeEmptyBotDuplicates(guild, fuzzy);

  if (config.roles.autoOrganize && options?.organize !== false) {
    const { organizeGuildRpRoles } = await import("./organize-rp-roles.js");
    await organizeGuildRpRoles(guild);
  }

  return state;
}

export function getRoleRegistry(): RegistryState {
  return state;
}

export function getManagedRoleIds(): Set<string> {
  return new Set(state.managedRoleIds);
}

export function resolveGradeRoleId(grade: string): string | undefined {
  const key = normalizeRoleLabel(grade);
  if (state.gradeToRoleId.has(key)) {
    return state.gradeToRoleId.get(key);
  }

  for (const [norm, id] of state.gradeToRoleId) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      return id;
    }
  }

  const manual = config.roleMap[grade];
  return manual || undefined;
}

export function logRegistrySummary(): void {
  const mapped = [...state.gradeToRoleId.entries()]
    .map(([grade, id]) => {
      const name = state.roleNames.get(id) ?? id;
      const score = state.matchScores.get(id);
      const tag = score && score < 100 ? ` (~${score}%)` : "";
      return `    ${grade} -> "${name}"${tag}`;
    })
    .join("\n");

  console.log(
    `[roles] ${state.managedRoleIds.size} role(s) RP detectes, ` +
      `${state.gradeToRoleId.size} grade(s) mappe(s)`,
  );
  if (mapped) console.log(mapped);
  else console.warn("[roles] Aucun role RP detecte sur Discord");
}
