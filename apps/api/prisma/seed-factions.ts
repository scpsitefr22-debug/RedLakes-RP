import { PrismaClient } from '@prisma/client';
import { factions } from '../../web/src/data/factions';
import { site12Departments as departments } from '../../web/src/data/site12';

const prisma = new PrismaClient();

export async function seedFactions() {
  for (const faction of factions) {
    await prisma.faction.upsert({
      where: { slug: faction.id },
      update: {
        name: faction.name,
        tagline: faction.tagline,
        description: faction.description,
        history: faction.history,
        color: faction.color,
        playable: faction.playable,
        objectives: faction.objectives,
      },
      create: {
        slug: faction.id,
        name: faction.name,
        tagline: faction.tagline,
        description: faction.description,
        history: faction.history,
        color: faction.color,
        playable: faction.playable,
        objectives: faction.objectives,
      },
    });
  }
  console.log(`Factions seeded: ${factions.length}`);

  const fondation = await prisma.faction.findUnique({
    where: { slug: 'fondation' },
  });

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { slug: dept.id },
      update: {
        name: dept.name,
        factionId: fondation?.id,
        omegaTier: dept.omega,
        directorGradeName: dept.director,
        color: dept.color,
        utilities: dept.utilities,
        objectives: dept.objectives ?? [],
        leadership: dept.leadership ?? [],
      },
      create: {
        slug: dept.id,
        name: dept.name,
        factionId: fondation?.id,
        omegaTier: dept.omega,
        directorGradeName: dept.director,
        color: dept.color,
        utilities: dept.utilities,
        objectives: dept.objectives ?? [],
        leadership: dept.leadership ?? [],
      },
    });
  }
  console.log(`Departements seeded: ${departments.length}`);
}

if (require.main === module) {
  seedFactions()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
