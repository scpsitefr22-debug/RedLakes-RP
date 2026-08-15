import {
  PrismaClient,
  LoreCategory,
  LoreStatus,
  UserRole,
} from '@prisma/client';
import { seedGrades } from './seed-grades';
import { seedFactions } from './seed-factions';
import { seedTeams } from './seed-teams';
import { seedScpObjects } from './seed-scp';
import { seedCharacters } from './seed-characters';
import { seedGameEvents } from './seed-events';
import { seedNews } from './seed-news';

const prisma = new PrismaClient();

async function main() {
  await seedGrades();
  await seedFactions();
  await seedTeams();
  await seedScpObjects();
  await seedCharacters();
  await seedGameEvents();
  await seedNews();

  const admin = await prisma.user.upsert({
    where: { minecraftUsername: 'Directeur_Site' },
    update: {},
    create: {
      minecraftUsername: 'Directeur_Site',
      minecraftUuid: '00000000-0000-0000-0000-000000000001',
      role: UserRole.ADMIN,
      player: {
        create: {
          grade: 'Directeur du Site',
          faction: 'Fondation SCP',
          playtime: 120000,
          reputation: 95,
          clearance: 5,
          medals: ['Médaille du Confinement', 'Étoile de Sécurité'],
          achievements: [
            { name: 'Fondateur Site-12', date: '2019-01-01' },
            { name: 'Survivant Brèche Keter', date: '2015-07-22' },
          ],
        },
      },
    },
  });

  const loreArticles = [
    {
      slug: 'histoire-monde',
      title: 'Histoire du Monde',
      excerpt:
        'Le monde de REDLAKES où les anomalies sont réelles mais secrètes.',
      content:
        "Le monde de REDLAKES existe dans une réalité où les anomalies sont réelles mais secrètes. La Fondation SCP opère depuis l'ombre, tandis que gouvernements, organisations rivales et forces occultes tentent d'influencer le destin de l'humanité.\n\nSur le serveur Minecraft, chaque joueur incarne un acteur de cet univers : agent de sécurité, chercheur, civil, membre du crime organisé ou agent AEGIS.",
      category: LoreCategory.MONDE,
      status: LoreStatus.PUBLISHED,
      clearance: 1,
      featured: true,
      tags: ['lore', 'monde', 'introduction'],
      publishedAt: new Date(),
    },
    {
      slug: 'aegis-mandat',
      title: 'A.E.G.I.S. — Mandat Officiel',
      excerpt:
        "La Fondation protège l'humanité. AEGIS décide jusqu'où elle a le droit d'aller.",
      content:
        "A.E.G.I.S. (Autorité Exécutive de Garantie des Intérêts Suprêmes) est une instance supranationale de contrôle.\n\nElle ne contient pas les anomalies — elle contient ceux qui les contiennent.\n\nHiérarchie :\n- Niveau 1 : Directoire AEGIS (3-5 membres)\n- Niveau 2 : Inspecteurs AEGIS (jouable)\n- Niveau 3 : Cellules d'Application (events)\n\nProtocoles d'audit : Observation → Restriction → Conformité Forcée → Défaillance.",
      category: LoreCategory.FACTION,
      status: LoreStatus.PUBLISHED,
      clearance: 4,
      featured: true,
      tags: ['aegis', 'faction', 'lore'],
      publishedAt: new Date(),
    },
    {
      slug: 'site-12-fondation',
      title: 'Site-12 — Branche Principale',
      excerpt:
        'Complexe principal de REDLAKES avec 70+ grades et 4 départements.',
      content:
        'Le Site-12 est la branche principale du serveur Minecraft REDLAKES RP. Construit entre 2017 et 2023 puis mis en service en 2024 sous la métropole de RedLake, il est aujourd\'hui le dernier grand bastion de la Fondation. Il abrite le Conseil Oméga, les départements Sécurité, Recherche, Maintenance et Général.\n\nLa hiérarchie complète est disponible sur le site dans la section Départements.',
      category: LoreCategory.SITE,
      status: LoreStatus.PUBLISHED,
      clearance: 1,
      tags: ['site-12', 'fondation'],
      publishedAt: new Date(),
    },
    {
      slug: 'breach-keter-2026',
      title: 'Brèche Secteur Keter-02',
      excerpt: 'Incident de confinement de juin 2026 — 47 minutes de crise.',
      content:
        'Le 15 juin 2026, une brèche partielle a été contenue après 47 minutes dans le Secteur Keter-02. Le personnel Class-D a subi des pertes documentées.\n\nSuite à cet incident, AEGIS a déclenché un audit de niveau 3 — Conformité Forcée.',
      category: LoreCategory.EVENEMENT,
      status: LoreStatus.PUBLISHED,
      clearance: 2,
      tags: ['evenement', 'breach', 'keter'],
      publishedAt: new Date('2026-06-15'),
    },
  ];

  for (const article of loreArticles) {
    await prisma.loreArticle.upsert({
      where: { slug: article.slug },
      update: article,
      create: { ...article, authorId: admin.id },
    });
  }

  const assets = [
    {
      title: 'Brèche Secteur Keter',
      url: '/gallery/breach-keter.svg',
      faction: 'Fondation SCP',
      type: 'evenement',
    },
    {
      title: 'Déploiement FIM Nu-7',
      url: '/gallery/mtf-nu7.svg',
      faction: 'FIM',
      type: 'evenement',
    },
    {
      title: 'Confinement SCP-173',
      url: '/gallery/scp-173.svg',
      faction: 'Fondation SCP',
      type: 'scp',
    },
    {
      title: 'Audit AEGIS Site-12',
      url: '/gallery/aegis-audit.svg',
      faction: 'A.E.G.I.S.',
      type: 'evenement',
    },
    {
      title: 'Ville de REDLAKES',
      url: '/gallery/city.svg',
      faction: 'Gouvernement',
      type: 'screenshot',
    },
    {
      title: "Réseau d'Égouts",
      url: '/gallery/sewers.svg',
      faction: 'Main du Serpent',
      type: 'screenshot',
    },
  ];

  for (const asset of assets) {
    const existing = await prisma.galleryAsset.findFirst({
      where: { title: asset.title },
    });
    if (!existing) {
      await prisma.galleryAsset.create({ data: asset });
    }
  }

  console.log('Seed completed.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
