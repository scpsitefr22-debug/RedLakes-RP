import { getCanonicalGradeLabels, normalizeRoleLabel } from "./rp-catalog.js";
import {
  isExistingBranchSeparator,
  resolveAliasGrade,
  sanitizeDiscordRoleName,
} from "./role-sanitize.js";

export interface RoleGradeMatch {
  roleId: string;
  roleName: string;
  gradeNorm: string;
  gradeLabel: string;
  score: number;
  position: number;
}

function exactGradeMatch(roleName: string, gradeLabel: string): boolean {
  const r = normalizeRoleLabel(sanitizeDiscordRoleName(roleName));
  const g = normalizeRoleLabel(gradeLabel);
  return r === g;
}

function isOmegaRole(name: string): boolean {
  return (
    /\(\s*o-?\d+\s*\)/i.test(name) ||
    /\bo-?\d+\b/i.test(sanitizeDiscordRoleName(name))
  );
}

/**
 * Matching strict : alias RedLakes + nom exact uniquement.
 * Evite les faux positifs sur un serveur avec beaucoup de roles custom.
 */
export function matchExistingRolesToGrades(
  roles: Iterable<{ id: string; name: string; position?: number }>,
): RoleGradeMatch[] {
  const canonical = getCanonicalGradeLabels();
  const sorted = [...roles].sort(
    (a, b) => (b.position ?? 0) - (a.position ?? 0),
  );

  const usedGrades = new Set<string>();
  const usedRoles = new Set<string>();
  const matches: RoleGradeMatch[] = [];

  function assign(
    role: { id: string; name: string; position?: number },
    gradeNorm: string,
    gradeLabel: string,
    score: number,
  ): void {
    if (usedGrades.has(gradeNorm) || usedRoles.has(role.id)) return;
    usedGrades.add(gradeNorm);
    usedRoles.add(role.id);
    matches.push({
      roleId: role.id,
      roleName: role.name,
      gradeNorm,
      gradeLabel,
      score,
      position: role.position ?? 0,
    });
  }

  // Phase 1 : noms exacts (ex. « Sergent » avant « Sergent Elite »)
  for (const role of sorted) {
    if (usedRoles.has(role.id)) continue;
    for (const [gradeNorm, gradeLabel] of canonical) {
      if (usedGrades.has(gradeNorm)) continue;
      if (exactGradeMatch(role.name, gradeLabel)) {
        assign(role, gradeNorm, gradeLabel, 100);
        break;
      }
    }
  }

  const passes = [
    (r: typeof sorted[0]) => isOmegaRole(r.name),
    (r: typeof sorted[0]) => Boolean(resolveAliasGrade(r.name)),
    () => true,
  ];

  for (const filter of passes) {
    for (const role of sorted.filter((r) => !usedRoles.has(r.id) && filter(r))) {
      const alias = resolveAliasGrade(role.name);
      if (alias) {
        const norm = normalizeRoleLabel(alias);
        if (canonical.has(norm)) {
          assign(role, norm, canonical.get(norm) ?? alias, 98);
          continue;
        }
      }

      for (const [gradeNorm, gradeLabel] of canonical) {
        if (usedGrades.has(gradeNorm)) continue;
        if (exactGradeMatch(role.name, gradeLabel)) {
          assign(role, gradeNorm, gradeLabel, 100);
          break;
        }
      }
    }
  }

  return matches;
}

export function scoreRoleGradeMatch(roleName: string, gradeLabel: string): number {
  if (resolveAliasGrade(roleName) === gradeLabel) return 98;
  return exactGradeMatch(roleName, gradeLabel) ? 100 : 0;
}

export function isServerStructureRole(name: string): boolean {
  return isExistingBranchSeparator(name);
}
