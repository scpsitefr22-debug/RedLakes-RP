import { PrismaClient } from '@prisma/client';
import { normalizeGradeName } from '../src/grades/grades.service';
import { clearanceForGrade } from '../src/players/grade-clearance';

const prisma = new PrismaClient();

/**
 * Resout Player.gradeId pour tous les joueurs existants a partir de leur
 * Player.grade (texte libre), par correspondance normalisee avec le
 * catalogue Grade. Idempotent : ne touche pas les joueurs deja resolus.
 * Les grades sans correspondance (ex: "Civil") gardent gradeId=null et
 * conservent leur clearance actuelle (pas de resolveGrade cote client ici,
 * la clearance existante en base fait deja foi pour un joueur deja actif).
 */
export async function backfillPlayerGrades() {
  const grades = await prisma.grade.findMany();
  const byNormalizedName = new Map(
    grades.map((g) => [normalizeGradeName(g.name), g]),
  );

  const players = await prisma.player.findMany({
    where: { gradeId: null },
    select: { id: true, grade: true },
  });

  let matched = 0;
  let unmatched = 0;

  for (const player of players) {
    const grade = byNormalizedName.get(normalizeGradeName(player.grade));
    if (!grade) {
      unmatched++;
      console.log(
        `  [sans correspondance] "${player.grade}" (clearance actuelle conservee, fallback ${clearanceForGrade(player.grade)})`,
      );
      continue;
    }
    await prisma.player.update({
      where: { id: player.id },
      data: { gradeId: grade.id },
    });
    matched++;
  }

  console.log(
    `Backfill grades: ${matched} joueur(s) resolus, ${unmatched} sans correspondance.`,
  );
}

if (require.main === module) {
  backfillPlayerGrades()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
