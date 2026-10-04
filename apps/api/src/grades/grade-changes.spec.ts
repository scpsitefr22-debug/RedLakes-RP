import { describeGradeChanges, GradeAccessFields } from './grade-changes';
import { sortCodes, ACCESS_ZONE_CODES } from './grade-access-codes';

const base: GradeAccessFields = {
  accessZones: ['n2', 'n1'],
  siteSections: ['overview'],
  utilities: [],
  clearanceLevel: 2,
  pay: 1600,
  quota: 39,
};

describe('describeGradeChanges', () => {
  it('returns nothing when only the order changed', () => {
    expect(describeGradeChanges(base, { ...base, accessZones: ['n1', 'n2'] })).toEqual([]);
  });

  it('lists added and removed zones with their sheet labels', () => {
    expect(describeGradeChanges(base, { ...base, accessZones: ['n1', 'wh', 'inter'] })).toEqual([
      'Zones : +W.H., +Inter., −N2',
    ]);
  });

  it('describes sections, domains, clearance, pay and quota', () => {
    const after: GradeAccessFields = {
      ...base,
      siteSections: ['overview', 'armory'],
      utilities: ['Nuke'],
      clearanceLevel: 4,
      pay: null,
      quota: 2,
    };
    expect(describeGradeChanges(base, after)).toEqual([
      'Sections du site : +Armement',
      'Domaines : +Nuke',
      'Habilitation : 2 → 4',
      'Salaire : 1600 → aucun',
      'Quota : 39 → 2',
    ]);
  });
});

describe('sortCodes', () => {
  it('follows the sheet column order and drops duplicates', () => {
    expect(sortCodes(['maint', 'wh', 'n1', 'wh'], ACCESS_ZONE_CODES)).toEqual(['wh', 'n1', 'maint']);
  });
});
