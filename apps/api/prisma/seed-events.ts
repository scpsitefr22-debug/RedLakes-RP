import { PrismaClient } from '@prisma/client';
import { gameEvents } from '../../web/src/data/lore';

const prisma = new PrismaClient();

export async function seedGameEvents() {
  for (const e of gameEvents) {
    await prisma.gameEvent.upsert({
      where: { slug: e.id },
      update: {
        title: e.title,
        date: new Date(e.date),
        type: e.type,
        description: e.description,
        casualties: e.casualties,
        outcome: e.outcome,
      },
      create: {
        slug: e.id,
        title: e.title,
        date: new Date(e.date),
        type: e.type,
        description: e.description,
        casualties: e.casualties,
        outcome: e.outcome,
      },
    });
  }
  console.log(`Game events seeded: ${gameEvents.length}`);
}

if (require.main === module) {
  seedGameEvents()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
