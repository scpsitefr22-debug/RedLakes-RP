import { normalizeRoleLabel } from "./rp-catalog.js";

/** Couleurs par branche Site-12 (alignees sur le site) */
export const BRANCH_COLORS = {
  omega: 0x8b0a0a,
  direction: 0x991b1b,
  securite: 0x1e40af,
  scientifique: 0x15803d,
  maintenance: 0xc2410c,
  general: 0x6b7280,
  classes: 0x374151,
  separator: 0x2b2d31,
} as const;

export type BranchId = keyof typeof BRANCH_COLORS;

export interface LayoutSeparator {
  kind: "separator";
  name: string;
  branch: BranchId;
}

export interface LayoutGrade {
  kind: "grade";
  label: string;
  branch: BranchId;
}

export type LayoutEntry = LayoutSeparator | LayoutGrade;

function sep(name: string, branch: BranchId): LayoutSeparator {
  return { kind: "separator", name, branch };
}

function grade(label: string, branch: BranchId): LayoutGrade {
  return { kind: "grade", label, branch };
}

/** Ordre d'affichage des roles RP sur Discord (haut -> bas) */
export const RP_ROLE_LAYOUT: LayoutEntry[] = [
  sep("━━━ CONSEIL OMEGA ━━━", "omega"),
  grade("Gerant Omega - O1", "omega"),
  grade("Adjoint Omega - O2", "omega"),
  grade("Omega - O3 a O5", "omega"),

  sep("━━━ DIRECTION SITE-12 ━━━", "direction"),
  grade("Directeur du Site", "direction"),
  grade("Adjoint-Directeur", "direction"),
  grade("Directeur Securite", "direction"),
  grade("Adjoint-Directeur Securite", "direction"),
  grade("Directeur Scientifique", "direction"),
  grade("Adjoint-Directeur Scientifique", "direction"),
  grade("Directeur-Adjoint Medical", "direction"),
  grade("Superviseur d'Intervention", "direction"),
  grade("Medecin en Chef", "direction"),
  grade("Chef de Com. en Soin", "direction"),
  grade("Directeur Maintenance", "direction"),
  grade("Adjoint-Directeur Maintenance", "direction"),
  grade("Directeur Generale", "direction"),
  grade("Adjoint-Directeur General", "direction"),

  sep("━━━ SECURITE ━━━", "securite"),
  grade("Commandant", "securite"),
  grade("Commandant Patrouilles", "securite"),
  grade("Lieutenant de Terrain", "securite"),
  grade("Lieutenant Securite", "securite"),
  grade("General de Com.", "securite"),
  grade("Responsable Garde D", "securite"),
  grade("Instructeur / Formateur", "securite"),
  grade("Superviseur", "securite"),
  grade("Sergent Elite", "securite"),
  grade("Sergent Prestige", "securite"),
  grade("Sergent", "securite"),
  grade("Caporal Elite", "securite"),
  grade("Caporal Prestige", "securite"),
  grade("Caporal Garde", "securite"),
  grade("Caporal", "securite"),
  grade("Soldat Elite", "securite"),
  grade("Soldat Prestige", "securite"),
  grade("Soldat Garde", "securite"),
  grade("Soldat", "securite"),

  sep("━━━ SCIENTIFIQUE ━━━", "scientifique"),
  grade("Superviseur d'Experience", "scientifique"),
  grade("Superviseur de SCP", "scientifique"),
  grade("Responsable d'Autorisation", "scientifique"),
  grade("Chef d'Archive", "scientifique"),
  grade("Chef de Com.", "scientifique"),
  grade("Responsable", "scientifique"),
  grade("Scientifique Qualifier", "scientifique"),
  grade("Scientifique Aguerris", "scientifique"),
  grade("Scientifique Novice", "scientifique"),
  grade("Scientifique", "scientifique"),
  grade("Chercheur Experimenteur", "scientifique"),
  grade("Chercheur Competent", "scientifique"),
  grade("Chercheur", "scientifique"),
  grade("Archiviste", "scientifique"),
  grade("Dr.", "scientifique"),
  grade("Medecin / Psychologue", "scientifique"),
  grade("Medecin", "scientifique"),
  grade("Psychologue", "scientifique"),
  grade("M/C Dr.", "scientifique"),

  sep("━━━ MAINTENANCE ━━━", "maintenance"),
  grade("Responsable d'Entretien", "maintenance"),
  grade("Responsable Livraison", "maintenance"),
  grade("Chef D'intervention", "maintenance"),
  grade("Chef de Commande", "maintenance"),
  grade("Com. de Maintenance", "maintenance"),
  grade("Chef", "maintenance"),
  grade("Chef d'equipe", "maintenance"),
  grade("Chef Technicien", "maintenance"),
  grade("Technicien", "maintenance"),
  grade("Plombier", "maintenance"),
  grade("Electricien", "maintenance"),
  grade("Mecanicien", "maintenance"),
  grade("Chef Receptionniste", "maintenance"),
  grade("Demenageur en Chef", "maintenance"),
  grade("Travailleur", "maintenance"),

  sep("━━━ GENERAL ━━━", "general"),
  grade("Superviseur Secretaire", "general"),
  grade("Superviseur Restauration", "general"),
  grade("Superviseur Nettoyage", "general"),
  grade("Superviseur Communication", "general"),
  grade("Secretaire Admin.", "general"),
  grade("Secretaire Secu.", "general"),
  grade("Secretaire Scient.", "general"),
  grade("Secretaire Medic", "general"),
  grade("Secretaire Maint.", "general"),
  grade("Com. Securite", "general"),
  grade("Com. Scientifique", "general"),
  grade("Com. Maintenance", "general"),
  grade("Com. Exterieur", "general"),
  grade("Com. Interne", "general"),
  grade("Chef de Cuisine", "general"),
  grade("Concierge", "general"),
  grade("Inspecteur", "general"),
  grade("Recrue", "general"),

  sep("━━━ PERSONNEL DETENU ━━━", "classes"),
  grade("Class-S", "classes"),
  grade("Class-B", "classes"),
  grade("Class-D", "classes"),
];

const layoutNormIndex = new Map<string, { branch: BranchId; label: string }>();
for (const entry of RP_ROLE_LAYOUT) {
  if (entry.kind !== "grade") continue;
  layoutNormIndex.set(normalizeRoleLabel(entry.label), {
    branch: entry.branch,
    label: entry.label,
  });
}

export function getLayoutBranchForGrade(grade: string): BranchId {
  const hit = layoutNormIndex.get(normalizeRoleLabel(grade));
  return hit?.branch ?? "general";
}

export function getBranchColor(branch: BranchId): number {
  return BRANCH_COLORS[branch];
}

export function isLayoutSeparatorName(name: string): boolean {
  const t = name.trim();
  return (
    /^[━─═—\s|┃│]+/.test(t) ||
    /^━━━/.test(t) ||
    /^[╰┈➤【]/.test(t) ||
    /^╰/.test(t)
  );
}

export const LAYOUT_SEPARATOR_NAMES = RP_ROLE_LAYOUT.filter(
  (e): e is LayoutSeparator => e.kind === "separator",
).map((e) => e.name);
