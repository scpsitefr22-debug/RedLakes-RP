import { getCanonicalGradeLabels, normalizeRoleLabel } from './rp-catalog';

const MIN_MATCH_SCORE = 48;

function tokens(value: string): string[] {
  return normalizeRoleLabel(value)
    .split(/[\s/|-]+/)
    .filter((t) => t.length > 1);
}

export function scoreRoleGradeMatch(
  roleName: string,
  gradeLabel: string,
): number {
  const role = normalizeRoleLabel(roleName);
  const grade = normalizeRoleLabel(gradeLabel);
  if (!role || !grade) return 0;
  if (role === grade) return 100;
  if (role.includes(grade) || grade.includes(role)) return 85;

  const rt = tokens(roleName);
  const gt = tokens(gradeLabel);
  if (!rt.length || !gt.length) return 0;

  const shared = rt.filter((t) =>
    gt.some((g) => g === t || g.includes(t) || t.includes(g)),
  );
  if (!shared.length) return 0;

  const ratio = shared.length / Math.max(rt.length, gt.length);
  let score = Math.round(55 + ratio * 35);
  if (shared.length >= 2) score += 8;

  return Math.min(score, 95);
}

export function matchExistingRolesToGrades(
  roles: Array<{ id: string; name: string }>,
): Array<{
  roleId: string;
  roleName: string;
  gradeNorm: string;
  gradeLabel: string;
  score: number;
}> {
  const canonical = getCanonicalGradeLabels();
  const candidates: Array<{
    roleId: string;
    roleName: string;
    gradeNorm: string;
    gradeLabel: string;
    score: number;
  }> = [];

  for (const role of roles) {
    for (const [gradeNorm, gradeLabel] of canonical) {
      const score = scoreRoleGradeMatch(role.name, gradeLabel);
      if (score >= MIN_MATCH_SCORE) {
        candidates.push({
          roleId: role.id,
          roleName: role.name,
          gradeNorm,
          gradeLabel,
          score,
        });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const usedRoles = new Set<string>();
  const usedGrades = new Set<string>();
  const out: typeof candidates = [];

  for (const c of candidates) {
    if (usedRoles.has(c.roleId) || usedGrades.has(c.gradeNorm)) continue;
    usedRoles.add(c.roleId);
    usedGrades.add(c.gradeNorm);
    out.push(c);
  }

  return out;
}
