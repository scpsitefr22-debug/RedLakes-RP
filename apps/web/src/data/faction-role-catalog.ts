/**
 * Catégories de rôles par faction — affichage site (onglets Factions).
 * Fondation : généré depuis rp-grades.ts (Google Sheet Site-12).
 */
import { rpGrades, type RpBranch } from "./rp-grades";
import { honoraryTitles, isHonoraryGradeName, redlakesRpRules } from "./redlakes-rp-rules";

export interface FactionRoleEntry {
  name: string;
  description: string;
  missions?: string[];
  clearance?: 1 | 2 | 3 | 4 | 5;
  /** Sections du site accessibles avec ce rôle */
  siteAccess?: string[];
  pay?: number | null;
  quota?: number | null;
}

export interface FactionRoleCategory {
  id: string;
  label: string;
  summary: string;
  color: string;
  roles: FactionRoleEntry[];
}

const BRANCH_META: Record<
  RpBranch,
  { label: string; summary: string; color: string }
> = {
  omega: {
    label: "Conseil Oméga",
    summary: "Autorité suprême du Site-12. Promotions au mérite RP, pas de niveaux automatiques.",
    color: "#8b0a0a",
  },
  direction: {
    label: "Direction",
    summary: "Direction opérationnelle du site, sous l'autorité du Conseil.",
    color: "#991b1b",
  },
  securite: {
    label: "Sécurité",
    summary: "Protection du site, confinement SCP, équipes d'intervention et armurerie.",
    color: "#1e40af",
  },
  scientifique: {
    label: "Scientifique",
    summary: "Recherche, expériences, chambres SCP, archives et personnel médical.",
    color: "#15803d",
  },
  maintenance: {
    label: "Maintenance",
    summary: "Entretien, réparation, livraison et équipes techniques.",
    color: "#c2410c",
  },
  general: {
    label: "Général",
    summary: "Secrétariat, restauration, nettoyage, communication interne.",
    color: "#6b7280",
  },
  classes: {
    label: "Personnel détenu",
    summary: "Class-D, Class-B et Class-S — personnel de confinement.",
    color: "#374151",
  },
};

const SITE_LABELS: Record<string, string> = {
  overview: "Vue d'ensemble",
  fondation: "Fondation",
  omega: "Conseil Oméga",
  direction: "Direction",
  departements: "Départements",
  securite: "Sécurité",
  scientifique: "Scientifique",
  maintenance: "Maintenance",
  general: "Général",
  teams: "Équipes",
  chambers: "Chambres SCP",
  experiences: "Expériences",
  medical: "Médical",
  armory: "Armement",
  secretariat: "Secrétariat",
  services: "Services",
  detention: "Détention",
  "access-matrix": "Matrice d'accès",
  mtf: "Forces Mobiles",
  "transmissions-public": "Transmissions",
  "transmissions-restricted": "Transmissions restreintes",
  "transmissions-classified": "Transmissions classifiées",
};

function buildFondationCategories(): FactionRoleCategory[] {
  const byBranch = new Map<RpBranch, typeof rpGrades>();
  for (const g of rpGrades) {
    if (isHonoraryGradeName(g.name)) continue;
    const list = byBranch.get(g.branch) ?? [];
    list.push(g);
    byBranch.set(g.branch, list);
  }

  const order: RpBranch[] = [
    "omega",
    "direction",
    "securite",
    "scientifique",
    "maintenance",
    "general",
    "classes",
  ];

  const branches: FactionRoleCategory[] = order
    .filter((b) => byBranch.has(b))
    .map((branch) => {
      const meta = BRANCH_META[branch];
      const grades = byBranch.get(branch) ?? [];
      return {
        id: branch,
        label: meta.label,
        summary: meta.summary,
        color: meta.color,
        roles: grades.map((g) => ({
          name: g.name,
          description: g.description,
          missions: g.objectives.length ? g.objectives : undefined,
          clearance: g.clearance,
          siteAccess: g.siteSections.map((s) => SITE_LABELS[s] ?? s),
          pay: g.pay,
          quota: g.quota,
        })),
      };
    });

  const titres: FactionRoleCategory = {
    id: "titres",
    label: "Titres honorifiques",
    summary: redlakesRpRules.honoraryTitles,
    color: "#ca8a04",
    roles: honoraryTitles.map((t) => ({
      name: `${t.emoji} ${t.name}`,
      description: t.description,
    })),
  };

  const securiteIdx = branches.findIndex((b) => b.id === "securite");
  if (securiteIdx >= 0) {
    branches.splice(securiteIdx + 1, 0, titres);
  } else {
    branches.push(titres);
  }

  return branches;
}

