import type { LiveGradeValues } from "@/data/faction-role-catalog";

/**
 * Factions de la ville : pour elles, le Site-12 n'est qu'une base militaire
 * de l'État. Aucune habilitation ni section du Site-12 ne doit s'y afficher.
 */
const CITY_FACTIONS = new Set(["civil", "gouvernement", "police", "crime"]);

export function isCityFaction(slug: string | null | undefined): boolean {
  return Boolean(slug && CITY_FACTIONS.has(slug));
}

/**
 * Grades d'une faction. Les autres factions ont une branche à leur nom ;
 * la Fondation regroupe toutes les branches du Site-12 (sécurité,
 * scientifique, maintenance…), c'est-à-dire tout ce qui n'est pas une autre faction.
 */
export function gradesForFaction(
  grades: LiveGradeValues[],
  factionSlug: string,
  allFactionSlugs: string[],
): LiveGradeValues[] {
  if (factionSlug === "fondation") {
    const others = new Set(allFactionSlugs.filter((slug) => slug !== "fondation"));
    return grades.filter((g) => !others.has(g.branch));
  }
  return grades.filter((g) => g.branch === factionSlug);
}

/** Habilitation la plus haute parmi ces grades (0 si aucune). */
export function topClearance(grades: LiveGradeValues[]): number {
  return grades.reduce((max, g) => Math.max(max, g.clearanceLevel ?? 0), 0);
}

/** Fourchette des salaires renseignés, ou null si aucun salaire n'est réglé. */
export function payRange(grades: LiveGradeValues[]): { min: number; max: number } | null {
  const pays = grades.map((g) => g.pay ?? 0).filter((pay) => pay > 0);
  if (!pays.length) return null;
  return { min: Math.min(...pays), max: Math.max(...pays) };
}

/** Montant en dollars, espaces insécables (fr-FR met une espace fine que certaines polices n'ont pas). */
export function formatDollars(value: number): string {
  return `${value.toLocaleString("fr-FR").replace(/\u202f/g, "\u00a0")}\u00a0$`;
}

export function formatPayRange(range: { min: number; max: number }): string {
  return range.min === range.max
    ? formatDollars(range.max)
    : `${range.min.toLocaleString("fr-FR").replace(/\u202f/g, "\u00a0")} – ${formatDollars(range.max)}`;
}
