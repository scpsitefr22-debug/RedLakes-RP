import {
  isRpGradeName,
  isStaffOrBaseRole,
  normalizeRoleLabel,
} from './rp-catalog';
import { matchExistingRolesToGrades } from './role-matcher';
import {
  findRpRoleAnchorPosition,
  inferRpRoleStyle,
  pickCanonicalLabel,
  type DiscordRoleFull,
} from './role-style';

interface DiscordRole {
  id: string;
  name: string;
  managed?: boolean;
  color?: number;
  hoist?: boolean;
  mentionable?: boolean;
  permissions?: string;
  position?: number;
}

interface RegistryState {
  gradeToRoleId: Map<string, string>;
  managedRoleIds: Set<string>;
  roleNames: Map<string, string>;
  refreshedAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

let state: RegistryState = {
  gradeToRoleId: new Map(),
  managedRoleIds: new Set(),
  roleNames: new Map(),
  refreshedAt: 0,
};

function applyManualOverrides(
  roleMap: Record<string, string>,
  roleVerified?: string,
): void {
  for (const [grade, roleId] of Object.entries(roleMap)) {
    if (!roleId) continue;
    const key = normalizeRoleLabel(grade);
    state.gradeToRoleId.set(key, roleId);
    state.managedRoleIds.add(roleId);
  }
  if (roleVerified) {
    state.managedRoleIds.add(roleVerified);
  }
}

function buildFromRoles(roles: DiscordRole[], guildId: string): RegistryState {
  const gradeToRoleId = new Map<string, string>();
  const managedRoleIds = new Set<string>();
  const roleNames = new Map<string, string>();

  const eligible = roles.filter(
    (role) =>
      !role.managed && role.id !== guildId && !isStaffOrBaseRole(role.name),
  );

  for (const hit of matchExistingRolesToGrades(eligible)) {
    gradeToRoleId.set(hit.gradeNorm, hit.roleId);
    managedRoleIds.add(hit.roleId);
    roleNames.set(hit.roleId, hit.roleName);
  }

  for (const role of eligible) {
    if (managedRoleIds.has(role.id)) continue;
    if (!isRpGradeName(role.name)) continue;

    const normalized = normalizeRoleLabel(role.name);
    if (!normalized || gradeToRoleId.has(normalized)) continue;

    gradeToRoleId.set(normalized, role.id);
    managedRoleIds.add(role.id);
    roleNames.set(role.id, role.name);
  }

  return {
    gradeToRoleId,
    managedRoleIds,
    roleNames,
    refreshedAt: Date.now(),
  };
}

export async function refreshRoleRegistryFromApi(params: {
  token: string;
  guildId: string;
  roleMap?: Record<string, string>;
  roleVerified?: string;
  force?: boolean;
}): Promise<RegistryState> {
  const stale =
    params.force ||
    Date.now() - state.refreshedAt > CACHE_TTL_MS ||
    state.managedRoleIds.size === 0;

  if (!stale) {
    applyManualOverrides(params.roleMap ?? {}, params.roleVerified);
    return state;
  }

  const res = await fetch(
    `https://discord.com/api/v10/guilds/${params.guildId}/roles`,
    { headers: { Authorization: `Bot ${params.token}` } },
  );

  if (!res.ok) {
    throw new Error(`Discord roles fetch failed (${res.status})`);
  }

  const roles = (await res.json()) as DiscordRole[];
  state = buildFromRoles(roles, params.guildId);
  applyManualOverrides(params.roleMap ?? {}, params.roleVerified);
  return state;
}

export function resolveGradeRoleId(
  grade: string,
  roleMap: Record<string, string> = {},
): string | undefined {
  const key = normalizeRoleLabel(grade);
  if (state.gradeToRoleId.has(key)) {
    return state.gradeToRoleId.get(key);
  }

  for (const [norm, id] of state.gradeToRoleId) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      return id;
    }
  }

  return roleMap[grade] || undefined;
}

export function getManagedRoleIds(): Set<string> {
  return new Set(state.managedRoleIds);
}

async function createRoleViaApi(params: {
  token: string;
  guildId: string;
  label: string;
  style: ReturnType<typeof inferRpRoleStyle>;
}): Promise<DiscordRole | undefined> {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${params.guildId}/roles`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bot ${params.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: params.label.slice(0, 100),
        color: params.style.color,
        hoist: params.style.hoist,
        mentionable: params.style.mentionable,
        permissions: params.style.permissions,
      }),
    },
  );

  if (!res.ok) return undefined;
  return (await res.json()) as DiscordRole;
}

/** Cree le role Discord d'un grade s'il manque (style copie des roles RP existants) */
export async function ensureGradeRoleViaApi(params: {
  token: string;
  guildId: string;
  grade: string;
  autoCreate?: boolean;
}): Promise<string | undefined> {
  if (params.autoCreate === false) {
    return resolveGradeRoleId(params.grade);
  }

  const norm = normalizeRoleLabel(params.grade);
  if (state.gradeToRoleId.has(norm)) {
    return state.gradeToRoleId.get(norm);
  }

  const rolesRes = await fetch(
    `https://discord.com/api/v10/guilds/${params.guildId}/roles`,
    { headers: { Authorization: `Bot ${params.token}` } },
  );
  if (!rolesRes.ok) return undefined;

  const roles = (await rolesRes.json()) as DiscordRoleFull[];
  state = buildFromRoles(roles, params.guildId);

  if (state.gradeToRoleId.has(norm)) {
    return state.gradeToRoleId.get(norm);
  }

  const style = inferRpRoleStyle(roles, params.guildId);
  const label = pickCanonicalLabel(params.grade);
  const created = await createRoleViaApi({
    token: params.token,
    guildId: params.guildId,
    label,
    style,
  });

  if (!created) return undefined;

  state.gradeToRoleId.set(norm, created.id);
  state.managedRoleIds.add(created.id);
  state.roleNames.set(created.id, created.name);

  const anchor = findRpRoleAnchorPosition(roles, params.guildId);
  await fetch(
    `https://discord.com/api/v10/guilds/${params.guildId}/roles/${created.id}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${params.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ position: anchor }),
    },
  ).catch(() => undefined);

  return created.id;
}
