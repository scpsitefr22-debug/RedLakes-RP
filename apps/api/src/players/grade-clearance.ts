/**
 * Habilitation dérivée du grade (aligné sur apps/web/src/data/rp-grades.ts).
 * Regenerer via scripts/generate-rp-catalog.py à terme.
 */
const GRADE_CLEARANCE: Record<string, number> = {
  'president du conseil (o1)': 5,
  'vice-president securite (o2)': 5,
  'directeur du site': 5,
  'adjoint-directeur': 4,
  'directeur securite': 4,
  'directeur scientifique': 4,
  'directeur maintenance': 4,
  'directeur generale': 4,
  commandant: 3,
  'lieutenant de terrain': 3,
  "superviseur d'experience": 3,
  'scientifique qualifier': 3,
  'medecin en chef': 3,
  sergent: 2,
  caporal: 2,
  soldat: 2,
  'class-d': 1,
  'class-b': 2,
  'class-s': 3,
  citoyen: 1,
};

export function normalizeGradeKey(grade: string): string {
  return grade
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function clearanceForGrade(grade: string): number {
  const key = normalizeGradeKey(grade);
  if (GRADE_CLEARANCE[key]) return GRADE_CLEARANCE[key];

  for (const [pattern, level] of Object.entries(GRADE_CLEARANCE)) {
    if (key.includes(pattern) || pattern.includes(key)) return level;
  }

  if (/directeur|conseil|omega|o[1-5]/i.test(grade)) return 4;
  if (
    /superviseur|commandant|lieutenant|scientifique|medecin|dr\b/i.test(grade)
  )
    return 3;
  if (/sergent|caporal|soldat|technicien|secretaire/i.test(grade)) return 2;
  return 2;
}
