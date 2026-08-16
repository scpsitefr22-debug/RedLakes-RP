/**
 * Visibilite par departement : un contenu non restreint (tableau vide) est
 * public. Un contenu restreint n'est visible que par les joueurs dont le
 * departement courant figure dans la liste. Remplace l'ancien systeme de
 * "clearance" numerique (1-5) — voir docs/REDLAKES-CORE-SPEC.md.
 */
export function isVisibleToDepartment(
  restrictedDepartmentIds: string[],
  departmentId: string | null,
): boolean {
  if (restrictedDepartmentIds.length === 0) return true;
  return !!departmentId && restrictedDepartmentIds.includes(departmentId);
}

export function filterByDepartment<
  T extends { restrictedDepartmentIds: string[] },
>(items: T[], departmentId: string | null): T[] {
  return items.filter((item) =>
    isVisibleToDepartment(item.restrictedDepartmentIds, departmentId),
  );
}
