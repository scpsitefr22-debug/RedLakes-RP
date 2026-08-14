export interface MTFUnit {
  id: string;
  name: string;
  codename: string;
  motto: string;
  history: string;
  missions: string[];
  equipment: string[];
  personnel: number;
  logo?: string;
}

export interface Faction {
  id: string;
  name: string;
  tagline: string;
  description: string;
  history: string;
  objectives: string[];
  structure?: string[];
  grades?: { name: string; description: string }[];
  hierarchy?: { level: string; role: string; description: string }[];
  bases?: string[];
  artifacts?: string[];
  spells?: string[];
  rituals?: string[];
  cells?: string[];
  clearance: 1 | 2 | 3 | 4 | 5;
  color: string;
  playable: boolean;
}

export const mtfUnits: MTFUnit[] = [
  {
    id: "nu-7",
    name: "MTF Nu-7",
    codename: "Hammer Down",
    motto: "Quand la force brute est la seule réponse.",
    history: "Unité d'assaut lourde spécialisée dans les opérations de grande envergure.",
    missions: ["Assaut de positions fortifiées", "Confinement de entités hostiles", "Sécurisation de zones"],
    equipment: ["Armement lourd", "Véhicules blindés", "Explosifs tactiques"],
    personnel: 24,
  },
  {
    id: "epsilon-11",
    name: "MTF Epsilon-11",
    codename: "Nine Tailed Fox",
    motto: "Le confinement avant tout.",
    history: "Unité de réponse aux brèches. Déployée lors de l'incident Keter de 2015.",
    missions: ["Réponse aux brèches", "Reconfinement", "Évacuation du personnel"],
    equipment: ["Fusils d'assaut", "Équipement de confinement mobile", "Drones de surveillance"],
    personnel: 18,
  },
  {
    id: "alpha-1",
    name: "MTF Alpha-1",
    codename: "Red Right Hand",
    motto: "Les mains du Conseil.",
    history: "Unité d'élite directement sous l'autorité du Conseil Oméga.",
    missions: ["Protection du Conseil", "Opérations classifiées", "Élimination de menaces internes"],
    equipment: ["Armement expérimental", "Accès Niveau 5", "Véhicules aériens"],
    personnel: 12,
  },
  {
    id: "beta-7",
    name: "MTF Beta-7",
    codename: "Maz Hatters",
    motto: "Contre les toxines, contre le monde.",
    history: "Spécialisée dans les anomalies biologiques et chimiques.",
    missions: ["Décontamination", "Confinement biologique", "Analyse de pathogènes"],
    equipment: ["Hazmat avancé", "Laboratoires mobiles", "Agents neutralisants"],
    personnel: 15,
  },
  {
    id: "zeta-9",
    name: "MTF Zeta-9",
    codename: "Mole Rats",
    motto: "Dans l'obscurité, nous trouvons.",
    history: "Unité d'exploration souterraine et de récupération.",
    missions: ["Exploration de zones inconnues", "Récupération d'artefacts", "Cartographie"],
    equipment: ["Équipement de spéléologie", "Lampes UV", "Capteurs sismiques"],
    personnel: 10,
  },
];

