/**
 * Catégories de rôles par faction — affichage site (onglets Factions).
 * Fondation : généré depuis rp-grades.ts (Google Sheet Site-12).
 */
import { isCityFaction } from "@/lib/faction-stats";
import { rpGrades, type RpBranch } from "./rp-grades";
import { honoraryTitles, isHonoraryGradeName, redlakesRpRules } from "./redlakes-rp-rules";

export interface FactionRoleEntry {
  name: string;
  /** Anciens noms en base qui reprennent ce texte (grade renommé entre-temps). */
  aliases?: string[];
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

/** Valeurs d'un grade en base, réglées par le staff (grille des accès, fiche du grade). */
export interface LiveGradeValues {
  slug: string;
  name: string;
  branch: string;
  description: string | null;
  objectives: string[];
  clearanceLevel: number;
  siteSections: string[];
  pay: number | null;
  quota: number | null;
}

interface RoleSource {
  name: string;
  branch: string;
  description: string;
  objectives: string[];
  clearance: 1 | 2 | 3 | 4 | 5;
  siteSections: string[];
  pay: number | null;
  quota: number | null;
}

function fromLive(g: LiveGradeValues): RoleSource {
  return {
    name: g.name,
    branch: g.branch,
    description: g.description ?? "",
    objectives: g.objectives,
    clearance: Math.min(5, Math.max(1, Math.round(g.clearanceLevel))) as RoleSource["clearance"],
    siteSections: g.siteSections,
    pay: g.pay,
    quota: g.quota,
  };
}

/**
 * Grades Fondation à afficher : ceux de la base, tels que le staff les a
 * réglés (hiérarchie, métiers retirés, accès) — l'API ne renvoie que les
 * grades en service, déjà dans l'ordre. Le catalogue figé ne sert que si
 * l'API n'a pas répondu.
 */
function fondationRoleSources(live: LiveGradeValues[]): RoleSource[] {
  return live.length > 0 ? live.map(fromLive) : rpGrades;
}

function buildFondationCategories(live: LiveGradeValues[] = []): FactionRoleCategory[] {
  const byBranch = new Map<string, RoleSource[]>();
  for (const g of fondationRoleSources(live)) {
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
      id: "conseil",
      label: "Conseil & dossiers",
      summary: "Élus et agents qui suivent les décisions et les dossiers de la ville.",
      color: "#2d4a6f",
      roles: [
        {
          name: "Conseiller municipal",
          description: "Élu au conseil municipal : vote le budget et les décisions de la ville.",
          missions: ["Voter", "Conseiller le maire", "Représenter un quartier"],
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
      summary: "Direction de la police de Redlakes, de Millbrook et de Pine Hollow.",
      color: "#2563eb",
      roles: [
        {
          name: "Chef de la police",
          aliases: ["Chief of Police"],
          description: "Dirige la police et rend des comptes au maire.",
          missions: ["Diriger", "Fixer les priorités", "Rendre des comptes au maire"],
        },
        {
          name: "Chef adjoint",
          aliases: ["Deputy Chief"],
          description: "Remplace le chef et s'occupe du personnel et de la discipline.",
          missions: ["Remplacer le chef", "Gérer le personnel", "Faire respecter la discipline"],
        },
        {
          name: "Capitaine",
          aliases: ["Captain"],
          description: "Commande les patrouilles ou les enquêtes.",
          missions: ["Commander une division", "Organiser les effectifs"],
        },
      ],
    },
    {
      id: "encadrement",
      label: "Encadrement",
      summary: "Organise les services et tient les postes de Millbrook et de Pine Hollow.",
      color: "#3b82f6",
      roles: [
        {
          name: "Lieutenant",
          description: "Chef d'équipe de service : organise les patrouilles.",
          missions: ["Organiser le service", "Répartir les patrouilles"],
        },
        {
          name: "Sergent",
          aliases: ["Sergeant"],
          description: "Encadre les agents sur le terrain ; responsable d'un poste de village.",
          missions: ["Encadrer les agents", "Tenir un poste de village"],
        },
      ],
    },
    {
      id: "terrain",
      label: "Terrain",
      summary: "Patrouilles, interventions et enquêtes, en ville comme dans les villages.",
      color: "#1d4ed8",
      roles: [
        {
          name: "Inspecteur",
          aliases: ["Detective", "Investigator"],
          description: "Mène les enquêtes criminelles.",
          missions: ["Enquêter", "Interroger", "Rédiger les rapports"],
        },
        {
          name: "Caporal",
          aliases: ["Corporal"],
          description: "Agent expérimenté qui forme les nouveaux.",
          missions: ["Former les recrues", "Patrouiller"],
        },
        {
          name: "Agent de police",
          aliases: ["Police Officer"],
          description: "Patrouille, intervient et verbalise.",
          missions: ["Patrouiller", "Intervenir", "Verbaliser"],
        },
        {
          name: "Agent stagiaire",
          aliases: ["Deputy", "Probationary Officer"],
          description: "Nouvelle recrue : patrouille toujours avec un caporal.",
          missions: ["Apprendre le métier", "Patrouiller accompagné"],
        },
      ],
    },
    {
      id: "services",
      label: "Services",
      summary: "Postes au service des agents.",
      color: "#60a5fa",
      roles: [
        {
          name: "Opérateur 911",
          aliases: ["Dispatcher"],
          description: "Répond aux appels d'urgence et envoie les agents par radio.",
          missions: ["Répondre au 911", "Envoyer les agents"],
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

function normalizeRoleName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/**
 * Grades en base d'une faction hors Site-12 (noms, ordre, salaires réglés par
 * le staff ou le chef) habillés du texte du catalogue quand le nom — ou un
 * ancien nom — correspond. Un grade sans texte connu va dans « Autres grades ».
 * Les factions de la ville n'affichent ni habilitation ni accès au Site-12.
 */
function buildFromLive(factionId: string, live: LiveGradeValues[]): FactionRoleCategory[] {
  const catalog = STATIC_CATALOG[factionId] ?? [];
  const known = new Map<string, { category: FactionRoleCategory; role: FactionRoleEntry }>();
  for (const category of catalog) {
    for (const role of category.roles) {
      for (const name of [role.name, ...(role.aliases ?? [])]) {
        known.set(normalizeRoleName(name), { category, role });
      }
    }
  }

  const city = isCityFaction(factionId);
  const groups = new Map<string, FactionRoleCategory>();
  const others: FactionRoleEntry[] = [];
  for (const grade of live) {
    const match = known.get(normalizeRoleName(grade.name));
    const entry: FactionRoleEntry = {
      name: grade.name,
      description: grade.description || match?.role.description || "",
      missions: grade.objectives.length ? grade.objectives : match?.role.missions,
      clearance: city ? undefined : fromLive(grade).clearance,
      siteAccess: city
        ? undefined
        : grade.siteSections.length
          ? grade.siteSections.map((s) => SITE_LABELS[s] ?? s)
          : match?.role.siteAccess,
      pay: grade.pay,
      quota: grade.quota,
    };
    if (!match) {
      others.push(entry);
      continue;
    }
    const group = groups.get(match.category.id) ?? { ...match.category, roles: [] };
    group.roles.push(entry);
    groups.set(match.category.id, group);
  }

  const categories = catalog
    .map((c) => groups.get(c.id))
    .filter((c): c is FactionRoleCategory => Boolean(c));
  if (others.length) {
    categories.push({
      id: "autres",
      label: categories.length ? "Autres grades" : "Hiérarchie",
      summary: "",
      color: catalog[0]?.color ?? "#9ca3af",
      roles: others,
    });
  }
  return categories;
}

/**
 * liveGrades : pour la Fondation, tous les grades en base ; pour une autre
 * faction, ses propres grades (voir gradesForFaction). Sans réponse de l'API,
 * on retombe sur le catalogue figé.
 */
export function getFactionRoleCategories(
  factionId: string,
  liveGrades: LiveGradeValues[] = [],
): FactionRoleCategory[] {
  if (factionId === "fondation") return buildFondationCategories(liveGrades);
  if (liveGrades.length) return buildFromLive(factionId, liveGrades);
  return STATIC_CATALOG[factionId] ?? [];
}

export function getAllFactionRoleCategories(
  liveGrades: LiveGradeValues[] = [],
): Record<string, FactionRoleCategory[]> {
  const out: Record<string, FactionRoleCategory[]> = {
    fondation: buildFondationCategories(liveGrades),
  };
  for (const [id, cats] of Object.entries(STATIC_CATALOG)) {
    out[id] = cats;
  }
  return out;
}
