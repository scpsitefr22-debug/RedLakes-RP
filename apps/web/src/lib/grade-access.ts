import type { ClearanceLevel } from "./clearance";
import {
  findGradeMeta,
  normalizeGradeId,
  rpGrades,
  rpGradesByBranch,
  type RpGradeMeta,
} from "@/data/rp-grades";

export type SiteSection =
  | "overview"
  | "fondation"
  | "omega"
  | "direction"
  | "departements"
  | "securite"
  | "scientifique"
  | "maintenance"
  | "general"
  | "teams"
  | "chambers"
  | "experiences"
  | "medical"
  | "armory"
  | "secretariat"
  | "services"
  | "detention"
  | "access-matrix"
  | "mtf"
  | "transmissions-public"
  | "transmissions-restricted"
  | "transmissions-classified";

export const SITE_SECTION_LABELS: Record<SiteSection, string> = {
  overview: "Vue d'ensemble",
  fondation: "Fondation SCP",
  omega: "Conseil Oméga",
  direction: "Direction Site-12",
  departements: "Départements",
  securite: "Sécurité",
  scientifique: "Scientifique",
  maintenance: "Maintenance",
  general: "Général",
  teams: "Équipes",
  chambers: "Chambres SCP",
  experiences: "Expériences",
  medical: "Médical",
  armory: "Armement",
  secretariat: "Secrétariat",
  services: "Services",
  detention: "Personnel détenu",
  "access-matrix": "Matrice d'accès",
  mtf: "Forces Mobiles",
  "transmissions-public": "Transmissions (public)",
  "transmissions-restricted": "Transmissions (restreint)",
  "transmissions-classified": "Transmissions (classifié)",
};

export function getGradeMeta(grade: string | null | undefined): RpGradeMeta | undefined {
  if (!grade) return undefined;
  return findGradeMeta(grade);
}

export function canAccessSiteSection(
  grade: string | null | undefined,
  section: SiteSection,
): boolean {
  const meta = getGradeMeta(grade);
  if (!meta) return section === "overview" || section === "fondation";
  return meta.siteSections.includes(section);
}

export function canAccessWithClearance(
  userClearance: ClearanceLevel,
  required: ClearanceLevel,
): boolean {
  return userClearance >= required;
}

export function getAccessibleSections(grade: string | null | undefined): SiteSection[] {
  const meta = getGradeMeta(grade);
  if (!meta) return ["overview", "fondation"];
  return meta.siteSections as SiteSection[];
}

export function getGradesForBranch(branch: string): RpGradeMeta[] {
  return (rpGradesByBranch[branch as keyof typeof rpGradesByBranch] ?? []) as RpGradeMeta[];
}

export function compareGradeRank(a: string, b: string): number {
  const ia = rpGrades.findIndex((g) => normalizeGradeId(g.name) === normalizeGradeId(a));
  const ib = rpGrades.findIndex((g) => normalizeGradeId(g.name) === normalizeGradeId(b));
  if (ia === -1 && ib === -1) return 0;
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}

export { rpGrades, rpGradesByBranch };
