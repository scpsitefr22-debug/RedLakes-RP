import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Peuple Team depuis les gabarits deja definis dans
 * apps/web/src/data/site12.ts (securityTeams/medicalTeams/maintenanceTeams),
 * jamais migres en base jusqu'ici. Ajoute aussi les escouades FIM du
 * departement Securite : remplacement narratif direct des anciennes MTF
 * retirees au Lot 10 (voir docs/LORE-BIBLE.md) — generiques, rattachees a
 * un Department comme n'importe quelle autre equipe, pas une faction a part.
 */

interface TeamSeed {
  slug: string;
  name: string;
  departmentSlug: string;
  category: string;
  composition: string[];
  hasMedic?: boolean;
  customizableBy?: string;
  quota?: number;
  description?: string;
}

const teams: TeamSeed[] = [
  // ─── Securite — equipes de terrain (gabarits Excel) ──────────────────
  {
    slug: 'elite-01',
    name: 'TEAM ELITE : 01',
    departmentSlug: 'securite',
    category: 'Elite',
    composition: [
      'Sergent Elite',
      'Caporal Elite',
      'Soldat Elite ×3',
      'M/C Dr.',
    ],
    hasMedic: true,
    customizableBy: 'Directeur Sécurité, Commandant',
  },
  {
    slug: 'elite-02',
    name: 'TEAM ELITE : 02',
    departmentSlug: 'securite',
    category: 'Elite',
    composition: [
      'Sergent Elite',
      'Caporal Elite',
      'Soldat Elite ×3',
      'M/C Dr.',
    ],
    hasMedic: true,
    customizableBy: 'Directeur Sécurité, Commandant',
  },
  {
    slug: 'prestige-01',
    name: 'TEAM PRESTIGE : 01',
    departmentSlug: 'securite',
    category: 'Prestige',
    composition: [
      'Sergent Prestige',
      'Caporal Prestige',
      'Soldat Prestige ×3',
      'M/C Dr.',
    ],
    hasMedic: true,
    customizableBy: 'Adjoint-Directeur Sécurité, Commandant',
  },
  {
    slug: 'prestige-02',
    name: 'TEAM PRESTIGE : 02',
    departmentSlug: 'securite',
    category: 'Prestige',
    composition: [
      'Sergent Prestige',
      'Caporal Prestige',
      'Soldat Prestige ×3',
      'M/C Dr.',
    ],
    hasMedic: true,
    customizableBy: 'Adjoint-Directeur Sécurité, Commandant',
  },
  {
    slug: 'prestige-03',
    name: 'TEAM PRESTIGE : 03',
    departmentSlug: 'securite',
    category: 'Prestige',
    composition: [
      'Sergent Prestige',
      'Caporal Prestige',
      'Soldat Prestige ×3',
      'M/C Dr.',
    ],
    hasMedic: true,
    customizableBy: 'Commandant',
  },
  {
    slug: 'normal-01',
    name: 'TEAM NORMAL : 01',
    departmentSlug: 'securite',
    category: 'Normal',
    composition: ['Sergent', 'Caporal', 'Soldat ×3', 'M/C Dr.'],
    hasMedic: true,
    customizableBy: 'Commandant Patrouilles, Lieutenant',
  },
  {
    slug: 'normal-02',
    name: 'TEAM NORMAL : 02',
    departmentSlug: 'securite',
    category: 'Normal',
    composition: ['Sergent', 'Caporal', 'Soldat ×3'],
    customizableBy: 'Commandant Patrouilles, Lieutenant',
  },
  {
    slug: 'normal-03',
    name: 'TEAM NORMAL : 03',
    departmentSlug: 'securite',
    category: 'Normal',
    composition: ['Sergent', 'Caporal', 'Soldat ×3'],
    customizableBy: 'Lieutenant Sécurité',
  },
  {
    slug: 'normal-04',
    name: 'TEAM NORMAL : 04',
    departmentSlug: 'securite',
    category: 'Normal',
    composition: ['Sergent', 'Caporal', 'Soldat ×3'],
    customizableBy: 'Lieutenant Sécurité',
  },
  {
    slug: 'garde-01',
    name: 'TEAM GARDE : 01',
    departmentSlug: 'securite',
    category: 'Garde',
    composition: ['Caporal Garde', 'Soldat Garde ×3'],
    customizableBy: 'Responsable Garde D',
  },
  {
    slug: 'garde-02',
    name: 'TEAM GARDE : 02',
    departmentSlug: 'securite',
    category: 'Garde',
    composition: ['Caporal Garde', 'Soldat Garde ×3'],
    customizableBy: 'Responsable Garde D',
  },
  {
    slug: 'garde-03',
    name: 'TEAM GARDE : 03',
    departmentSlug: 'securite',
    category: 'Garde',
    composition: ['Caporal Garde', 'Soldat Garde ×3'],
    customizableBy: 'Responsable Garde D',
  },
  {
    slug: 'garde-04',
    name: 'TEAM GARDE : 04',
    departmentSlug: 'securite',
    category: 'Garde',
    composition: ['Caporal Garde', 'Soldat Garde ×3'],
    customizableBy: 'Responsable Garde D',
  },

  // ─── Securite — FIM (Forces d'Intervention Mobiles), stationnees en
  // permanence depuis la mise en service du Site-12 (2024) ──────────────
  {
    slug: 'fim-nu-7',
    name: 'FIM Nu-7 « Hammer Down »',
    departmentSlug: 'securite',
    category: 'FIM',
    composition: [
      'Commandant FIM',
      "Chef d'escouade FIM",
      'Opérateur FIM ×3',
      'Spécialiste FIM',
    ],
    quota: 24,
    customizableBy: 'Directeur Sécurité',
    description:
      "Unité d'assaut lourde spécialisée dans les opérations de grande envergure.",
  },
  {
    slug: 'fim-epsilon-11',
    name: 'FIM Epsilon-11 « Nine Tailed Fox »',
    departmentSlug: 'securite',
    category: 'FIM',
    composition: ['Commandant FIM', "Chef d'escouade FIM", 'Opérateur FIM ×3'],
    quota: 18,
    customizableBy: 'Directeur Sécurité',
    description: 'Unité de réponse aux brèches de confinement.',
  },
  {
    slug: 'fim-alpha-1',
    name: 'FIM Alpha-1 « Red Right Hand »',
    departmentSlug: 'securite',
    category: 'FIM',
    composition: ['Commandant FIM', "Chef d'escouade FIM", 'Opérateur FIM ×2'],
    quota: 12,
    customizableBy: 'Directeur Sécurité, Président du Conseil',
    description: "Unité d'élite directement sous l'autorité du Conseil Oméga.",
  },
  {
    slug: 'fim-beta-7',
    name: 'FIM Beta-7 « Maz Hatters »',
    departmentSlug: 'securite',
    category: 'FIM',
    composition: [
      'Commandant FIM',
      "Chef d'escouade FIM",
      'Spécialiste FIM ×3',
    ],
    quota: 15,
    customizableBy: 'Directeur Sécurité',
    description: 'Spécialisée dans les anomalies biologiques et chimiques.',
  },
  {
    slug: 'fim-zeta-9',
    name: 'FIM Zeta-9 « Mole Rats »',
    departmentSlug: 'securite',
    category: 'FIM',
    composition: ['Commandant FIM', "Chef d'escouade FIM", 'Opérateur FIM ×2'],
    quota: 10,
    customizableBy: 'Directeur Sécurité',
    description: "Unité d'exploration souterraine et de récupération.",
  },

  // ─── Recherche — equipes medicales ────────────────────────────────────
  {
    slug: 'mobile-01',
    name: 'TEAM MOBILE : 01',
    departmentSlug: 'recherche',
    category: 'Mobile',
    composition: ['M/C Dr.', 'Dr.', 'Médecin ×2'],
    customizableBy: 'Médecin en Chef, Directeur-Adjoint Médical',
  },
  {
    slug: 'mobile-02',
    name: 'TEAM MOBILE : 02',
    departmentSlug: 'recherche',
    category: 'Mobile',
    composition: ['M/C Dr.', 'Dr.', 'Médecin ×2'],
    customizableBy: 'Médecin en Chef',
  },
  {
    slug: 'mobile-03',
    name: 'TEAM MOBILE : 03',
    departmentSlug: 'recherche',
    category: 'Mobile',
    composition: ['M/C Dr.', 'Dr.', 'Médecin ×2'],
    customizableBy: "Superviseur d'Intervention",
  },
  {
    slug: 'psy',
    name: 'PSYCHOLOGUE',
    departmentSlug: 'recherche',
    category: 'Psychologie',
    composition: ['Psychologue ×3'],
    customizableBy: 'Médecin en Chef',
  },
  {
    slug: 'medecin',
    name: 'MEDECIN',
    departmentSlug: 'recherche',
    category: 'Soins',
    composition: ['Médecin ×3'],
    customizableBy: 'Chef de Com. en Soin',
  },

  // ─── Maintenance ───────────────────────────────────────────────────────
  {
    slug: 'entretien',
    name: 'EQUIPE ENTRETIEN',
    departmentSlug: 'maintenance',
    category: 'Entretien',
    composition: [
      'Chef Technicien',
      'Technicien',
      'Plombier',
      'Électricien',
      'Mécanicien',
    ],
    customizableBy: "Directeur Maintenance, Responsable d'Entretien",
  },
  {
    slug: 'livraison',
    name: 'EQUIPE LIVRAISON',
    departmentSlug: 'maintenance',
    category: 'Livraison',
    composition: ['Chef Réceptionniste', 'Travailleur ×2'],
    customizableBy: 'Responsable Livraison',
  },
  {
    slug: 'deplacement',
    name: 'EQUIPE DEPLACEMENT',
    departmentSlug: 'maintenance',
    category: 'Déplacement',
    composition: ['Déménageur en Chef', 'Travailleur ×2'],
    customizableBy: "Chef D'intervention",
  },
  {
    slug: 'commande',
    name: 'EQUIPE COMMANDE',
    departmentSlug: 'maintenance',
    category: 'Commande',
    composition: ['Chef de Commande ×3'],
    customizableBy: 'Chef de Commande, Com. de Maintenance',
  },
];

export async function seedTeams() {
  const departments = await prisma.department.findMany();
  const bySlug = new Map(departments.map((d) => [d.slug, d]));

  let seeded = 0;
  let skipped = 0;

  for (const t of teams) {
    const department = bySlug.get(t.departmentSlug);
    if (!department) {
      console.log(
        `  [département introuvable] "${t.departmentSlug}" pour équipe "${t.slug}"`,
      );
      skipped++;
      continue;
    }
    await prisma.team.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        departmentId: department.id,
        category: t.category,
        composition: t.composition,
        hasMedic: t.hasMedic ?? false,
        customizableBy: t.customizableBy,
        quota: t.quota,
        description: t.description,
      },
      create: {
        slug: t.slug,
        name: t.name,
        departmentId: department.id,
        category: t.category,
        composition: t.composition,
        hasMedic: t.hasMedic ?? false,
        customizableBy: t.customizableBy,
        quota: t.quota,
        description: t.description,
      },
    });
    seeded++;
  }

  console.log(`Teams seeded: ${seeded}, ${skipped} skipped.`);
}

if (require.main === module) {
  seedTeams()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
