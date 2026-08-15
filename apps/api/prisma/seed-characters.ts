import { PrismaClient } from '@prisma/client';
import { characters } from '../../web/src/data/lore';

const prisma = new PrismaClient();

export async function seedCharacters() {
  for (const c of characters) {
    await prisma.character.upsert({
      where: { slug: c.id },
      update: {
        name: c.name,
        title: c.title,
        faction: c.faction,
        biography: c.biography,
        quotes: c.quotes,
        history: c.history,
        portrait: c.portrait,
        clearance: c.clearance,
      },
      create: {
        slug: c.id,
        name: c.name,
        title: c.title,
        faction: c.faction,
        biography: c.biography,
        quotes: c.quotes,
        history: c.history,
        portrait: c.portrait,
        clearance: c.clearance,
      },
    });
  }
  console.log(`Characters seeded: ${characters.length}`);
}

if (require.main === module) {
  seedCharacters()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
