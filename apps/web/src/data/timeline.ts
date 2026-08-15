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
    id: "wwii-end",
    year: "1945",
    title: "Fin de la Seconde Guerre mondiale",
    description:
      "La guerre laisse un monde profondément transformé. De nombreux événements inexpliqués sont rapportés sur plusieurs continents — certaines puissances découvrent des phénomènes qui défient toutes les connaissances scientifiques.",
    type: "fondation",
    clearance: 1,
  },
  {
    id: "foundation",
    year: "1948",
    title: "Fondation de la Fondation SCP",
    description:
      "Plusieurs organisations secrètes internationales fusionnent pour créer une structure unique chargée d'identifier, contenir et étudier les anomalies. Devise : Sécuriser. Contenir. Protéger.",
    type: "fondation",
    clearance: 1,
  },
  {
    id: "construction-years",
    year: "1950-1970",
    title: "Les années de construction",
    description:
      "Premières grandes installations : Site-7, Site-8, Site-17, Site-19, Site-22, Site-45, Site-81. Les premières Forces d'Intervention Mobiles (FIM) voient le jour.",
    type: "fondation",
    clearance: 1,
  },
  {
    id: "golden-age",
    year: "1970-1990",
    title: "L'Âge d'Or",
    description:
      "La Fondation atteint une efficacité sans précédent. Les anomalies les plus dangereuses sont confinées. Le Site-19 devient le plus grand complexe de confinement au monde ; le Site-22 devient le centre stratégique de la Fondation.",
    type: "fondation",
    clearance: 1,
  },
  {
    id: "xk-drill",
    year: "1987",
    title: "Exercice XK simulé",
    description:
      "Premier exercice de catastrophe globale mené par la Fondation. Révèle des failles critiques dans les protocoles de confinement Keter, à l'échelle de tous les Sites.",
    type: "incident",
    clearance: 3,
  },
  {
    id: "global-expansion",
    year: "1991",
    title: "Expansion mondiale",
    description:
      "Après la Guerre froide, la Fondation profite de l'ouverture de nombreux pays pour étendre son réseau. Nouveaux laboratoires construits, effectifs dépassant plusieurs dizaines de milliers de personnes.",
    type: "fondation",
    clearance: 1,
  },
  {
    id: "ci-arrival",
    year: "1994",
    title: "Arrivée de l'Insurrection du Chaos",
    description:
      "Des cellules de l'Insurrection du Chaos s'infiltrent dans la région de RedLake. Début de la guerre froide interne entre factions.",
    type: "faction",
    clearance: 2,
  },
  {
    id: "great-programs",
    year: "1998",
    title: "Les grands programmes",
    description:
      "Les recherches sur les anomalies progressent rapidement. Les départements scientifiques connaissent leur plus forte croissance. Nouvelles technologies de confinement.",
    type: "fondation",
    clearance: 1,
  },
  {
    id: "first-warnings",
    year: "2003",
    title: "Les premiers avertissements",
    description:
      "Augmentation inhabituelle des incidents. Attaques et infiltrations plus fréquentes contre plusieurs installations. Le Conseil O5 estime la situation sous contrôle.",
    type: "incident",
    clearance: 3,
  },
  {
    id: "shadow-war-begins",
    year: "2006",
    title: "Début de la Guerre de l'Ombre",
    description:
      "Les Groupes d'Intérêt intensifient leurs actions. L'Insurrection du Chaos mène plusieurs attaques coordonnées ; la Main du Serpent multiplie les opérations de libération d'anomalies. Pour la première fois, la Fondation mène une véritable guerre clandestine.",
    type: "guerre",
    clearance: 3,
  },
  {
    id: "site-45-incident",
    year: "2008",
    title: "Incident du Site-45",
    description:
      "Une importante brèche de confinement provoque l'abandon du Site. Personnel évacué, plusieurs anomalies disparues.",
    type: "breach",
    clearance: 3,
  },
  {
    id: "site-81-destruction",
    year: "2009",
    title: "Destruction du Site-81",
    description:
      "Une catastrophe interne rend le Site définitivement inutilisable. Les recherches polaires sont suspendues.",
    type: "incident",
    clearance: 3,
  },
  {
    id: "site-7-fall",
    year: "2011",
    title: "Chute du Site-7",
    description:
      "Après plusieurs semaines de combats, le Site est perdu. Les survivants sont répartis dans d'autres installations.",
    type: "guerre",
    clearance: 3,
  },
  {
    id: "site-8-fall",
    year: "2012",
    title: "Chute du Site-8",
    description:
      "Une offensive coordonnée entraîne la perte du complexe. La Fondation commence à comprendre qu'elle fait face à une stratégie globale.",
    type: "guerre",
    clearance: 3,
  },
  {
    id: "site-19-fall",
    year: "2013",
    title: "Chute du Site-19",
    description:
      "Le plus grand centre de confinement mondial tombe. Des centaines d'anomalies disparaissent, des milliers de membres du personnel périssent. Un tournant historique pour la Fondation.",
    type: "guerre",
    clearance: 3,
  },
  {
    id: "site-17-fall",
    year: "2014",
    title: "Chute du Site-17",
    description:
      "Le principal centre médical et biologique de la Fondation est détruit. Une partie du savoir scientifique accumulé depuis des décennies est perdue.",
    type: "guerre",
    clearance: 3,
  },
  {
    id: "site-22-fall",
    year: "2015",
    title: "Chute du Site-22",
    description:
      "Dernier grand centre de commandement de la Fondation. Après plusieurs jours de siège, le Site est submergé. La Fondation perd son état-major.",
    type: "guerre",
    clearance: 4,
  },
  {
    id: "brolver",
    year: "2015",
    title: "Incident de Brolver",
    description:
      "Lors de l'évacuation des survivants du Site-22, le convoi est intercepté près du village de Brolver. Face à une défaite certaine, l'O-1 du Site-22 déclenche le Prototype Oméga. Le village est détruit, les forces ennemies anéanties, plusieurs anomalies détruites ou dispersées. Le plus grand secret de la Fondation.",
    type: "breach",
    clearance: 5,
  },
  {
    id: "the-reform",
    year: "2016",
    title: "La Réforme — naissance d'AEGIS et du Conseil Oméga",
    description:
      "À la suite de Brolver, plusieurs puissances exigent une supervision plus stricte de la Fondation. Naissance d'A.E.G.I.S., organisation composée de grandes familles, industriels et financiers, chargée de financer la Fondation et de garantir qu'un nouveau Brolver soit impossible. Le Conseil Oméga remplace l'ancien Conseil O5.",
    type: "faction",
    clearance: 4,
  },
  {
    id: "site-12-project",
    year: "2017-2023",
    title: "Projet Site-12",
    description:
      "Toutes les ressources restantes sont concentrées sur un objectif unique : construire la plus grande installation de l'histoire de la Fondation, sous la future métropole de RedLake.",
    type: "fondation",
    clearance: 2,
  },
  {
    id: "serpent-rise",
    year: "2019",
    title: "Émergence de la Main du Serpent",
    description:
      "Faction occulte s'établissant dans les égouts de RedLake, encore une ville modeste à cette époque. Bibliothèque souterraine et premiers rituels documentés.",
    type: "faction",
    clearance: 2,
  },
  {
    id: "site-12-operational",
    year: "2024",
    title: "Mise en service du Site-12",
    description:
      "Le Site-12 devient pleinement opérationnel. Les survivants des anciens Sites y sont transférés. Les FIM et les AIT y sont stationnées de manière permanente. Le Site-12 devient le nouveau centre mondial des opérations de la Fondation.",
    type: "fondation",
    clearance: 1,
  },
  {
    id: "keter-breach",
    year: "2025",
    title: "Brèche majeure — Secteur Keter",
    description:
      "Premier incident Keter majeur du Site-12 nouvellement opérationnel. Perte de 23 agents. Déploiement FIM Epsilon-11. Site placé sous surveillance renforcée pendant 6 mois — révision complète des protocoles Keter.",
    type: "breach",
    clearance: 2,
  },
  {
    id: "internal-war",
    year: "2026",
    title: "Guerre interne — Crise de gouvernance du Conseil Oméga",
    description:
      "Conflit entre directeurs de département et le Conseil Oméga. AEGIS intervient en niveau 3 — Conformité Forcée. Gel de projets, démotions RP, surveillance renforcée 12 mois.",
    type: "guerre",
    clearance: 5,
  },
  {
    id: "reconstruction",
    year: "2025-2026",
    title: "Reconstruction",
    description:
      "La Fondation se réorganise. Nouvelles recrues, reprise des recherches, réapparition progressive des Groupes d'Intérêt. Une nouvelle guerre de l'ombre commence.",
    type: "fondation",
    clearance: 1,
  },
  {
    id: "redlakes-today",
    year: "2027",
    title: "Aujourd'hui — REDLAKES",
    description:
      "Le Site-12 est le dernier grand bastion de la Fondation SCP. Sous la métropole de RedLake, des milliers de femmes et d'hommes poursuivent une mission commencée près de quatre-vingts ans plus tôt. En surface, la vie suit son cours. Sous terre, la moindre erreur pourrait provoquer la fin de l'humanité.",
    type: "fondation",
    clearance: 1,
  },
];
