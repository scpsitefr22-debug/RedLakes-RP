export type ClearanceLevel = 1 | 2 | 3 | 4 | 5;

export const CLEARANCE_LABELS: Record<ClearanceLevel, string> = {
  1: "Niveau 1 — Personnel de base",
  2: "Niveau 2 — Personnel restreint",
  3: "Niveau 3 — Personnel confidentiel",
  4: "Niveau 4 — Personnel secret",
  5: "Niveau 5 — Personnel top secret",
};

/** Pastille « Hab. N » : une couleur par niveau, du gris (1) au rouge (5). */
export const CLEARANCE_BADGE_CLASSES: Record<ClearanceLevel, string> = {
  1: "border-metal text-gray-400",
  2: "border-blue-400/40 text-blue-300",
  3: "border-yellow-400/40 text-yellow-300",
  4: "border-orange-400/50 text-orange-300",
  5: "border-redlake/60 text-redlake-glow",
};

export function clearanceBadgeClass(level: number): string {
  return CLEARANCE_BADGE_CLASSES[(Math.min(5, Math.max(1, level)) as ClearanceLevel)];
}

export function canAccess(userLevel: ClearanceLevel, required: ClearanceLevel) {
  return userLevel >= required;
}
