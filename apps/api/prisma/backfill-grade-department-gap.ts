import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Resout les 14/85 grades identifies sans departement au Lot 4 (voir
 * docs/REDLAKES-CORE-SPEC.md). Deux causes distinctes, verifiees contre
 * les donnees reelles avant d'ecrire ce script :
 *
 * 1. Typo de source : 4 grades "scientifique" (Com. Scientifique, MEDECIN,
 *    MEDECIN TERRAIN, PSYCHOLOGUE) portent departmentId="scientifique" au
 *    lieu de "recherche" (le slug reel du Departement Scientifique, qui
 *    liste deja "Soin" dans ses utilities — ces grades y appartiennent).
 * 2. Categories jamais modelisees comme Department : Direction (O1) et
 *    les 4 postes "Conseiller" du Conseil Omega (O2-O5). Ces 4 postes
 *    Conseiller sont en realite les memes personnes qui dirigent chaque
 *    departement existant (confirme par la correspondance omegaTier :
 *    O2=securite, O3=recherche, O4=maintenance, O5=general, et par le
 *    texte "Missions" de chaque grade qui cite le directorGradeName du
 *    departement correspondant). Seul le President du Conseil (O1) et les
 *    2 grades de la branche "direction" (Adjoint-Directeur, DIRECTEUR DU
 *    SITE) n'ont aucun departement existant a rejoindre : creation d'un
 *    nouveau Departement "Direction".
 * 3. Class-B/D/S (branche "classes", detenus) : "Class-D / B / S" est deja
 *    liste comme utility du Departement Securite — ils y sont rattaches.
 *
 * Idempotent (upsert sur le departement, update cible sur les grades).
 * Grade.departmentId (le slug texte legacy) n'est pas modifie.
 */
export async function backfillGradeDepartmentGap() {
  const fondation = await prisma.faction.findUnique({
    where: { slug: 'fondation' },
  });

  const direction = await prisma.department.upsert({
    where: { slug: 'direction' },
    update: {
      name: 'Direction du Site',
      factionId: fondation?.id,
      omegaTier: 'O1',
      directorGradeName: 'Directeur du Site',
      color: '#facc15',
      utilities: [
        'Administration',
        'Supervision inter-departements',
        'Presidence du Conseil Omega',
      ],
    },
    create: {
      slug: 'direction',
      name: 'Direction du Site',
      factionId: fondation?.id,
      omegaTier: 'O1',
      directorGradeName: 'Directeur du Site',
      color: '#facc15',
      utilities: [
        'Administration',
        'Supervision inter-departements',
        'Presidence du Conseil Omega',
      ],
      objectives: [],
    },
  });

  const departments = await prisma.department.findMany();
  const bySlug = new Map(departments.map((d) => [d.slug, d]));

  const nameToSlug: Record<string, string> = {
    'Com. Scientifique': 'recherche',
    MEDECIN: 'recherche',
    'MEDECIN TERRAIN': 'recherche',
    PSYCHOLOGUE: 'recherche',
    'Class - B': 'securite',
    'Class - D': 'securite',
    'Class - S': 'securite',
    'Vice-Président — Sécurité (O2)': 'securite',
    'Conseiller — Sciences (O3)': 'recherche',
    'Conseiller — Maintenance (O4)': 'maintenance',
    'Conseiller — Services (O5)': 'general',
    'Adjoint-Directeur': direction.slug,
    'DIRECTEUR DU SITE': direction.slug,
    'Président du Conseil (O1)': direction.slug,
  };

  let matched = 0;
  let missing = 0;

  for (const [name, slug] of Object.entries(nameToSlug)) {
    const department = bySlug.get(slug);
    if (!department) {
      console.log(`  [departement introuvable] "${slug}" pour grade "${name}"`);
      missing++;
      continue;
    }
    const result = await prisma.grade.updateMany({
      where: { name, departmentRefId: null },
      data: { departmentRefId: department.id },
    });
    matched += result.count;
  }

  console.log(
    `Backfill gap grade -> departement : ${matched} grade(s) resolus, ${missing} departement(s) introuvable(s).`,
  );
}

if (require.main === module) {
  backfillGradeDepartmentGap()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
