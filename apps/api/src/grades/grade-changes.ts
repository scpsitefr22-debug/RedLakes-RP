import { Grade } from '@prisma/client';
import { ACCESS_ZONE_LABELS, SITE_SECTION_LABELS, branchLabel } from './grade-access-codes';

export type GradeAccessFields = Pick<
  Grade,
  | 'accessZones'
  | 'siteSections'
  | 'utilities'
  | 'clearanceLevel'
  | 'pay'
  | 'quota'
  | 'branch'
  | 'archivedAt'
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
 * changement d'ordre n'est pas une difference ; la place dans la hierarchie
 * est decrite a part, par branche (voir movedInOrder). Vide si rien n'a change.
 */
export function describeGradeChanges(
  before: GradeAccessFields,
  after: GradeAccessFields,
): string[] {
  const amount = (v: number | null) => (v === null ? 'aucun' : String(v));
  const lines = [
    !before.archivedAt && after.archivedAt ? 'Retiré du site' : null,
    before.archivedAt && !after.archivedAt ? 'Remis sur le site' : null,
    before.branch !== after.branch
      ? `Branche : ${branchLabel(before.branch)} → ${branchLabel(after.branch)}`
      : null,
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

/**
 * Grades qui ont vraiment ete deplaces entre deux ordres d'une meme branche :
 * ceux qui sortent de la plus longue suite restee dans le meme ordre. Glisser
 * un grade de la 9e a la 2e place decale tous ceux d'entre les deux, mais
 * seul le grade glisse est signale.
 */
export function movedInOrder(before: string[], after: string[]): string[] {
  const common = after.filter((id) => before.includes(id));
  const positions = common.map((id) => before.indexOf(id));
  // Plus longue sous-suite croissante (n petit : O(n²) suffit).
  const length = positions.map(() => 1);
  const previous = positions.map(() => -1);
  for (let i = 0; i < positions.length; i++) {
    for (let j = 0; j < i; j++) {
      if (positions[j] < positions[i] && length[j] + 1 > length[i]) {
        length[i] = length[j] + 1;
        previous[i] = j;
      }
    }
  }
  const kept = new Set<string>();
  let k = length.indexOf(Math.max(0, ...length));
  while (k !== -1) {
    kept.add(common[k]);
    k = previous[k];
  }
  return common.filter((id) => !kept.has(id));
}

export const rank = (n: number) => (n === 1 ? '1er' : `${n}e`);
