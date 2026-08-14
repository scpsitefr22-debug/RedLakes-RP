/**
 * Grades RP Site-12 — synchronises sur Discord uniquement.
 * Genere depuis : Branche Du Site 12 (4).xlsx
 * Staff, Membre, Joueur, Civil ne sont PAS geres par le bot.
 * Regenerer : python scripts/generate-rp-catalog.py
 */

export const RP_GRADE_NAMES: readonly string[] = [
  'Adjoint-Directeur',
  'Adjoint-Directeur Maint.',
  'Adjoint-Directeur Sc.',
  'Adjoint-Directeur Se.',
  'Adjoint-Directeur-Générale',
  'Archiviste',
  'Caporal',
  'Caporal Elite',
  'Caporal Garde',
  'Caporal Prestige',
  'Chef',
  "Chef d'Archive",
  "Chef d'équipe",
  "Chef D'intervention",
  'Chef de Com.',
  'Chef de Com. en Soin',
  'Chef de Commande',
  'Chef de Cuisine',
  'Chef Receptionniste',
  'Chef Technicien',
  'Chercheur',
  'Chercheur Compétent',
  'Chercheur Experimenter',
  'Class - B',
  'Class - D',
  'Class - S',
  'Com. de Maintenance',
  'Com. Maintenance',
  'Com. Scientifique',
  'Com. Sécuriter',
  'Commandant',
  'Commandant Patrouilles',
  'Concierge',
  'Conseiller — Maintenance (O4)',
  'Conseiller — Sciences (O3)',
  'Conseiller — Services (O5)',
  'Déménageur en Chef',
  'DIRECTEUR DU SITE',
  'Directeur Générale',
  'Directeur Maintenance',
  'Directeur Scientifique',
  'Directeur Sécuriter',
  'Directeur-Adjoint Médical',
  'Dr.',
  'Electricien',
  'Géneral de Com.',
  'Instructeur / Formateur',
  'Lieutenant de Terrain',
  'Lieutenant Sécuriter',
  'M/C Dr.',
  'MEDECIN',
  'Médecin / Psychologue',
  'Medecin en Chef',
  'MEDECIN TERRAIN',
  'Président du Conseil (O1)',
  'PSYCHOLOGUE',
  'Responsable',
  "Responsable d'Autorisation",
  "Responsable d'Entretien",
  'Responsable Garde D',
  'Responsable Livraison',
  'Responsable Sécuriter',
  'Scientifique',
  'Scientifique Aguéris',
  'Scientifique Qualifier',
  'Secrétaire Adj. Admin.',
  'Secrétaire Adj. Scient.',
  'Secrétaire Adj. Secu.',
  'Secrétaire Admin.',
  'Secrétaire Scient.',
  'Secrétaire Secu.',
  'Sergent',
  'Sergent Elite',
  'Sergent Prestige',
  'Soldat',
  'Soldat Elite',
  'Soldat Garde',
  'Soldat Prestige',
  'Superviseur',
  "Superviseur d'Experience",
  "Superviseur d'Intervention",
  'Superviseur de SCP',
  'Technicien',
  'Travailleur',
  'Vice-Président — Sécurité (O2)',
];

export const STAFF_ROLE_PATTERNS: readonly RegExp[] = [
  /staff/i,
  /admin/i,
  /\bmod\b/i,
  /moderat/i,
  /owner/i,
  /fondateur/i,
  /developpeur/i,
  /developer/i,
  /bot\b/i,
  /verified|verifi/i,
  /^membre$/i,
  /^joueur$/i,
  /^visiteur$/i,
  /^civil$/i,
  /^nouveau/i,
  /^invite/i,
  /muted/i,
  /ping/i,
  /announcement/i,
  /everyone/i,
  /technique\s*staff/i,
  /gestion\s*staff/i,
  /🛠/,
  /🛡.*staff/i,
];

export function normalizeRoleLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s*-\s*/g, '-')
    .replace(/[^\w\s/.-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isStaffOrBaseRole(roleName: string): boolean {
  const n = normalizeRoleLabel(roleName);
  if (!n) return true;
  return STAFF_ROLE_PATTERNS.some((p) => p.test(roleName) || p.test(n));
}

export function isRpGradeName(name: string): boolean {
  const n = normalizeRoleLabel(name);
  return RP_GRADE_NAMES.some((g) => normalizeRoleLabel(g) === n);
}

function scoreDisplayName(name: string): number {
  let score = 0;
  if (/[\u00c0-\u017f]/.test(name)) score += 12;
  if (/\b(se\.|sc\.|maint\.)\b/i.test(name)) score -= 8;
  if (name.endsWith('.') && name.length < 20) score -= 4;
  if (name === name.toUpperCase() && name.length > 5) score -= 3;
  return score;
}

export function getCanonicalGradeLabels(): Map<string, string> {
  const map = new Map<string, string>();
  for (const label of RP_GRADE_NAMES) {
    const key = normalizeRoleLabel(label);
    const prev = map.get(key);
    if (!prev || scoreDisplayName(label) > scoreDisplayName(prev)) {
      map.set(key, label);
    }
  }
  return map;
}
