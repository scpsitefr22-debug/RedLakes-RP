import { PrismaClient } from '@prisma/client';

interface HasAddendums {
  addendums: { author: string; content: string; restrictedDepartmentIds?: string[] }[];
}

/**
 * Marque les addendums signes "Conseil O5" comme reserves au departement
 * "direction" (habilitation la plus elevee du Site-12). Utilise par les
 * scripts seed-scp-expansion*.ts avant l'upsert.
 */
export async function withO5Restrictions<T extends HasAddendums>(
  prisma: PrismaClient,
  entries: T[],
): Promise<T[]> {
  const direction = await prisma.department.findUnique({ where: { slug: 'direction' } });
  if (!direction) return entries;

  return entries.map((entry) => ({
    ...entry,
    addendums: entry.addendums.map((addendum) =>
      /o5/i.test(addendum.author)
        ? { ...addendum, restrictedDepartmentIds: [direction.id] }
        : addendum,
    ),
  }));
}
