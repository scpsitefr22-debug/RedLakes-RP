import { Grade } from '@prisma/client';
import { ACCESS_ZONE_LABELS, SITE_SECTION_LABELS } from './grade-access-codes';

export type GradeAccessFields = Pick<
  Grade,
  'accessZones' | 'siteSections' | 'utilities' | 'clearanceLevel' | 'pay' | 'quota'
>;

function listDiff(
  label: string,
  before: string[],
  after: string[],
  names: Record<string, string> = {},
): string | null {
  const added = after.filter((x) => !before.includes(x));
  const removed = before.filter((x) => !after.includes(x));
  if (!added.length && !removed.length) return null;
  const name = (x: string) => names[x] ?? x;
  return `${label} : ${[...added.map((x) => `+${name(x)}`), ...removed.map((x) => `−${name(x)}`)].join(', ')}`;
}

/**
 * Differences lisibles entre deux etats d'un grade, pour le journal d'audit
 * (ex. ["Zones : +Keter, −A5", "Habilitation : 3 → 4"]). Un simple
 * changement d'ordre n'est pas une difference. Vide si rien n'a change.
 */
export function describeGradeChanges(
  before: GradeAccessFields,
  after: GradeAccessFields,
): string[] {
  const amount = (v: number | null) => (v === null ? 'aucun' : String(v));
  const lines = [
    listDiff('Zones', before.accessZones, after.accessZones, ACCESS_ZONE_LABELS),
    listDiff('Sections du site', before.siteSections, after.siteSections, SITE_SECTION_LABELS),
    listDiff('Domaines', before.utilities, after.utilities),
    before.clearanceLevel !== after.clearanceLevel
      ? `Habilitation : ${before.clearanceLevel} → ${after.clearanceLevel}`
      : null,
    before.pay !== after.pay ? `Salaire : ${amount(before.pay)} → ${amount(after.pay)}` : null,
    before.quota !== after.quota ? `Quota : ${amount(before.quota)} → ${amount(after.quota)}` : null,
  ];
  return lines.filter((line): line is string => line !== null);
}
