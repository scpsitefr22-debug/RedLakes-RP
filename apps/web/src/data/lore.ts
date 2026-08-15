export interface Character {
  id: string;
  name: string;
  title: string;
  faction: string;
  biography: string;
  quotes: string[];
  history: string[];
  portrait?: string;
  clearance: 1 | 2 | 3 | 4 | 5;
}

export const characters: Character[] = [
  {
    id: "directeur-site",
    name: "Directeur ████████",
    title: "Directeur du Site-12",
    faction: "Fondation SCP",
    biography:
      "À la tête du Site-12 depuis 2025. Ancien chercheur promu après la brèche Keter survenue peu après la mise en service du Site. Connu pour sa gestion pragmatique des crises. Sous sa direction, le site a connu une expansion majeure des protocoles de confinement et l'intégration des équipes Elite et Prestige.",
    quotes: [
      "Le Conseil Oméga est informé.",
      "Les pertes sont acceptables dans le cadre du protocole.",
      "AEGIS observe. Nous continuons.",
    ],
    history: [
      "2024 — Intègre le Site-12 lors de sa mise en service",
      "2025 — Survit à la brèche Keter en tant que superviseur",
      "2025 — Promotion au rang de Directeur de Site",
      "2026 — Gestion de la crise de gouvernance du Conseil Oméga",
      "2026 — Audition AEGIS niveau 3 — Conformité Forcée",
    ],
    clearance: 3,
  },
  {
    id: "inspecteur-aegis",
    name: "Inspecteur [CENSURÉ]",
    title: "Inspecteur AEGIS — Niveau 2",
    faction: "A.E.G.I.S.",
    biography:
      "Visage public d'AEGIS sur Site-12. Civil haut niveau avec accréditation légale internationale. Aucun pouvoir militaire — l'arme, c'est le rapport. Sa présence suffit à paralyser un département entier.",
    quotes: [
      "La Fondation n'a pas franchi une ligne. Elle l'a redessinée à son avantage.",
      "Votre réponse est jugée insuffisante.",
      "L'absence de réponse est parfois la réponse.",
    ],
    history: [
      "2026-06-08 — Rapport d'inspection niveau 3",
      "2026-06-08 — Gel du Projet ████ recommandé",
      "2026-06-15 — Suivi post-brèche Keter-02",
    ],
    clearance: 5,
  },
  {
    id: "commandant-nu7",
    name: "Commandant Vance",
    title: "Commandant FIM Nu-7",
    faction: "FIM Nu-7",
    biography:
      "Vétéran de 15 ans au sein de la Fondation, transféré au Site-12 lors de sa mise en service. A dirigé l'opération Mur de Fer en juin 2026. Connu pour sa discipline et son refus des demi-mesures.",
    quotes: ["Quand Nu-7 déploie, c'est qu'il n'y a plus d'autre option."],
    history: [
      "2024 — Transfert au Site-12 lors de sa mise en service",
      "2025 — Participation à la réponse à la brèche Keter",
      "2026-06-01 — Opération Mur de Fer réussie",
    ],
    clearance: 2,
  },
  {
    id: "chef-moretti",
    name: "Vincent Moretti",
    title: "Capo — Famille Moretti",
    faction: "Crime Organisé",
    biography:
      "Chef de la famille mafieuse Moretti opérant dans le quartier criminel de REDLAKES. Entretient des relations tendues avec la police et une ignorance feinte de la Fondation.",
    quotes: ["La surface appartient à la ville. Les égouts appartiennent à ceux qui osent."],
    history: [
      "2020 — Arrivée dans REDLAKES",
      "2024 — Guerre territoriale avec le Cartel del Norte",
    ],
    clearance: 1,
  },
  {
    id: "initie-serpent",
    name: "████ ████",
    title: "Initié — Main du Serpent",
    faction: "Main du Serpent",
    biography:
      "Figure mystérieuse des égouts de REDLAKES. Gardien de la Bibliothèque Souterraine. Son identité réelle est inconnue du personnel de surface.",
    quotes: ["Le savoir ancien a un prix. Êtes-vous prêt à le payer ?"],
    history: ["2019 — Premiers rituels documentés dans les égouts"],
    clearance: 2,
  },
];

