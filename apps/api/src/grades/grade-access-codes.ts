/**
 * Codes d'acces qu'un grade peut recevoir — miroir de apps/web/src/data/site12.ts
 * (accessZones) et de SITE_SECTION_LABELS (apps/web/src/lib/grade-access.ts).
 * L'API refuse tout autre code : une faute de frappe dans la grille ne doit
 * pas creer une zone que ni le site ni le plugin Minecraft ne connaissent.
 * Ordre = colonnes du tableau Site-12 (W.H. -> Maint.), reutilise pour ranger
 * les zones enregistrees.
 */
export const ACCESS_ZONE_LABELS: Record<string, string> = {
  wh: 'W.H.',
  o5: 'O5',
  gates: 'Gates',
  n5: 'N5',
  keter: 'Keter',
  a5: 'A5',
  a4: 'A4',
  euclid: 'Euclid',
  a3: 'A3',
  a2: 'A2',
  safe: 'Safe',
  a1: 'A1',
  n4: 'N4',
  n3: 'N3',
  n2: 'N2',
  n1: 'N1',
  arm3: 'Arm3',
  arm2: 'Arm2',
  arm1: 'Arm1',
  check: 'Check',
  inter: 'Inter.',
  maint: 'Maint.',
};

export const SITE_SECTION_LABELS: Record<string, string> = {
  overview: "Vue d'ensemble",
  fondation: 'Fondation SCP',
  omega: 'Conseil Oméga',
  direction: 'Direction Site-12',
  departements: 'Départements',
  securite: 'Sécurité',
  scientifique: 'Scientifique',
  maintenance: 'Maintenance',
  general: 'Général',
  teams: 'Équipes',
  chambers: 'Chambres SCP',
  experiences: 'Expériences',
  medical: 'Médical',
  armory: 'Armement',
  secretariat: 'Secrétariat',
  services: 'Services',
  detention: 'Personnel détenu',
  'access-matrix': "Matrice d'accès",
  mtf: 'Forces Mobiles',
  'transmissions-public': 'Transmissions (public)',
  'transmissions-restricted': 'Transmissions (restreint)',
  'transmissions-classified': 'Transmissions (classifié)',
};

export const ACCESS_ZONE_CODES = Object.keys(ACCESS_ZONE_LABELS);
export const SITE_SECTION_CODES = Object.keys(SITE_SECTION_LABELS);

/** Range les codes dans l'ordre de reference (doublons retires). */
export function sortCodes(codes: string[], reference: string[]): string[] {
  const unique = [...new Set(codes)];
  return unique.sort((a, b) => reference.indexOf(a) - reference.indexOf(b));
}
