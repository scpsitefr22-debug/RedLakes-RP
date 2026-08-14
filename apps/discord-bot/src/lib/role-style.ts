import type { Guild, Role } from "discord.js";
import { isRpGradeName, isStaffOrBaseRole } from "./rp-catalog.js";

export interface RpRoleStyle {
  color: number;
  hoist: boolean;
  mentionable: boolean;
  permissions: bigint;
}

const DEFAULT_STYLE: RpRoleStyle = {
  color: 0x8b0a0a,
  hoist: false,
  mentionable: false,
  permissions: 0n,
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

/** Deduit couleur / permissions depuis les roles RP deja presents */
export function inferRpRoleStyle(guild: Guild): RpRoleStyle {
  const samples: Role[] = [];
  for (const role of guild.roles.cache.values()) {
    if (role.managed || role.id === guild.id) continue;
    if (isStaffOrBaseRole(role.name)) continue;
    if (isRpGradeName(role.name)) samples.push(role);
  }

  if (samples.length === 0) return DEFAULT_STYLE;

  const colors = samples.map((r) => r.color).filter((c) => c !== 0);
  const color = pickMode(colors) ?? samples.find((r) => r.color !== 0)?.color ?? DEFAULT_STYLE.color;

  return {
    color,
    hoist: samples.filter((r) => r.hoist).length > samples.length / 2,
    mentionable: samples.filter((r) => r.mentionable).length > samples.length / 2,
    permissions: pickMode(samples.map((r) => r.permissions.bitfield)) ?? 0n,
  };
}

/** Position de reference pour regrouper les nouveaux roles RP */
export function findRpRoleAnchorPosition(guild: Guild): number {
  const positions: number[] = [];
  for (const role of guild.roles.cache.values()) {
    if (role.managed || role.id === guild.id) continue;
    if (isStaffOrBaseRole(role.name)) continue;
    if (isRpGradeName(role.name)) positions.push(role.position);
  }
  return positions.length ? Math.min(...positions) : 1;
}
