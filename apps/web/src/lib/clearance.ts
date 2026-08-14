export type ClearanceLevel = 1 | 2 | 3 | 4 | 5;

export const CLEARANCE_LABELS: Record<ClearanceLevel, string> = {
  1: "Niveau 1 — Personnel de base",
  2: "Niveau 2 — Personnel restreint",
  3: "Niveau 3 — Personnel confidentiel",
  4: "Niveau 4 — Personnel secret",
  5: "Niveau 5 — Personnel top secret",
};

export function canAccess(userLevel: ClearanceLevel, required: ClearanceLevel) {
  return userLevel >= required;
}
