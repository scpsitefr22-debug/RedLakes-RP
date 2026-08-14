import { PrismaClient } from '@prisma/client';
import { rpGrades } from '../../web/src/data/rp-grades';

const prisma = new PrismaClient();

export async function seedGrades() {
  for (const grade of rpGrades) {
    await prisma.grade.upsert({
      where: { slug: grade.id },
      update: {
        name: grade.name,
        branch: grade.branch,
        tier: grade.tier,
        departmentId: grade.departmentId,
        pay: grade.pay,
        quota: grade.quota,
        clearance: grade.clearance,
        description: grade.description,
        objectives: grade.objectives,
        utilities: grade.utilities,
        accessZones: grade.accessZones,
        siteSections: grade.siteSections,
      },
      create: {
        slug: grade.id,
        name: grade.name,
        branch: grade.branch,
        tier: grade.tier,
        departmentId: grade.departmentId,
        pay: grade.pay,
        quota: grade.quota,
        clearance: grade.clearance,
        description: grade.description,
        objectives: grade.objectives,
        utilities: grade.utilities,
        accessZones: grade.accessZones,
        siteSections: grade.siteSections,
      },
    });
  }
  console.log(`Grades seeded: ${rpGrades.length}`);
}

if (require.main === module) {
  seedGrades()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
