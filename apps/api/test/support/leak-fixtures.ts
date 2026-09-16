import { PrismaService } from '../../src/prisma/prisma.service';

/**
 * Scaffolding partage par tous les specs anti-fuite (classified-documents,
 * scp, lore, characters, events) : 2 departements + 3 grades + 4 comptes de
 * test couvrant les combinaisons departement/habilitation utiles a ces
 * scenarios. Le contenu (documents/SCP/articles/...) reste cree et nettoye
 * dans chaque spec — seule cette partie est identique partout.
 */
export interface LeakFixtures {
  deptA: { id: string };
  deptB: { id: string };
  /** Connecte, sans personnage actif — memes droits qu'un visiteur anonyme. */
  tokenNoCharacter: string;
  /** Departement A, habilitation minimale (1). */
  tokenDeptALow: string;
  /** Departement A, habilitation maximale (5). */
  tokenDeptAHigh: string;
  /** Departement B, habilitation maximale (5) — pour verifier qu'une forte
   * habilitation ne remplace jamais le bon departement. */
  tokenDeptBHigh: string;
  createdUserIds: string[];
}

export async function setupLeakFixtures(
  prisma: PrismaService,
  runId: string,
): Promise<LeakFixtures> {
  const deptA = await prisma.department.create({
    data: { slug: `${runId}-dept-a`, name: `${runId} Dept A` },
  });
  const deptB = await prisma.department.create({
    data: { slug: `${runId}-dept-b`, name: `${runId} Dept B` },
  });

  const gradeDeptALow = await prisma.grade.create({
    data: {
      slug: `${runId}-grade-a-low`,
      name: 'Test A Low',
      branch: 'Test',
      tier: 'Test',
      clearanceLevel: 1,
      departmentRefId: deptA.id,
    },
  });
  const gradeDeptAHigh = await prisma.grade.create({
    data: {
      slug: `${runId}-grade-a-high`,
      name: 'Test A High',
      branch: 'Test',
      tier: 'Test',
      clearanceLevel: 5,
      departmentRefId: deptA.id,
    },
  });
  const gradeDeptBHigh = await prisma.grade.create({
    data: {
      slug: `${runId}-grade-b-high`,
      name: 'Test B High',
      branch: 'Test',
      tier: 'Test',
      clearanceLevel: 5,
      departmentRefId: deptB.id,
    },
  });

  const createdUserIds: string[] = [];
  const makeAgent = async (label: string, gradeId?: string) => {
    const user = await prisma.user.create({
      data: { minecraftUsername: `${runId}-${label}`, role: 'PLAYER' },
    });
    createdUserIds.push(user.id);
    if (gradeId) {
      const player = await prisma.player.create({ data: { userId: user.id, gradeId } });
      await prisma.user.update({ where: { id: user.id }, data: { activeCharacterId: player.id } });
    }
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: `${runId}-token-${label}`,
        expiresAt: new Date(Date.now() + 3_600_000),
      },
    });
    return session.token;
  };

  const tokenNoCharacter = await makeAgent('no-character');
  const tokenDeptALow = await makeAgent('dept-a-low', gradeDeptALow.id);
  const tokenDeptAHigh = await makeAgent('dept-a-high', gradeDeptAHigh.id);
  const tokenDeptBHigh = await makeAgent('dept-b-high', gradeDeptBHigh.id);

  return {
    deptA,
    deptB,
    tokenNoCharacter,
    tokenDeptALow,
    tokenDeptAHigh,
    tokenDeptBHigh,
    createdUserIds,
  };
}

export async function teardownLeakFixtures(
  prisma: PrismaService,
  runId: string,
  createdUserIds: string[],
) {
  await prisma.session.deleteMany({ where: { token: { startsWith: `${runId}-token-` } } });
  await prisma.user.updateMany({
    where: { id: { in: createdUserIds } },
    data: { activeCharacterId: null },
  });
  await prisma.player.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await prisma.grade.deleteMany({ where: { slug: { startsWith: runId } } });
  await prisma.department.deleteMany({ where: { slug: { startsWith: runId } } });
}

export const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });
