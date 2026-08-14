import { PrismaClient } from '@prisma/client';
import { normalizeGradeName } from '../src/grades/grades.service';

const prisma = new PrismaClient();

/**
 * Resout Player.factionId pour tous les joueurs existants a partir de leur
 * Player.faction (texte libre), par correspondance normalisee avec le
 * catalogue Faction. Idempotent. Les factions sans correspondance (ex:
 * "Civil", qui n'est pas une faction jouable du catalogue) gardent
 * factionId=null sans que rien d'autre ne soit modifie.
 */
export async function backfillPlayerFactions() {
  const factions = await prisma.faction.findMany();
  const byNormalizedName = new Map(
    factions.map((f) => [normalizeGradeName(f.name), f]),
  );

  const players = await prisma.player.findMany({
    where: { factionId: null },
    select: { id: true, faction: true },
  });

  let matched = 0;
  let unmatched = 0;

  for (const player of players) {
    const faction = byNormalizedName.get(normalizeGradeName(player.faction));
    if (!faction) {
      unmatched++;
      console.log(`  [sans correspondance] "${player.faction}"`);
      continue;
    }
    await prisma.player.update({
      where: { id: player.id },
      data: { factionId: faction.id },
    });
    matched++;
  }

  console.log(
    `Backfill factions: ${matched} joueur(s) resolus, ${unmatched} sans correspondance.`,
  );
}

if (require.main === module) {
  backfillPlayerFactions()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
