export type SCPClass = "Safe" | "Euclid" | "Keter" | "Thaumiel" | "Apollyon";

export interface SCPObject {
  id: string;
  number: string;
  name: string;
  class: SCPClass;
  threatLevel: number;
  containment: string;
  history: string;
  description: string;
  image?: string;
  incidents: { date: string; summary: string }[];
  tests: { date: string; researcher: string; result: string }[];
  addendums: { author: string; content: string }[];
  stats: { containmentCost: string; personnelAssigned: number; breachCount: number };
  clearance: 1 | 2 | 3 | 4 | 5;
}

export const scpObjects: SCPObject[] = [
  {
    id: "scp-173",
    number: "SCP-173",
    name: "La Sculpture",
    class: "Euclid",
    threatLevel: 4,
    containment: "Chambre isolée 6m³. Surveillance permanente. Minimum 3 agents présents lors de l'accès.",
    history: "Premier objet confiné sur Site-12. Référence historique pour tous les protocoles de base.",
    description:
      "Entité construite en béton et renforcement. Ne bouge que lorsqu'elle n'est pas observée directement. Extrêmement rapide et mortelle.",
    incidents: [
      { date: "2024-03-12", summary: "Brèche mineure — 2 Class-D neutralisés en 4 secondes." },
      { date: "2025-11-08", summary: "Défaillance système de surveillance — confinement rétabli." },
    ],
    tests: [
      { date: "2025-06-01", researcher: "Dr. ████", result: "Comportement stable sous observation continue." },
    ],
    addendums: [
      { author: "Directeur Sécurité", content: "Ne jamais cligner des yeux en présence de l'objet." },
    ],
    stats: { containmentCost: "12 000$/mois", personnelAssigned: 8, breachCount: 2 },
    clearance: 1,
  },
  {
    id: "scp-049",
    number: "SCP-049",
    name: "Le Médecin de la Peste",
    class: "Euclid",
    threatLevel: 3,
    containment: "Cellule humanoïde standard. Interaction supervisée uniquement.",
    history: "Récupéré lors d'une opération MTF en zone urbaine.",
    description:
      "Entité humanoïde croyant soigner une « peste » invisible. Ses « guérisons » transforment les victimes en entités hostiles.",
    incidents: [
      { date: "2025-09-14", summary: "Contact non autorisé — transformation de 1 Class-D." },
    ],
    tests: [
      { date: "2025-10-02", researcher: "Dr. Lemaire", result: "Refuse toute collaboration sans « patient »." },
    ],
    addendums: [],
    stats: { containmentCost: "8 500$/mois", personnelAssigned: 4, breachCount: 1 },
    clearance: 2,
  },
  {
    id: "scp-096",
    number: "SCP-096",
    name: "L'Homme Timide",
    class: "Euclid",
    threatLevel: 5,
    containment: "Chambre hermétique sans surveillance visuelle. Accès par caméras infrarouges uniquement.",
    history: "Incident de masse en 2018 — 47 victimes civiles. Protocole renforcé depuis.",
    description:
      "Entité humanoïde extrêmement docile jusqu'à ce qu'un être vivant observe son visage. État de chasse irréversible.",
    incidents: [
      { date: "2018-07-22", summary: "Incident majeur — déploiement MTF Alpha-1." },
      { date: "2026-01-05", summary: "Tentative de photographie — confinement maintenu." },
    ],
    tests: [],
    addendums: [
      { author: "O5-██", content: "Aucune image de l'entité ne doit quitter le site." },
    ],
    stats: { containmentCost: "45 000$/mois", personnelAssigned: 12, breachCount: 3 },
    clearance: 3,
  },
  {
    id: "scp-████",
    number: "SCP-████",
    name: "[DONNÉES SUPPRIMÉES]",
    class: "Keter",
    threatLevel: 5,
    containment: "Secteur Keter-02. Accès Niveau 4+. MTF en standby permanent.",
    history: "Transféré depuis Site-19 en juin 2026. Projet gelé par AEGIS.",
    description: "Informations classifiées. Consultation requiert autorisation du Directeur de Site.",
    incidents: [
      { date: "2026-06-15", summary: "Brèche partielle — contenue en 47 minutes." },
    ],
    tests: [
      { date: "2026-06-01", researcher: "[CENSURÉ]", result: "Expérience suspendue — ordre AEGIS." },
    ],
    addendums: [
      { author: "Inspecteur AEGIS", content: "Le terme « pertes acceptables » est jugé insuffisant comme justification." },
    ],
    stats: { containmentCost: "███ 000$/mois", personnelAssigned: 24, breachCount: 1 },
    clearance: 4,
  },
  {
    id: "scp-500",
    number: "SCP-500",
    name: "Pilules Panacée",
    class: "Safe",
    threatLevel: 1,
    containment: "Coffre-fort pharmaceutique. Inventaire hebdomadaire.",
    history: "Découvertes dans une pharmacie abandonnée. 47 pilules restantes.",
    description: "Petites pilules rouges guérissant toute maladie ou blessure physique.",
    incidents: [],
    tests: [
      { date: "2025-12-10", researcher: "Dr. Chen", result: "Efficacité confirmée sur pathologies terminées." },
    ],
    addendums: [],
    stats: { containmentCost: "2 000$/mois", personnelAssigned: 2, breachCount: 0 },
    clearance: 1,
  },
];

export const classColors: Record<SCPClass, string> = {
  Safe: "text-green-400 border-green-400/30 bg-green-400/10",
  Euclid: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  Keter: "text-red-400 border-red-400/30 bg-red-400/10",
  Thaumiel: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  Apollyon: "text-orange-400 border-orange-400/30 bg-orange-400/10",
};
