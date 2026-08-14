import type { GuildMember } from "discord.js";
import {
  getRoleRegistry,
  resolveGradeRoleId,
} from "./discord-role-registry.js";
import {
  getCanonicalGradeLabels,
  isStaffOrBaseRole,
  isRpGradeName,
  normalizeRoleLabel,
} from "./rp-catalog.js";
import { RP_ROLE_LAYOUT } from "./role-layout.js";
import { resolveAliasGrade, isCombinedBroadDiscordRole } from "./role-sanitize.js";
import { scoreRoleGradeMatch } from "./role-matcher.js";

function gradeLayoutRank(gradeLabel: string): number {
  const norm = normalizeRoleLabel(gradeLabel);
  for (let i = 0; i < RP_ROLE_LAYOUT.length; i++) {
    const entry = RP_ROLE_LAYOUT[i];
    if (entry.kind === "grade" && normalizeRoleLabel(entry.label) === norm) {
      return i;
    }
  }
  return RP_ROLE_LAYOUT.length;
}

function isRecognizedMemberRpRole(roleName: string): boolean {
  if (isCombinedBroadDiscordRole(roleName)) return false;
  if (isStaffOrBaseRole(roleName)) return false;
  if (resolveAliasGrade(roleName)) return true;
  if (isRpGradeName(roleName)) return true;
  const canonical = getCanonicalGradeLabels();
  for (const [, label] of canonical) {
    if (scoreRoleGradeMatch(roleName, label) >= 70) return true;
  }
  return false;
}

type GradeCandidate = {
  grade: string;
  roleName: string;
  roleId: string;
  rank: number;
  score: number;
};

function pickBetterGradeCandidate(
  current: GradeCandidate | null,
  member: GuildMember,
  role: { id: string; name: string },
  grade: string,
  score: number,
): GradeCandidate {
  const rank = gradeLayoutRank(grade);
  const position = member.roles.cache.get(role.id)?.position ?? 0;
  const bestPosition = current
    ? (member.roles.cache.get(current.roleId)?.position ?? 0)
    : -1;
  if (
    !current ||
    rank < current.rank ||
    (rank === current.rank && score > current.score) ||
    (rank === current.rank && score === current.score && position > bestPosition)
  ) {
    return { grade, roleName: role.name, roleId: role.id, rank, score };
  }
  return current;
}

/** Grade RP le plus eleve parmi les roles Discord du membre */
export function resolveMemberRpGrade(
  member: GuildMember,
): { grade: string; roleName: string; roleId: string } | null {
  const registry = getRoleRegistry();
  const canonical = getCanonicalGradeLabels();

  const memberRoles = [...member.roles.cache.values()]
    .filter((r) => r.id !== member.guild.id)
    .sort((a, b) => b.position - a.position);

  let best: GradeCandidate | null = null;

  for (const role of memberRoles) {
    if (isCombinedBroadDiscordRole(role.name)) continue;
    if (isStaffOrBaseRole(role.name)) continue;
    const alias = resolveAliasGrade(role.name);
    if (alias) {
      const norm = normalizeRoleLabel(alias);
      best = pickBetterGradeCandidate(
        best,
        member,
        role,
        canonical.get(norm) ?? alias,
        98,
      );
    }
  }

  for (const entry of RP_ROLE_LAYOUT) {
    if (entry.kind !== "grade") continue;
    const roleId = resolveGradeRoleId(entry.label);
    if (!roleId || !member.roles.cache.has(roleId)) continue;

    const norm = normalizeRoleLabel(entry.label);
    best = pickBetterGradeCandidate(
      best,
      member,
      { id: roleId, name: registry.roleNames.get(roleId) ?? entry.label },
      canonical.get(norm) ?? registry.roleNames.get(roleId) ?? entry.label,
      100,
    );
  }

  for (const role of memberRoles) {
    if (isCombinedBroadDiscordRole(role.name)) continue;
    if (isStaffOrBaseRole(role.name)) continue;
    for (const [, label] of canonical) {
      const score = scoreRoleGradeMatch(role.name, label);
      if (score < 70) continue;
      best = pickBetterGradeCandidate(best, member, role, label, score);
    }
  }

  if (!best) return null;
  return { grade: best.grade, roleName: best.roleName, roleId: best.roleId };
}

export { isRecognizedMemberRpRole };