export interface LoreSection {
  id: string;
  title: string;
  excerpt: string;
  category: "monde" | "site" | "chronologie" | "guerres" | "catastrophes" | "personnages" | "faction" | "evenement";
  content: string;
  clearance: 1 | 2 | 3 | 4 | 5;
  featured?: boolean;
}

export const loreSections: LoreSection[] = [
  {
    id: "histoire-monde",
    title: "Histoire du Monde",
    excerpt: "Une réalité où les anomalies existent en secret.",
    category: "monde",
    featured: true,
    content: `Le monde de REDLAKES existe dans une réalité où les anomalies sont réelles mais secrètes. La Fondation SCP opère depuis l'ombre, confinant ce que l'humanité ne peut comprendre.

Pendant ce temps, gouvernements, organisations rivales et forces occultes tentent d'influencer le destin de l'humanité :

• La Fondation SCP — Confiner, contenir, protéger
• L'Insurrection du Chaos — Libérer les anomalies
• A.E.G.I.S. — Contrôler les dérives de la Fondation
• La Main du Serpent — Accumuler le savoir occulte
• Le GOC — Détruire le paranormal
• Le crime organisé — Prospérer dans l'ombre de la ville

Sur le serveur Minecraft, chaque joueur incarne un acteur de cet univers : agent de sécurité, chercheur, civil, criminel ou inspecteur.`,
    clearance: 1,
  },
  {
    id: "histoire-site12",
    title: "Histoire du Site-12",
    excerpt: "Le dernier grand bastion de la Fondation, sous la métropole de RedLake.",
    category: "site",
    featured: true,
    content: `Après la chute de Site-7, Site-8, Site-19, Site-17 et Site-22 entre 2011 et 2015, la Fondation concentre toutes ses ressources restantes sur un objectif unique : construire la plus grande installation de son histoire. Le Projet Site-12 (2017-2023) s'achève avec la mise en service du site en 2024, sous la future métropole de RedLake. Les survivants des anciens Sites y sont transférés ; il abrite aujourd'hui :

• Le Conseil Oméga (O1 à O5)
• 4 départements : Sécurité, Recherche, Maintenance, Général
• Plus de 70 grades jouables
• 23 chambres Class-D actives
• 4 chambres spéciales (Class-B, Class-S)
• Secteurs Keter, Euclid et Safe
• Les FIM et AIT, stationnées en permanence

Le site est surveillé indirectement par A.E.G.I.S. depuis sa création en 2016. Toute dérive éthique majeure peut déclencher un audit.`,
    clearance: 1,
  },
  {
    id: "aegis-mandat",
    title: "A.E.G.I.S. — Mandat Officiel",
    excerpt: "La Fondation protège l'humanité. AEGIS décide jusqu'où elle a le droit d'aller.",
    category: "faction",
    featured: true,
    content: `A.E.G.I.S. (Autorité Exécutive de Garantie des Intérêts Suprêmes) est une instance supranationale de contrôle, née en 2016 en réaction directe à l'incident de Brolver. Composée de grandes familles, d'industriels et de financiers — pas de fonctionnaires — sa mission est de financer la Fondation et de veiller à ce qu'un drame comme Brolver ne puisse plus jamais se reproduire.

Elle ne contient pas les anomalies — elle contient ceux qui les contiennent.

HIÉRARCHIE :
• Niveau 1 — Directoire AEGIS (3-5 membres, jamais sur site)
• Niveau 2 — Inspecteurs AEGIS (jouable, staff)
• Niveau 3 — Cellules d'Application (events, PNJ)

PROTOCOLES D'AUDIT :
1. Observation — Prise de notes, conséquences légères
2. Restriction — Accès limité, pression hiérarchique
3. Conformité Forcée — Gel de projet, convocation Directeur
4. Défaillance — Intervention majeure, mise sous tutelle

PRINCIPES : Rareté. Neutralité absolue. Non-héroïsation. Décalage temporel.`,
    clearance: 4,
  },
  {
    id: "main-serpent-origines",
    title: "Main du Serpent — Origines",
    excerpt: "Faction occulte des égouts de REDLAKES.",
    category: "faction",
    content: `La Main du Serpent est une faction occulte jouable apparue en 2019 dans les égouts de REDLAKES.

STRUCTURE :
• Bibliothèque Souterraine — Accumulation de savoir
• Autel des Ombres — Rituels majeurs
• Crypte Centrale — Artéfacts confinés

CAPACITÉS JOUABLES :
• Sorts : Voile des Ombres, Malédiction du Serpent
• Rituels : Rituel d'Éveil, Cérémonie du Pacte
• Artéfacts : Grimoire des Profondeurs, Œil de K'tharr

La Fondation surveille la faction mais n'intervient que si la menace dépasse les égouts.`,
    clearance: 2,
  },
  {
    id: "crime-redlakes",
    title: "Crime Organisé de REDLAKES",
    excerpt: "Mafia, cartels et groupes indépendants.",
    category: "faction",
    content: `Le quartier criminel de REDLAKES abrite plusieurs organisations :

• Famille Moretti — Mafia italienne, territoire nord
• Cartel del Norte — Trafics internationaux, rival des Moretti
• Gang des Rats Gris — Groupes indépendants, égouts et friches

La police municipale maintient l'ordre en surface. La Fondation tolère une certaine activité criminelle tant qu'elle ne menace pas le secret du Site-12.`,
    clearance: 1,
  },
  {
    id: "guerre-interne",
    title: "Guerre Interne — Crise de gouvernance du Conseil Oméga",
    excerpt: "Crise de gouvernance en 2026.",
    category: "guerres",
    content: `En 2026, un conflit entre directeurs de département et le Conseil Oméga a ébranlé la gouvernance du Site-12.

CAUSES :
• Abus d'autorité RP répétés
• Absence de conséquences internes
• Site devenu « intouchable » narrativement

CONSÉQUENCES :
• Intervention AEGIS niveau 3 — Conformité Forcée
• Gel de projets SCP controversés
• Démotions RP de plusieurs directeurs de département
• Surveillance renforcée pendant 12 mois`,
    clearance: 5,
  },
  {
    id: "catastrophe-keter",
    title: "Catastrophe Keter 2025",
    excerpt: "Brèche majeure — 23 agents perdus, un an après la mise en service du Site.",
    category: "catastrophes",
    content: `Le 22 juillet 2025, un an à peine après sa mise en service, une brèche majeure dans le secteur Keter a marqué la jeune histoire du Site-12.

DÉROULEMENT :
• Défaillance système de surveillance
• Perte de 23 agents de sécurité
• Déploiement FIM Epsilon-11 « Nine Tailed Fox »
• Reconfinement après 3 heures

CONSÉQUENCES :
• Site placé sous surveillance renforcée 6 mois
• Révision complète des protocoles Keter
• Promotion du futur Directeur de Site
• Premier audit documenté d'A.E.G.I.S. sur le Site-12`,
    clearance: 2,
  },
  {
    id: "projet-redlakes",
    title: "Le Projet REDLAKES",
    excerpt: "Vision du serveur Minecraft RP.",
    category: "monde",
    featured: true,
    content: `REDLAKES RP est un serveur Minecraft Java mêlant :

SCP ROLEPLAY — Confinement, recherche, protocoles, FIM
DARKRP — Ville, économie, jobs civils, police
UNIVERS ORIGINAL — Lore propriétaire, AEGIS, Main du Serpent
HORREUR & CONSPIRATION — Archives classifiées, audits, dérives éthiques

PHILOSOPHIE :
« Si la Fondation SCP possédait Wikipédia, un réseau militaire, un système gouvernemental et une encyclopédie vivante dans un seul site. »

Le serveur est actuellement en phase de préparation. L'encyclopédie est accessible pour découvrir l'univers avant l'ouverture.`,
    clearance: 1,
  },
  {
    id: "breach-keter-2026",
    title: "Brèche Keter-02 — Juin 2026",
    excerpt: "Incident récent déclenchant un audit AEGIS.",
    category: "evenement",
    content: `Le 15 juin 2026, une brèche partielle dans le Secteur Keter-02 a été contenue après 47 minutes.

Le personnel Class-D a subi des pertes documentées. Le terme « pertes acceptables » a été utilisé à plusieurs reprises lors du debriefing — motif principal de l'audit AEGIS niveau 3.

Le Projet ████ a été gelé suite à l'inspection.`,
    clearance: 2,
  },
  {
    id: "conseil-omega",
    title: "Le Conseil Oméga",
    excerpt: "Hiérarchie suprême du Site-12, héritière de l'ancien Conseil O5.",
    category: "site",
    content: `Le Conseil Oméga a remplacé l'ancien Conseil O5 en 2016, dans le cadre de la Réforme qui a suivi l'incident de Brolver. Il gouverne le Site-12 depuis sa mise en service en 2024.

STRUCTURE :
• Président du Conseil (O1) — autorité suprême, 20 000 $/sem., 1 poste
• Vice-Président — Sécurité (O2) — bras droit, branche Sécurité, FIM et AIT
• Conseiller — Sciences (O3) — branche Scientifique
• Conseiller — Maintenance (O4) — branche Maintenance
• Conseiller — Services (O5) — secrétariat, restauration, communication
• Directeur du Site — 10 000 $/sem.
• Adjoint-Directeur — 7 500 $/sem., 5 postes
• Directeur Sécurité + Adjoint-Directeur Sécurité
• Directeur Scientifique + Adjoint-Directeur Scientifique
• Médecin : Directeur-Adjoint Médical → Superviseur d'Intervention → Médecin en Chef → Chef de Com. en Soin
• Directeur Maintenance + Adjoint-Directeur Maintenance
• Directeur Général + Adjoint-Directeur Général

Les cinq sièges (O1 à O5) coopèrent sous tension permanente avec A.E.G.I.S. Aucune directive AEGIS ne prévaut sur le Conseil, mais le non-respect d'un audit constitue une violation majeure.`,
    clearance: 3,
  },
];

