import {
  getCanonicalGradeLabels,
  isRpGradeName,
  isStaffOrBaseRole,
  normalizeRoleLabel,
} from './rp-catalog';

export interface DiscordRoleFull {
  id: string;
  name: string;
  managed?: boolean;
  color?: number;
  hoist?: boolean;
  mentionable?: boolean;
  permissions?: string;
  position?: number;
}

export interface RpRoleStyle {
  color: number;
  hoist: boolean;
  mentionable: boolean;
  permissions: string;
}

const DEFAULT_STYLE: RpRoleStyle = {
  color: 0x8b0a0a,
  hoist: false,
  mentionable: false,
  permissions: '0',
};

function pickMode<T>(values: T[]): T | undefined {
  const counts = new Map<string, { value: T; count: number }>();
  for (const value of values) {
    const key = String(value);
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { value, count: 1 });
  }
  let best: { value: T; count: number } | undefined;
  for (const entry of counts.values()) {
    if (!best || entry.count > best.count) best = entry;
  }
  return best?.value;
}

export function inferRpRoleStyle(
  roles: DiscordRoleFull[],
  guildId: string,
): RpRoleStyle {
  const samples = roles.filter((role) => {
    if (role.managed) return false;
    if (role.id === guildId) return false;
    if (isStaffOrBaseRole(role.name)) return false;
    return isRpGradeName(role.name);
  });

  if (!samples.length) return DEFAULT_STYLE;

  const colors = samples.map((r) => r.color ?? 0).filter((c) => c !== 0);
  const color =
    pickMode(colors) ??
    samples.find((r) => (r.color ?? 0) !== 0)?.color ??
    DEFAULT_STYLE.color;

  return {
    color,
    hoist: samples.filter((r) => r.hoist).length > samples.length / 2,
    mentionable:
      samples.filter((r) => r.mentionable).length > samples.length / 2,
    permissions:
      pickMode(samples.map((r) => r.permissions ?? '0')) ??
      DEFAULT_STYLE.permissions,
  };
}

export function findRpRoleAnchorPosition(
  roles: DiscordRoleFull[],
  guildId: string,
): number {
  const positions = roles
    .filter((role) => {
      if (role.managed) return false;
      if (role.id === guildId) return false;
      if (isStaffOrBaseRole(role.name)) return false;
      return isRpGradeName(role.name);
    })
    .map((r) => r.position ?? 0)
    .filter((p) => p > 0);

  return positions.length ? Math.min(...positions) : 1;
}

export function pickCanonicalLabel(grade: string): string {
  const norm = normalizeRoleLabel(grade);
  return getCanonicalGradeLabels().get(norm) ?? grade;
}
