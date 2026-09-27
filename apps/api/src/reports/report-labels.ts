import { PersonnelReportType } from '@prisma/client';

/**
 * Vocabulaire des types de rapport par faction (« Rapport d'intervention »
 * pour la Police, « Présage rompu » pour la Main du Serpent...), servi au
 * plugin Minecraft via GET /sync/minecraft/:uuid.
 *
 * Copie de apps/web/src/lib/faction-theme.ts (reportLabels) au 27/09/2026 :
 * le site garde encore sa propre table. Dette connue — à terme le site
 * devrait lire celle-ci plutôt que la dupliquer. Modifier les deux ensemble.
 */
export type ReportTypeLabels = Record<PersonnelReportType, string>;

export const DEFAULT_REPORT_LABELS: ReportTypeLabels = {
  INCIDENT: "Rapport d'incident",
  AUTHORIZATION: "Demande d'autorisation",
  MEMO: 'Mémo interne',
  EQUIPMENT: 'Réquisition matériel',
};

const FACTION_REPORT_LABELS: Record<string, ReportTypeLabels> = {
  police: {
    INCIDENT: "Rapport d'intervention",
    AUTHORIZATION: 'Mandat / autorisation',
    MEMO: 'Note de service',
    EQUIPMENT: 'Réquisition matériel',
  },
  gouvernement: {
    INCIDENT: 'Signalement',
    AUTHORIZATION: 'Décret / autorisation',
    MEMO: 'Communiqué interne',
    EQUIPMENT: 'Demande de budget',
  },
  crime: {
    INCIDENT: 'Problème sur le territoire',
    AUTHORIZATION: 'Feu vert du patron',
    MEMO: 'Message codé',
    EQUIPMENT: 'Approvisionnement',
  },
  chaos: {
    INCIDENT: "Rapport d'opération",
    AUTHORIZATION: 'Ordre de cellule',
    MEMO: 'Transmission libre',
    EQUIPMENT: "Réquisition d'armement",
  },
  aegis: {
    INCIDENT: 'Signalement de dérive',
    AUTHORIZATION: "Mandat d'enquête",
    MEMO: 'Note de supervision',
    EQUIPMENT: 'Réquisition',
  },
  goc: {
    INCIDENT: "Rapport d'anomalie",
    AUTHORIZATION: 'Ordre de mission',
    MEMO: 'Note opérationnelle',
    EQUIPMENT: 'Réquisition PSYCHE',
  },
  'main-serpent': {
    INCIDENT: 'Présage rompu',
    AUTHORIZATION: "Sceau d'autorisation",
    MEMO: 'Missive',
    EQUIPMENT: 'Offrande requise',
  },
  civil: {
    INCIDENT: 'Signalement citoyen',
    AUTHORIZATION: 'Demande de permis',
    MEMO: 'Message au conseil',
    EQUIPMENT: 'Demande de matériel',
  },
};

export function reportLabelsForFaction(
  slug: string | null | undefined,
): ReportTypeLabels {
  return (slug && FACTION_REPORT_LABELS[slug]) || DEFAULT_REPORT_LABELS;
}