/** Catalogue statique des factions hors Site-12 */
const STATIC_CATALOG: Record<string, FactionRoleCategory[]> = {
  aegis: [
    {
      id: "directoire",
      label: "Directoire",
      summary: "Décisions globales et audits majeurs. Ne se déplace jamais sur site.",
      color: "#c0c0c0",
      roles: [
        {
          name: "Président du Directoire",
          description: "Autorité suprême AEGIS. Valide les interventions et les rapports classifiés.",
          missions: ["Décider", "Auditer", "Sanctionner"],
          clearance: 5,
          siteAccess: ["Vue d'ensemble", "Transmissions classifiées"],
        },
        {
          name: "Membre du Directoire",
          description: "Vote et supervision des opérations inter-sites.",
          missions: ["Superviser", "Conseiller", "Garantir"],
          clearance: 5,
          siteAccess: ["Direction", "Transmissions classifiées"],
        },
      ],
    },
    {
      id: "inspecteurs",
      label: "Inspecteurs",
      summary: "Visage public d'AEGIS sur le terrain. L'arme principale : le rapport.",
      color: "#9ca3af",
      roles: [
        {
          name: "Inspecteur principal",
          description: "Mène les audits sur Site-12. Accès zones limitées.",
          missions: ["Contrôler", "Avertir", "Rédiger rapports"],
          clearance: 4,
          siteAccess: ["Départements", "Matrice d'accès"],
        },
        {
          name: "Inspecteur adjoint",
          description: "Assiste les audits et collecte les preuves.",
          missions: ["Enquêter", "Conseiller"],
          clearance: 3,
          siteAccess: ["Départements"],
        },
        {
          name: "Analyste AEGIS",
          description: "Traitement des données et corrélation d'incidents.",
          missions: ["Analyser", "Archiver"],
          clearance: 3,
          siteAccess: ["Transmissions restreintes"],
        },
      ],
    },
    {
      id: "cellules",
      label: "Cellules d'application",
      summary: "Déploiement ponctuel. Jamais permanentes, toujours traumatisantes.",
      color: "#6b7280",
      roles: [
        {
          name: "Commandant de cellule",
          description: "Dirige une intervention AEGIS d'urgence.",
          missions: ["Diriger", "Contenir", "Extraire"],
          clearance: 4,
          siteAccess: ["Sécurité", "Intervention"],
        },
        {
          name: "Agent d'application",
          description: "Exécution terrain sous mandat AEGIS.",
          missions: ["Appliquer", "Sécuriser"],
          clearance: 3,
          siteAccess: ["Sécurité"],
        },
      ],
    },
  ],

  chaos: [
    {
      id: "commandement",
      label: "Commandement",
      summary: "Direction de l'Insurrection dans la zone REDLAKES.",
      color: "#2d5016",
      roles: [
        {
          name: "Commandant de secteur",
          description: "Coordonne les opérations anti-Fondation.",
          missions: ["Diriger", "Planifier", "Recruter"],
          clearance: 4,
          siteAccess: ["Vue d'ensemble", "Cellules"],
        },
        {
          name: "Officier du Chaos",
          description: "Supervise les cellules et les raids.",
          missions: ["Superviser", "Armer"],
          clearance: 3,
          siteAccess: ["Équipes"],
        },
      ],
    },
    {
      id: "cellules",
      label: "Cellules",
      summary: "Unités autonomes de l'Insurrection.",
      color: "#3d6b1f",
      roles: [
        {
          name: "Chef de cellule Alpha",
          description: "Cellule d'assaut principale.",
          missions: ["Raid", "Libérer des SCP", "Saboter"],
          clearance: 3,
          siteAccess: ["Détention"],
        },
        {
          name: "Chef de cellule Phoenix",
          description: "Spécialisée sabotage et infiltration.",
          missions: ["Infiltrer", "Détruire"],
          clearance: 3,
        },
        {
          name: "Chef de cellule Shadow",
          description: "Renseignement et couverture.",
          missions: ["Espionner", "Désinformer"],
          clearance: 2,
        },
      ],
    },
    {
      id: "combattants",
      label: "Combattants",
      summary: "Troupe principale de l'Insurrection.",
      color: "#4a7c23",
      roles: [
        {
          name: "Vétéran du Chaos",
          description: "Soldat expérimenté, formateur des recrues.",
          missions: ["Combattre", "Former"],
          clearance: 2,
        },
        {
          name: "Soldat",
          description: "Combattant standard de l'Insurrection.",
          missions: ["Patrouiller", "Tenir position"],
          clearance: 1,
        },
        {
          name: "Recrue",
          description: "Nouveau membre en probation.",
          missions: ["Apprendre", "Suivre"],
          clearance: 1,
        },
      ],
    },
  ],

  "main-serpent": [
    {
      id: "hierarchie",
      label: "Hiérarchie occulte",
      summary: "Ordre initiatique de la Main du Serpent.",
      color: "#4a0080",
      roles: [
        {
          name: "Grand Maître",
          description: "Dirigeant suprême des égouts et de la bibliothèque.",
          missions: ["Diriger", "Présider rituels", "Garder les secrets"],
          clearance: 4,
          siteAccess: ["Bases", "Rituels", "Artéfacts"],
        },
        {
          name: "Archimage",
          description: "Maître des sorts et des grimoires.",
          missions: ["Étudier", "Enseigner", "Ritueliser"],
          clearance: 3,
          siteAccess: ["Rituels", "Artéfacts"],
        },
        {
          name: "Initié",
          description: "Membre confirmé ayant passé le Pacte.",
          missions: ["Servir", "Collecter"],
          clearance: 2,
        },
        {
          name: "Acolyte",
          description: "Novice en apprentissage occulte.",
          missions: ["Apprendre", "Patrouiller égouts"],
          clearance: 1,
        },
      ],
    },
    {
      id: "bases",
      label: "Bases & sanctuaires",
      summary: "Lieux de pouvoir sous REDLAKES.",
      color: "#5b0a9e",
      roles: [
        {
          name: "Gardien de la Bibliothèque",
          description: "Protège la Bibliothèque Souterraine et ses textes.",
          missions: ["Garder", "Cataloguer"],
          clearance: 3,
        },
        {
          name: "Prêtre de l'Autel",
          description: "Officie à l'Autel des Ombres.",
          missions: ["Ritueliser", "Purifier"],
          clearance: 3,
        },
        {
          name: "Conservateur de la Crypte",
          description: "Entretien la Crypte Centrale.",
          missions: ["Entretenir", "Conserver artéfacts"],
          clearance: 2,
        },
      ],
    },
    {
      id: "arts",
      label: "Arts interdits",
      summary: "Sorts, rituels et artéfacts.",
      color: "#6b21a8",
      roles: [
        {
          name: "Maître des Sorts",
          description: "Voile des Ombres, Malédiction du Serpent, Invocation Mineure.",
          missions: ["Lancer sorts", "Former acolytes"],
          clearance: 3,
        },
        {
          name: "Maître des Rituels",
          description: "Rituel d'Éveil, Cérémonie du Pacte, Transfert d'Âme.",
          missions: ["Préparer rituels", "Diriger cérémonies"],
          clearance: 4,
        },
      ],
    },
  ],

  goc: [
    {
      id: "commandement",
      label: "Commandement",
      summary: "Direction de la coalition occulte mondiale.",
      color: "#1a3a5c",
      roles: [
        {
          name: "Directeur régional",
          description: "Supervise les opérations GOC en zone REDLAKES.",
          missions: ["Diriger", "Coordonner avec États"],
          clearance: 5,
        },
        {
          name: "Officier de liaison",
          description: "Interface avec la Fondation (tension permanente).",
          missions: ["Négocier", "Surveiller"],
          clearance: 4,
        },
      ],
    },
    {
      id: "unites",
      label: "Unités de frappe",
      summary: "Destruction des anomalies, pas confinement.",
      color: "#234a6e",
      roles: [
        {
          name: "Commandant d'unité",
          description: "Mène les opérations de neutralisation.",
          missions: ["Détruire", "Sécuriser zone"],
          clearance: 4,
        },
        {
          name: "Soldat GOC",
          description: "Combattant anti-anomalie.",
          missions: ["Engager", "Extraire"],
          clearance: 2,
        },
        {
          name: "Technicien PSYCHE",
          description: "Support anti-mémétique et décontamination.",
          missions: ["Décontaminer", "Analyser"],
          clearance: 3,
        },
      ],
    },
  ],

  gouvernement: [
    {
      id: "administration",
      label: "Mairie & administration",
      summary: "Gouvernement municipal de REDLAKES (États-Unis).",
      color: "#1e3a5f",
      roles: [
        {
          name: "Maire de REDLAKES",
          description: "Élu municipal — autorité civile suprême de la ville.",
          missions: ["Décider", "Financer", "Représenter"],
          clearance: 4,
          siteAccess: ["Direction", "Secrétariat"],
        },
        {
          name: "City Manager",
          description: "Directeur administratif de la mairie — coordination des services.",
          missions: ["Organiser", "Communiquer", "Superviser"],
          clearance: 3,
          siteAccess: ["Secrétariat", "Services"],
        },
      ],
    },
    {
      id: "liaison",
      label: "Liaison Fondation",
      summary: "Interface entre le public et le Site-12.",
      color: "#2d4a6f",
      roles: [
        {
          name: "Conseiller municipal",
          description: "Lien officiel avec la direction du site.",
          missions: ["Conseiller", "Médiation"],
          clearance: 3,
        },
        {
          name: "Attaché administratif",
          description: "Gestion des dossiers et autorisations civiles.",
          missions: ["Traiter dossiers", "Autoriser"],
          clearance: 2,
        },
      ],
    },
    {
      id: "services",
      label: "Services publics",
      summary: "Personnel municipal de soutien.",
      color: "#3d5a80",
      roles: [
        {
          name: "Employé municipal",
          description: "Accueil, logistique, maintenance civile.",
          missions: ["Accueillir", "Distribuer"],
          clearance: 1,
        },
      ],
    },
  ],

  police: [
    {
      id: "commandement",
      label: "Commandement",
      summary: "REDLAKES Police Department (RPD).",
      color: "#2563eb",
      roles: [
        {
          name: "Chief of Police",
          description: "Chef du département de police REDLAKES.",
          missions: ["Diriger", "Superviser enquêtes"],
          clearance: 3,
        },
        {
          name: "Lieutenant",
          description: "Supervise les patrouilles et enquêteurs.",
          missions: ["Patrouiller", "Coordonner"],
          clearance: 2,
        },
      ],
    },
    {
      id: "patrouille",
      label: "Patrouille",
      summary: "Maintien de l'ordre en surface.",
      color: "#3b82f6",
      roles: [
        {
          name: "Police Officer",
          description: "Patrouille urbaine standard.",
          missions: ["Patrouiller", "Intervenir", "Avertir"],
          clearance: 1,
        },
        {
          name: "Deputy",
          description: "Première ligne, contact public.",
          missions: ["Accueillir", "Rapporter"],
          clearance: 1,
        },
      ],
    },
    {
      id: "enquetes",
      label: "Enquêtes",
      summary: "Crimes et incidents liés aux anomalies (conscience limitée).",
      color: "#1d4ed8",
      roles: [
        {
          name: "Detective",
          description: "Mène les enquêtes criminelles.",
          missions: ["Enquêter", "Interroger", "Rédiger"],
          clearance: 2,
        },
        {
          name: "Investigator",
          description: "Support terrain et collecte de preuves.",
          missions: ["Collecter", "Surveiller"],
          clearance: 1,
        },
      ],
    },
  ],

  civil: [
    {
      id: "citoyens",
      label: "Citoyens & vie quotidienne",
      summary: "Population civile de REDLAKES.",
      color: "#22c55e",
      roles: [
        {
          name: "Citoyen REDLAKES",
          description: "Résident standard de la ville.",
          missions: ["Vivre", "Travailler", "Interagir"],
          clearance: 1,
        },
        {
          name: "Propriétaire / Patron",
          description: "Commerce, bar, entreprise locale — ping 📢 Réunion PATRON.",
          missions: ["Gérer", "Employer", "Négocier"],
          clearance: 1,
        },
      ],
    },
    {
      id: "urgences",
      label: "Urgences & santé",
      summary: "Hôpital et services médicaux civils.",
      color: "#ef4444",
      roles: [
        {
          name: "Paramedic / EMT",
          description: "Premiers secours et transport médical.",
          missions: ["Secourir", "Stabiliser", "Transporter"],
          clearance: 1,
        },
      ],
    },
    {
      id: "medias",
      label: "Commerce & médias",
      summary: "Économie locale et presse.",
      color: "#f59e0b",
      roles: [
        {
          name: "Journaliste",
          description: "Presse locale — ping 📢 Réunion MÉDIAS.",
          missions: ["Enquêter", "Publier"],
          clearance: 1,
        },
      ],
    },
  ],

  crime: [
    {
      id: "global",
      label: "Grades globaux",
      summary: redlakesRpRules.illegalOrgs,
      color: "#374151",
      roles: [
        {
          name: "Gang Member",
          description: "Soldat de rue — gang local.",
          missions: ["Patrouiller", "Protéger le territoire"],
        },
        {
          name: "Gang Boss",
          description: "Chef de gang.",
          missions: ["Diriger", "Recruter"],
        },
        {
          name: "Mafia Associate",
          description: "Membre d'une famille criminelle.",
          missions: ["Exécuter", "Rapporter"],
        },
        {
          name: "Mafia Don",
          description: "Parrain / chef de famille.",
          missions: ["Décider", "Négocier"],
        },
        {
          name: "MC Member",
          description: "Membre d'un motorcycle club.",
          missions: ["Patrouiller", "Défendre le clubhouse"],
        },
        {
          name: "MC President",
          description: "Président du club.",
          missions: ["Diriger", "Représenter"],
        },
        {
          name: "Cartel Runner",
          description: "Convoyeur / distributeur.",
          missions: ["Distribuer", "Surveiller"],
        },
        {
          name: "Cartel Boss",
          description: "Chef de réseau.",
          missions: ["Organiser", "Éliminer la concurrence"],
        },
        {
          name: "Criminel indépendant",
          description: "Hors structure — solo ou petit groupe.",
          missions: ["Survivre", "Improviser"],
        },
      ],
    },
    {
      id: "reunions",
      label: "Convocations",
      summary: "Ping Discord mentionnable pour réunions illégales.",
      color: "#4b5563",
      roles: [
        {
          name: "📢 Réunion CRIME",
          description: "Mention @ pour convoquer le crime organisé.",
          missions: ["Convoquer", "Coordonner"],
        },
      ],
    },
  ],
};

export function getFactionRoleCategories(factionId: string): FactionRoleCategory[] {
  if (factionId === "fondation") return buildFondationCategories();
  return STATIC_CATALOG[factionId] ?? [];
}

export function getAllFactionRoleCategories(): Record<string, FactionRoleCategory[]> {
  const out: Record<string, FactionRoleCategory[]> = {
    fondation: buildFondationCategories(),
  };
  for (const [id, cats] of Object.entries(STATIC_CATALOG)) {
    out[id] = cats;
  }
  return out;
}
