import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Resout Grade.departmentRefId pour tous les grades existants a partir du
 * slug texte libre deja present dans Grade.departmentId (ex: "securite"),
 * en le faisant correspondre au slug reel de Department. Idempotent.
 * Grade.departmentId (le slug texte) n'est pas modifie ni supprime.
 */
export async function backfillGradeDepartments() {
  const departments = await prisma.department.findMany();
  const bySlug = new Map(departments.map((d) => [d.slug, d]));

  const grades = await prisma.grade.findMany({
    where: { departmentRefId: null, departmentId: { not: null } },
    select: { id: true, departmentId: true },
  });

  let matched = 0;
  let unmatched = 0;

  for (const grade of grades) {
    const department = grade.departmentId
      ? bySlug.get(grade.departmentId)
      : undefined;
    if (!department) {
      unmatched++;
      console.log(
        `  [sans correspondance] departementId="${grade.departmentId}"`,
      );
      continue;
    }
    await prisma.grade.update({
      where: { id: grade.id },
      data: { departmentRefId: department.id },
    });
    matched++;
  }

  console.log(
    `Backfill grade -> departement: ${matched} grade(s) resolus, ${unmatched} sans correspondance.`,
  );
}

if (require.main === module) {
  backfillGradeDepartments()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
