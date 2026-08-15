import { PrismaClient } from '@prisma/client';
import { mapLocations } from '../../web/src/data/map';

const prisma = new PrismaClient();

/**
 * Corrige au passage la meme incoherence deja resolue ailleurs cette session
 * (seed.ts, LoreArticle "site-12-fondation") : Site-12 n'a pas ete "fonde en
 * 1962", il a ete construit 2017-2023 et mis en service en 2024.
 */
const HISTORY_OVERRIDES: Record<string, string> = {
  'site-12':
    'Construit entre 2017 et 2023, mis en service en 2024 sous la métropole de RedLake. Centre névralgique de REDLAKES.',
};

export async function seedMapLocations() {
  for (const loc of mapLocations) {
    const history = HISTORY_OVERRIDES[loc.id] ?? loc.history;
    await prisma.mapLocation.upsert({
      where: { slug: loc.id },
      update: {
        name: loc.name,
        type: loc.type,
        x: loc.x,
        y: loc.y,
        description: loc.description,
        history,
        danger: loc.danger,
        faction: loc.faction,
      },
      create: {
        slug: loc.id,
        name: loc.name,
        type: loc.type,
        x: loc.x,
        y: loc.y,
        description: loc.description,
        history,
        danger: loc.danger,
        faction: loc.faction,
      },
    });
  }
  console.log(`Map locations seeded: ${mapLocations.length}`);
}

if (require.main === module) {
  seedMapLocations()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
