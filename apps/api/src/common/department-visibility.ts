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

interface RestrictableAddendum {
  author: string;
  content: string;
  restrictedDepartmentIds?: string[];
}

/**
 * Retire le contenu des addendums restreints a un departement auquel le
 * lecteur n'appartient pas (ne laisse passer que l'auteur + un flag) —
 * contrairement a restrictedDepartmentIds au niveau fiche, ici la fiche
 * reste visible, seuls certains addendums individuels sont masques.
 */
export function redactAddendums<T extends { addendums: unknown }>(
  scp: T,
  departmentId: string | null,
): T {
  const addendums = Array.isArray(scp.addendums)
    ? (scp.addendums as RestrictableAddendum[])
    : [];
  return {
    ...scp,
    addendums: addendums.map((addendum) => {
      const restricted = addendum.restrictedDepartmentIds ?? [];
      if (isVisibleToDepartment(restricted, departmentId)) return addendum;
      return { author: addendum.author, redacted: true };
    }),
  };
}
