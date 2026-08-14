export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  type: "fondation" | "incident" | "guerre" | "breach" | "faction";
  clearance: 1 | 2 | 3 | 4 | 5;
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: "foundation",
    year: "1947",
    title: "Fondation du Site REDLAKES",
    description:
      "Création du complexe principal sous le couvert d'une installation industrielle. Premiers confinements Safe et Euclid.",
    type: "fondation",
    clearance: 1,
  },
  {
    id: "site12",
    year: "1962",
    title: "Activation du Site-12",
    description:
      "Ouverture de la branche principale avec départements Sécurité, Recherche, Maintenance et Général. Hiérarchie Oméga établie.",
    type: "fondation",
    clearance: 1,
  },
  {
    id: "xk-drill",
    year: "1987",
    title: "Exercice XK simulé",
    description:
      "Premier exercice de catastrophe globale. Révèle des failles critiques dans les protocoles de confinement Keter.",
    type: "incident",
    clearance: 3,
  },
  {
    id: "ci-arrival",
    year: "1994",
    title: "Arrivée de l'Insurrection du Chaos",
    description:
      "Des cellules CI s'infiltrent dans la région. Début de la guerre froide interne entre factions.",
    type: "faction",
    clearance: 2,
  },
  {
    id: "aegis-creation",
    year: "2001",
    title: "Création d'A.E.G.I.S.",
    description:
      "Instance supranationale fondée après plusieurs incidents mondiaux. Mandat : contrôler les dérives de la Fondation.",
    type: "faction",
    clearance: 4,
  },
  {
    id: "breach-keter",
    year: "2015",
    title: "Brèche majeure — Secteur Keter",
    description:
      "Perte de 23 agents. Déploiement MTF Epsilon-11. Site placé sous surveillance renforcée pendant 6 mois.",
    type: "breach",
    clearance: 2,
  },
  {
    id: "serpent-rise",
    title: "Émergence de la Main du Serpent",
    year: "2019",
    description:
      "Faction occulte jouable établit des bases dans les égouts et la zone criminelle. Bibliothèque et rituels actifs.",
    type: "faction",
    clearance: 2,
  },
  {
    id: "internal-war",
    year: "2023",
    title: "Guerre interne O5 — Crise de gouvernance",
    description:
      "Conflit entre directeurs de site et le Conseil Oméga. AEGIS intervient en niveau 3 — Conformité Forcée.",
    type: "guerre",
    clearance: 5,
  },
  {
    id: "redlakes-today",
    year: "2026",
    title: "REDLAKES aujourd'hui",
    description:
      "Serveur actif mêlant SCP RP, DarkRP, crime organisé et conspiration. Le secret doit être préservé.",
    type: "fondation",
    clearance: 1,
  },
];
