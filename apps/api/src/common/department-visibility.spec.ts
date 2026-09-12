import {
  filterByClearance,
  filterByDepartment,
  isVisibleToDepartment,
  meetsClearance,
  redactAddendums,
} from './department-visibility';

describe('isVisibleToDepartment', () => {
  it('treats an empty restriction list as public, even for an anonymous visitor', () => {
    expect(isVisibleToDepartment([], null)).toBe(true);
  });

  it('treats an empty restriction list as public for any department', () => {
    expect(isVisibleToDepartment([], 'dept-a')).toBe(true);
  });

  it('blocks an anonymous visitor (null department) from restricted content', () => {
    expect(isVisibleToDepartment(['dept-a'], null)).toBe(false);
  });

  it('blocks a department not in the restriction list', () => {
    expect(isVisibleToDepartment(['dept-a', 'dept-b'], 'dept-c')).toBe(false);
  });

  it('allows a department that is in the restriction list', () => {
    expect(isVisibleToDepartment(['dept-a', 'dept-b'], 'dept-b')).toBe(true);
  });
});

describe('filterByDepartment', () => {
  const items = [
    { id: 1, restrictedDepartmentIds: [] },
    { id: 2, restrictedDepartmentIds: ['dept-a'] },
    { id: 3, restrictedDepartmentIds: ['dept-b'] },
  ];

  it('keeps only public items for an anonymous visitor', () => {
    expect(filterByDepartment(items, null).map((i) => i.id)).toEqual([1]);
  });

  it('keeps public items plus items restricted to the visitor own department', () => {
    expect(filterByDepartment(items, 'dept-a').map((i) => i.id)).toEqual([1, 2]);
  });

  it('never leaks an item restricted to a different department', () => {
    const visible = filterByDepartment(items, 'dept-a');
    expect(visible.some((i) => i.id === 3)).toBe(false);
  });

  it('preserves input order and handles an empty list', () => {
    expect(filterByDepartment([], 'dept-a')).toEqual([]);
  });
});

describe('meetsClearance', () => {
  it('allows a clearance level exactly equal to the requirement', () => {
    expect(meetsClearance(3, 3)).toBe(true);
  });

  it('allows a clearance level above the requirement', () => {
    expect(meetsClearance(3, 5)).toBe(true);
  });

  it('blocks a clearance level below the requirement', () => {
    expect(meetsClearance(3, 2)).toBe(false);
  });

  it('never requires more than level 1 by default (no-op requirement)', () => {
    expect(meetsClearance(1, 1)).toBe(true);
  });
});

describe('filterByClearance', () => {
  const items = [
    { id: 1, minClearanceLevel: 1 },
    { id: 2, minClearanceLevel: 3 },
    { id: 3, minClearanceLevel: 5 },
  ];

  it('a low-clearance reader only sees items requiring at most their level', () => {
    expect(filterByClearance(items, 1).map((i) => i.id)).toEqual([1]);
  });

  it('a mid-clearance reader never sees a higher-requirement item', () => {
    const visible = filterByClearance(items, 3);
    expect(visible.map((i) => i.id)).toEqual([1, 2]);
    expect(visible.some((i) => i.id === 3)).toBe(false);
  });

  it('a max-clearance reader sees everything', () => {
    expect(filterByClearance(items, 5).map((i) => i.id)).toEqual([1, 2, 3]);
  });
});

describe('department + clearance are independent axes', () => {
  it('a high clearance level never substitutes for the right department', () => {
    const item = { restrictedDepartmentIds: ['dept-a'], minClearanceLevel: 1 };
    const wrongDeptHighClearance =
      isVisibleToDepartment(item.restrictedDepartmentIds, 'dept-b') &&
      meetsClearance(item.minClearanceLevel, 5);
    expect(wrongDeptHighClearance).toBe(false);
  });

  it('the right department never substitutes for enough clearance', () => {
    const item = { restrictedDepartmentIds: ['dept-a'], minClearanceLevel: 5 };
    const rightDeptLowClearance =
      isVisibleToDepartment(item.restrictedDepartmentIds, 'dept-a') &&
      meetsClearance(item.minClearanceLevel, 1);
    expect(rightDeptLowClearance).toBe(false);
  });
});

describe('redactAddendums', () => {
  const scp = {
    addendums: [
      { author: 'Dr. A', content: 'Public note' },
      { author: 'Dr. B', content: 'Secret note', restrictedDepartmentIds: ['dept-a'] },
    ],
  };

  it('leaves an unrestricted addendum untouched', () => {
    const result = redactAddendums(scp, null);
    expect(result.addendums[0]).toEqual({ author: 'Dr. A', content: 'Public note' });
  });

  it('redacts a restricted addendum for the wrong department, keeping only the author', () => {
    const result = redactAddendums(scp, 'dept-b');
    expect(result.addendums[1]).toEqual({ author: 'Dr. B', redacted: true });
  });

  it('never leaks the redacted content itself', () => {
    const result = redactAddendums(scp, 'dept-b') as unknown as {
      addendums: Record<string, unknown>[];
    };
    expect(result.addendums[1]).not.toHaveProperty('content');
  });

  it('reveals a restricted addendum to the right department', () => {
    const result = redactAddendums(scp, 'dept-a');
    expect(result.addendums[1]).toEqual({
      author: 'Dr. B',
      content: 'Secret note',
      restrictedDepartmentIds: ['dept-a'],
    });
  });

  it('treats a non-array addendums field as empty rather than throwing', () => {
    const result = redactAddendums({ addendums: null }, 'dept-a');
    expect(result.addendums).toEqual([]);
  });
});
