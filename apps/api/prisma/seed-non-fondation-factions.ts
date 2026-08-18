import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Grades des 7 factions non-Fondation + Civil, transposes depuis le
 * catalogue de roles du bot Discord (apps/discord-bot/src/lib/
 * discord-role-catalog.ts, FACTION_GROUPS) vers de vraies donnees Grade/
 * Department en base — jusqu'ici seule la Fondation avait cette structure.
 * L'ordre des roles = rang (1 = plus haut).
 */
interface GroupDef {
  factionSlug: string;
  departmentLabel: string;
  color: string;
  roles: string[];
}

const GROUPS: GroupDef[] = [
  {
    factionSlug: 'aegis',
    departmentLabel: 'A.E.G.I.S.',
    color: '#c0c0c0',
    roles: [
      'Président du Directoire',
      'Membre du Directoire',
      'Inspecteur principal',
      'Inspecteur adjoint',
      'Analyste AEGIS',
      'Commandant de cellule',
      "Agent d'application",
    ],
  },
  {
    factionSlug: 'chaos',
    departmentLabel: 'Insurrection du Chaos',
    color: '#2d5016',
    roles: [
      'Commandant de secteur',
      'Officier du Chaos',
      'Chef de cellule',
      'Vétéran du Chaos',
      'Soldat Chaos',
      'Recrue Chaos',
    ],
  },
  {
    factionSlug: 'main-serpent',
    departmentLabel: 'Main du Serpent',
    color: '#4a0080',
    roles: ['Grand Maître', 'Archimage', 'Initié', 'Acolyte'],
  },
  {
    factionSlug: 'goc',
    departmentLabel: 'Global Occult Coalition',
    color: '#1a3a5c',
    roles: [
      'Directeur régional',
      'Officier de liaison',
      "Commandant d'unité",
      'Soldat GOC',
      'Technicien PSYCHE',
    ],
  },
  {
    factionSlug: 'civil',
    departmentLabel: 'Civil & Ville',
    color: '#6b7280',
    roles: [
      'Citoyen REDLAKES',
      'Nouvel arrivant',
      'Étudiant / Stagiaire',
      'Propriétaire / Patron',
      'Employé bar & loisirs',
      'Employé commerce',
      'Journaliste',
      'Rédacteur / Médias',
      'Directeur hôpital',
      'Médecin urgentiste',
      'Infirmier',
      'Paramedic / EMT',
      'Chauffeur / Transit',
      'Technicien municipal',
      'Ouvrier municipal',
    ],
  },
  {
    factionSlug: 'gouvernement',
    departmentLabel: 'Gouvernement municipal',
    color: '#1e3a5f',
    roles: [
      'Maire de REDLAKES',
      'City Manager',
      'Conseiller municipal',
      'Attaché administratif',
      'Employé municipal',
    ],
  },
  {
    factionSlug: 'police',
    departmentLabel: 'REDLAKES Police Department',
    color: '#2563eb',
    roles: [
      'Chief of Police',
      'Lieutenant',
      'Police Officer',
      'Deputy',
      'Detective',
      'Investigator',
    ],
  },
  {
    factionSlug: 'crime',
    departmentLabel: 'Crime organisé (global)',
    color: '#374151',
    roles: [
      'Gang Member',
      'Gang Boss',
      'Mafia Associate',
      'Mafia Don',
      'MC Member',
      'MC President',
      'Cartel Runner',
      'Cartel Boss',
      'Criminel indépendant',
    ],
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function seedNonFondationFactions() {
  await prisma.faction.upsert({
    where: { slug: 'civil' },
    update: {},
    create: {
      slug: 'civil',
      name: 'Civil & Ville',
      tagline: 'La vie continue à la surface, entre lumières et secrets.',
      description:
        'Habitants, commerçants, soignants et employés municipaux de RedLakes — le quotidien qui ignore tout de ce qui se passe sous terre.',
      color: '#6b7280',
      playable: true,
      objectives: [],
    },
  });

  let departmentCount = 0;
  let gradeCount = 0;

  for (const group of GROUPS) {
    const faction = await prisma.faction.findUnique({
      where: { slug: group.factionSlug },
    });
    if (!faction) {
      console.warn(`Faction "${group.factionSlug}" introuvable, groupe ignoré`);
      continue;
    }

    const departmentSlug = `${group.factionSlug}-general`;
    const department = await prisma.department.upsert({
      where: { slug: departmentSlug },
      update: {
        name: group.departmentLabel,
        factionId: faction.id,
        directorGradeName: group.roles[0],
        color: group.color,
      },
      create: {
        slug: departmentSlug,
        name: group.departmentLabel,
        factionId: faction.id,
        directorGradeName: group.roles[0],
        color: group.color,
        utilities: [],
        objectives: [],
      },
    });
    departmentCount += 1;

    for (const [i, roleName] of group.roles.entries()) {
      const slug = `${group.factionSlug}-${slugify(roleName)}`;
      await prisma.grade.upsert({
        where: { slug },
        update: {
          name: roleName,
          branch: group.factionSlug,
          tier: String(i + 1),
          departmentRefId: department.id,
        },
        create: {
          slug,
          name: roleName,
          branch: group.factionSlug,
          tier: String(i + 1),
          departmentRefId: department.id,
          objectives: [],
          utilities: [],
          accessZones: [],
          siteSections: [],
        },
      });
      gradeCount += 1;
    }
  }

  console.log(
    `Factions non-Fondation : ${departmentCount} départements, ${gradeCount} grades seedés (+ Civil créée)`,
  );
}

if (require.main === module) {
  seedNonFondationFactions()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