export interface GameEvent {
  id: string;
  title: string;
  date: string;
  type: "breach" | "invasion" | "guerre" | "crise-xk" | "experience";
  description: string;
  casualties?: string;
  outcome: string;
  clearance: 1 | 2 | 3 | 4 | 5;
}

export const gameEvents: GameEvent[] = [
  {
    id: "breach-2026",
    title: "Brèche Secteur Keter-02",
    date: "2026-06-15",
    type: "breach",
    description: "Brèche partielle contenue après 47 minutes.",
    casualties: "Pertes Class-D documentées",
    outcome: "Confinement rétabli. Audit AEGIS déclenché.",
    clearance: 2,
  },
  {
    id: "mur-de-fer",
    title: "Opération Mur de Fer",
    date: "2026-06-01",
    type: "invasion",
    description: "Déploiement FIM Nu-7 en zone industrielle.",
    outcome: "Zone sécurisée. Activité CI repoussée.",
    clearance: 1,
  },
  {
    id: "crise-xk-1987",
    title: "Exercice XK Simulé",
    date: "1987-11-03",
    type: "crise-xk",
    description: "Premier exercice de catastrophe globale.",
    outcome: "Failles critiques identifiées. Protocoles révisés.",
    clearance: 4,
  },
  {
    id: "rituel-egouts",
    title: "Rituel intercepté — Égouts",
    date: "2026-05-20",
    type: "experience",
    description: "Cérémonie Main du Serpent détectée par renseignement.",
    outcome: "Rituel interrompu. Artefact non récupéré.",
    clearance: 2,
  },
];

export const loreCategories: Record<LoreSection["category"], string> = {
  monde: "Histoire du monde",
  site: "Histoire du site",
  chronologie: "Chronologie",
  guerres: "Guerres",
  catastrophes: "Catastrophes",
  personnages: "Personnages",
  faction: "Factions",
  evenement: "Événements",
};