export const factions: Faction[] = [
  {
    id: "fondation",
    name: "Fondation SCP",
    tagline: "Nous sécurisons, nous contenons, nous protégeons.",
    description: "Organisation secrète dédiée au confinement des anomalies. Site-12 est la branche principale de REDLAKES. Les grades se méritent par le RP — pas de système de niveaux automatique.",
    history: "Présente depuis 1947. Contrôle le destin de l'humanité dans l'ombre.",
    objectives: ["Confiner les anomalies", "Protéger l'humanité", "Maintenir le secret"],
    grades: [
      { name: "Directeur", description: "Autorité suprême du site" },
      { name: "O5", description: "Conseil Oméga — 5 membres" },
      { name: "Chef de Site", description: "Gestion opérationnelle" },
      { name: "Responsable de Département", description: "Direction d'un département" },
      { name: "Chercheur", description: "Études et expériences" },
      { name: "Agent de Sécurité", description: "Protection et confinement" },
    ],
    clearance: 1,
    color: "#8b0a0a",
    playable: true,
  },
  {
    id: "aegis",
    name: "A.E.G.I.S.",
    tagline: "La Fondation protège l'humanité. AEGIS décide jusqu'où elle a le droit d'aller.",
    description:
      "Autorité Exécutive de Garantie des Intérêts Suprêmes. Instance supranationale de contrôle. Elle ne contient pas les anomalies — elle contient ceux qui les contiennent.",
    history:
      "Née après plusieurs incidents mondiaux quand certains États ont compris que la Fondation n'est ni élue ni responsable devant les peuples.",
    objectives: [
      "Servir d'instance de contrôle supranationale",
      "Agir comme pare-feu contre les dérives de la Fondation",
      "Constituer un dernier rempart institutionnel",
    ],
    hierarchy: [
      { level: "Niveau 1", role: "Directoire AEGIS", description: "3-5 membres. Décisions globales, audits majeurs. Ne vient jamais sur site." },
      { level: "Niveau 2", role: "Inspecteurs AEGIS", description: "Visage public. Accès zones limitées. L'arme, c'est le rapport." },
      { level: "Niveau 3", role: "Cellules d'Application", description: "Déploiement ponctuel. Jamais permanentes, toujours traumatisantes." },
    ],
    structure: ["Directoire → Inspecteurs → Cellules d'Application"],
    clearance: 5,
    color: "#c0c0c0",
    playable: true,
  },
  {
    id: "chaos",
    name: "Insurrection du Chaos",
    tagline: "Libérer l'humanité de l'oppression de la Fondation.",
    description: "Organisation rebelle utilisant les anomalies comme armes contre la Fondation.",
    history: "Active depuis 1994 dans la région REDLAKES.",
    objectives: ["Détruire la Fondation", "Libérer les SCP", "Rallier les masses"],
    cells: ["Cellule Alpha", "Cellule Phoenix", "Cellule Shadow"],
    clearance: 2,
    color: "#2d5016",
    playable: true,
  },
  {
    id: "main-serpent",
    name: "Main du Serpent",
    tagline: "Les secrets anciens ont un prix.",
    description: "Faction occulte jouable. Bibliothèque, artéfacts, sorts et rituels.",
    history: "Émergée en 2019 dans les égouts de REDLAKES.",
    objectives: ["Accumuler le savoir occulte", "Effectuer des rituels", "Contrôler les égouts"],
    bases: ["Bibliothèque Souterraine", "Autel des Ombres", "Crypte Centrale"],
    artifacts: ["Grimoire des Profondeurs", "Œil de K'tharr", "Dague Rituelle"],
    spells: ["Voile des Ombres", "Malédiction du Serpent", "Invocation Mineure"],
    rituals: ["Rituel d'Éveil", "Cérémonie du Pacte", "Transfert d'Âme"],
    clearance: 2,
    color: "#4a0080",
    playable: true,
  },
  {
    id: "goc",
    name: "Global Occult Coalition",
    tagline: "Détruire le paranormal.",
    description: "Organisation rivale qui détruit les anomalies plutôt que de les confiner.",
    history: "Présence documentée depuis 2005. Tension permanente avec la Fondation.",
    objectives: ["Destruction des anomalies", "Contre-pouvoir à la Fondation"],
    clearance: 3,
    color: "#1a3a5c",
    playable: true,
  },
  {
    id: "gouvernement",
    name: "Gouvernement",
    tagline: "L'ordre public avant tout.",
    description: "Administration municipale de REDLAKES (États-Unis). Interface entre le public et les organisations secrètes.",
    history: "Mairie et services civils couvrant la ville de REDLAKES.",
    objectives: ["Maintenir l'ordre civil", "Financer", "Soutenir"],
    clearance: 1,
    color: "#1e3a5f",
    playable: true,
  },
  {
    id: "police",
    name: "REDLAKES Police Department",
    tagline: "To protect and serve.",
    description: "Forces de l'ordre municipales (USA). Conscience limitée des activités SCP.",
    history: "Département de police locale de REDLAKES.",
    objectives: ["Patrouilles urbaines", "Enquêtes criminelles", "Maintien de l'ordre"],
    clearance: 1,
    color: "#2563eb",
    playable: true,
  },
  {
    id: "crime",
    name: "Crime Organisé",
    tagline: "Grades globaux — ton lore, ton gang.",
    description:
      "Rôles Discord fixes par type (gang, mafia, MC, cartel). Les joueurs fondent leur organisation en RP sans rôle par nom. Le staff attribue le grade + le ping 📢 Réunion CRIME.",
    history: "La criminalité à REDLAKES est ce que les joueurs en font — pas de liste infinie de rôles par org.",
    objectives: ["Fonder une organisation", "Contrôler un territoire", "Développer son lore"],
    cells: ["Gang", "Mafia / Famille", "Motorcycle Club (MC)", "Cartel", "Indépendant"],
    clearance: 1,
    color: "#374151",
    playable: true,
  },
];
