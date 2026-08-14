/**
 * Site-12 — données extraites de « Branche Du Site 12.xlsx »
 *
 * Règle importante (confirmée staff) :
 * - Les noms d'équipes (TEAM ELITE, TEAM MOBILE…) sont des EXEMPLES.
 *   Les hauts gradés choisissent le nom de leur équipe in-game.
 * - Les chambres (CHAMBRE D, SPECIAL S/B…) sont des EMPLACEMENTS.
 *   Le nom affiché du SCP est défini par le staff / superviseur concerné.
 * - Les expériences (EXPERIENCE KETER/EUCLID/SAFE) suivent la même logique.
 */

export const site12Meta = {
  totalWeeklyPayroll: 54080,
  customizableTeams: true,
  customizableChambers: true,
  scpNamesInGame: true,
  note:
    "Les libellés d'équipes, de chambres et d'expériences sur ce site sont des modèles. En jeu, les directeurs et commandants les renomment librement et y assignent le SCP concerné.",
};

export interface Grade {
  name: string;
  pay: number;
  quota: number;
  tier?: "omega" | "direction" | "officier" | "sous-officier" | "troupe" | "class" | "scientifique" | "medical" | "technique" | "admin";
}

export interface TeamTemplate {
  id: string;
  exampleName: string;
  departmentId: string;
  category: string;
  composition: string[];
  hasMedic?: boolean;
  customizableBy: string;
}

export interface ChamberSlot {
  id: string;
  exampleLabel: string;
  classType: "S" | "B" | "D";
}

export interface ExperienceSlot {
  id: string;
  exampleName: string;
  scpClass: "Keter" | "Euclid" | "Safe";
  composition: string[];
  customizableBy: string;
}

export interface DepartmentLeadership {
  role: string;
  departmentId: string;
}

export interface Department {
  id: string;
  name: string;
  omega: string;
  director: string;
  color: string;
  utilities: string[];
  objectives?: string[];
  leadership: string[];
  grades: Grade[];
  teams?: TeamTemplate[];
  chambers?: ChamberSlot[];
  experiences?: ExperienceSlot[];
  clearance: 1 | 2 | 3 | 4 | 5;
}

/** Colonnes matrice d'accès (ACCES) */
export const accessZones = [
  { id: "wh", label: "W.H.", description: "White House / quartier haut" },
  { id: "o5", label: "O5", description: "Zone Conseil Oméga" },
  { id: "gates", label: "Gates", description: "Portails d'accès" },
  { id: "n5", label: "N5", description: "Niveau habilitation 5" },
  { id: "keter", label: "Keter", description: "Zone confinement Keter" },
  { id: "a5", label: "A5", description: "Armurerie 5" },
  { id: "a4", label: "A4", description: "Armurerie 4" },
  { id: "euclid", label: "Euclid", description: "Zone confinement Euclid" },
  { id: "a3", label: "A3", description: "Armurerie 3" },
  { id: "a2", label: "A2", description: "Armurerie 2" },
  { id: "safe", label: "Safe", description: "Zone confinement Safe" },
  { id: "a1", label: "A1", description: "Armurerie 1" },
  { id: "n4", label: "N4", description: "Niveau habilitation 4" },
  { id: "n3", label: "N3", description: "Niveau habilitation 3" },
  { id: "n2", label: "N2", description: "Niveau habilitation 2" },
  { id: "n1", label: "N1", description: "Niveau habilitation 1" },
  { id: "arm3", label: "Arm3", description: "Armurerie lourde 3" },
  { id: "arm2", label: "Arm2", description: "Armurerie lourde 2" },
  { id: "arm1", label: "Arm1", description: "Armurerie lourde 1" },
  { id: "check", label: "Check", description: "Point de contrôle" },
  { id: "inter", label: "Inter.", description: "Intervention" },
  { id: "maint", label: "Maint.", description: "Maintenance" },
] as const;

export const omegaCouncil = [
  {
    role: "Président du Conseil (O1)",
    pay: 20000,
    quota: 1,
    objectives: ["Décider", "Employer", "Diriger", "Étudier", "Contenir", "Agir"],
  },
  {
    role: "Vice-Président — Sécurité (O2)",
    pay: 20000,
    quota: 1,
    objectives: ["Superviser la Sécurité", "Class-D / B / S", "SCP", "Armements"],
  },
  {
    role: "Conseiller — Sciences (O3)",
    pay: 17500,
    quota: 1,
    objectives: ["Superviser la Recherche", "Expériences", "Archives"],
  },
  {
    role: "Conseiller — Maintenance (O4)",
    pay: 12000,
    quota: 3,
    objectives: ["Superviser l'Entretien", "Livraison", "Construction"],
  },
  {
    role: "Conseiller — Services (O5)",
    pay: 10000,
    quota: 1,
    objectives: ["Secrétariat", "Restauration", "Communication", "Paye"],
  },
  {
    role: "Directeur du Site",
    pay: 10000,
    quota: 1,
    objectives: ["Contrôler", "Superviser", "Avertir", "Conseiller", "Éviter", "Garantir"],
  },
  { role: "Adjoint-Directeur", pay: 7500, quota: 5 },
  { role: "Directeur Sécurité", pay: 3000, quota: 3 },
  { role: "Adjoint-Directeur Sécurité", pay: 2300, quota: 2 },
  { role: "Directeur Scientifique", pay: 3900, quota: 1 },
  { role: "Adjoint-Directeur Scientifique", pay: 1700, quota: 6 },
  { role: "Directeur-Adjoint Médical", pay: 17500, quota: 1 },
  { role: "Superviseur d'Intervention", pay: 10000, quota: 1 },
  { role: "Médecin en Chef", pay: 8800, quota: 4 },
  { role: "Chef de Com. en Soin", pay: 4200, quota: 2 },
  { role: "Directeur Maintenance", pay: 2100, quota: 3 },
  { role: "Adjoint-Directeur Maintenance", pay: 1900, quota: 4 },
  { role: "Directeur Général", pay: 2600, quota: 2 },
  { role: "Adjoint-Directeur Général", pay: 2200, quota: 3 },
];

export const omegaBranches = [
  {
    omega: "O2",
    director: "Directeur Sécurité",
    utilities: ["Sécurité", "Class-D / B / S", "SCP", "Nuke", "Armements"],
    departmentId: "securite",
  },
  {
    omega: "O3",
    director: "Directeur Scientifique",
    utilities: ["Recherche", "Soin", "Archives", "Technologie", "Expérience"],
    departmentId: "recherche",
  },
  {
    omega: "O4",
    director: "Directeur Maintenance",
    utilities: ["Entretiens", "Réparation", "Livraison", "Commande", "Construction"],
    departmentId: "maintenance",
  },
  {
    omega: "O5",
    director: "Directeur Général",
    utilities: ["Secrétariat", "Restauration", "Nettoyage", "Paye", "Communication"],
    departmentId: "general",
  },
];

const securityTeams: TeamTemplate[] = [
  { id: "elite-01", exampleName: "TEAM ELITE : 01", departmentId: "securite", category: "Elite", composition: ["Sergent Elite", "Caporal Elite", "Soldat Elite ×3", "M/C Dr."], hasMedic: true, customizableBy: "Directeur Sécurité, Commandant" },
  { id: "elite-02", exampleName: "TEAM ELITE : 02", departmentId: "securite", category: "Elite", composition: ["Sergent Elite", "Caporal Elite", "Soldat Elite ×3", "M/C Dr."], hasMedic: true, customizableBy: "Directeur Sécurité, Commandant" },
  { id: "prestige-01", exampleName: "TEAM PRESTIGE : 01", departmentId: "securite", category: "Prestige", composition: ["Sergent Prestige", "Caporal Prestige", "Soldat Prestige ×3", "M/C Dr."], hasMedic: true, customizableBy: "Adjoint-Directeur Sécurité, Commandant" },
  { id: "prestige-02", exampleName: "TEAM PRESTIGE : 02", departmentId: "securite", category: "Prestige", composition: ["Sergent Prestige", "Caporal Prestige", "Soldat Prestige ×3", "M/C Dr."], hasMedic: true, customizableBy: "Adjoint-Directeur Sécurité, Commandant" },
  { id: "prestige-03", exampleName: "TEAM PRESTIGE : 03", departmentId: "securite", category: "Prestige", composition: ["Sergent Prestige", "Caporal Prestige", "Soldat Prestige ×3", "M/C Dr."], hasMedic: true, customizableBy: "Commandant" },
  { id: "normal-01", exampleName: "TEAM NORMAL : 01", departmentId: "securite", category: "Normal", composition: ["Sergent", "Caporal", "Soldat ×3", "M/C Dr."], hasMedic: true, customizableBy: "Commandant Patrouilles, Lieutenant" },
  { id: "normal-02", exampleName: "TEAM NORMAL : 02", departmentId: "securite", category: "Normal", composition: ["Sergent", "Caporal", "Soldat ×3"], customizableBy: "Commandant Patrouilles, Lieutenant" },
  { id: "normal-03", exampleName: "TEAM NORMAL : 03", departmentId: "securite", category: "Normal", composition: ["Sergent", "Caporal", "Soldat ×3"], customizableBy: "Lieutenant Sécurité" },
  { id: "normal-04", exampleName: "TEAM NORMAL : 04", departmentId: "securite", category: "Normal", composition: ["Sergent", "Caporal", "Soldat ×3"], customizableBy: "Lieutenant Sécurité" },
  { id: "garde-01", exampleName: "TEAM GARDE : 01", departmentId: "securite", category: "Garde", composition: ["Caporal Garde", "Soldat Garde ×3"], customizableBy: "Responsable Garde D" },
  { id: "garde-02", exampleName: "TEAM GARDE : 02", departmentId: "securite", category: "Garde", composition: ["Caporal Garde", "Soldat Garde ×3"], customizableBy: "Responsable Garde D" },
  { id: "garde-03", exampleName: "TEAM GARDE : 03", departmentId: "securite", category: "Garde", composition: ["Caporal Garde", "Soldat Garde ×3"], customizableBy: "Responsable Garde D" },
  { id: "garde-04", exampleName: "TEAM GARDE : 04", departmentId: "securite", category: "Garde", composition: ["Caporal Garde", "Soldat Garde ×3"], customizableBy: "Responsable Garde D" },
];

const researchChambers: ChamberSlot[] = [
  ...Array.from({ length: 4 }, (_, i) => ({ id: `ss-${i + 1}`, exampleLabel: `CHAMBRE SPECIAL S : ${String(i + 1).padStart(2, "0")}`, classType: "S" as const })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: `sb-${i + 1}`, exampleLabel: `CHAMBRE SPECIAL B : ${String(i + 1).padStart(2, "0")}`, classType: "B" as const })),
  ...Array.from({ length: 24 }, (_, i) => ({ id: `d-${i + 1}`, exampleLabel: `CHAMBRE D : ${String(i + 1).padStart(2, "0")}`, classType: "D" as const })),
];

const researchExperiences: ExperienceSlot[] = [
  { id: "keter-01", exampleName: "EXPERIENCE KETER : 01", scpClass: "Keter", composition: ["Scientifique Qualifier ×2", "Scientifique Aguerris", "Chercheur Expérimenteur", "Archiviste"], customizableBy: "Directeur Scientifique, Superviseur d'Expérience" },
  { id: "keter-02", exampleName: "EXPERIENCE KETER : 02", scpClass: "Keter", composition: ["Scientifique Qualifier ×2", "Scientifique Aguerris", "Chercheur Expérimenteur"], customizableBy: "Directeur Scientifique, Superviseur d'Expérience" },
  { id: "euclid-01", exampleName: "EXPERIENCE EUCLID : 01", scpClass: "Euclid", composition: ["Scientifique Aguerris ×2", "Chercheur Compétent", "Archiviste"], customizableBy: "Superviseur d'Expérience, Superviseur SCP" },
  { id: "euclid-02", exampleName: "EXPERIENCE EUCLID : 02", scpClass: "Euclid", composition: ["Scientifique Aguerris ×2", "Chercheur Compétent"], customizableBy: "Superviseur d'Expérience, Superviseur SCP" },
  { id: "euclid-03", exampleName: "EXPERIENCE EUCLID : 03", scpClass: "Euclid", composition: ["Scientifique Aguerris ×2", "Chercheur Compétent"], customizableBy: "Superviseur SCP" },
  { id: "safe-01", exampleName: "EXPERIENCE SAFE : 01", scpClass: "Safe", composition: ["Scientifique Novice ×2", "Chercheur"], customizableBy: "Chef d'Archive, Responsable d'Autorisation" },
  { id: "safe-02", exampleName: "EXPERIENCE SAFE : 02", scpClass: "Safe", composition: ["Scientifique Novice ×2", "Chercheur"], customizableBy: "Chef d'Archive" },
  { id: "safe-03", exampleName: "EXPERIENCE SAFE : 03", scpClass: "Safe", composition: ["Scientifique Novice ×2", "Chercheur", "Archiviste"], customizableBy: "Chef d'Archive, Chef de Com." },
  { id: "safe-04", exampleName: "EXPERIENCE SAFE : 04", scpClass: "Safe", composition: ["Scientifique Novice ×2", "Chercheur"], customizableBy: "Chef de Com." },
];

const medicalTeams: TeamTemplate[] = [
  { id: "mobile-01", exampleName: "TEAM MOBILE : 01", departmentId: "recherche", category: "Mobile", composition: ["M/C Dr.", "Dr.", "Médecin ×2"], customizableBy: "Médecin en Chef, Directeur-Adjoint Médical" },
  { id: "mobile-02", exampleName: "TEAM MOBILE : 02", departmentId: "recherche", category: "Mobile", composition: ["M/C Dr.", "Dr.", "Médecin ×2"], customizableBy: "Médecin en Chef" },
  { id: "mobile-03", exampleName: "TEAM MOBILE : 03", departmentId: "recherche", category: "Mobile", composition: ["M/C Dr.", "Dr.", "Médecin ×2"], customizableBy: "Superviseur d'Intervention" },
  { id: "psy", exampleName: "PSYCHOLOGUE", departmentId: "recherche", category: "Psychologie", composition: ["Psychologue ×3"], customizableBy: "Médecin en Chef" },
  { id: "medecin", exampleName: "MEDECIN", departmentId: "recherche", category: "Soins", composition: ["Médecin ×3"], customizableBy: "Chef de Com. en Soin" },
];

const maintenanceTeams: TeamTemplate[] = [
  { id: "entretien", exampleName: "EQUIPE ENTRETIEN", departmentId: "maintenance", category: "Entretien", composition: ["Chef Technicien", "Technicien", "Plombier", "Électricien", "Mécanicien"], customizableBy: "Directeur Maintenance, Responsable d'Entretien" },
  { id: "livraison", exampleName: "EQUIPE LIVRAISON", departmentId: "maintenance", category: "Livraison", composition: ["Chef Réceptionniste", "Travailleur ×2"], customizableBy: "Responsable Livraison" },
  { id: "deplacement", exampleName: "EQUIPE DEPLACEMENT", departmentId: "maintenance", category: "Déplacement", composition: ["Déménageur en Chef", "Travailleur ×2"], customizableBy: "Chef D'intervention" },
  { id: "commande", exampleName: "EQUIPE COMMANDE", departmentId: "maintenance", category: "Commande", composition: ["Chef de Commande ×3"], customizableBy: "Chef de Commande, Com. de Maintenance" },
];

/** Tous les grades avec paye et quota (source Excel) */
export const allGrades: Grade[] = [
  { name: "Président du Conseil (O1)", pay: 20000, quota: 1, tier: "omega" },
  { name: "Vice-Président — Sécurité (O2)", pay: 20000, quota: 1, tier: "omega" },
  { name: "Conseiller — Sciences (O3)", pay: 17500, quota: 1, tier: "omega" },
  { name: "Conseiller — Maintenance (O4)", pay: 12000, quota: 3, tier: "omega" },
  { name: "Conseiller — Services (O5)", pay: 10000, quota: 1, tier: "omega" },
  { name: "Directeur du Site", pay: 10000, quota: 1, tier: "direction" },
  { name: "Directeur Sécurité", pay: 3000, quota: 3, tier: "officier" },
  { name: "Directeur Scientifique", pay: 3900, quota: 1, tier: "scientifique" },
  { name: "Directeur Maintenance", pay: 2100, quota: 3, tier: "technique" },
  { name: "Directeur Général", pay: 2600, quota: 2, tier: "admin" },
  { name: "Adjoint-Directeur", pay: 7500, quota: 5, tier: "direction" },
  { name: "Commandant", pay: 4200, quota: 2, tier: "officier" },
  { name: "Lieutenant de Terrain", pay: 3900, quota: 2, tier: "officier" },
  { name: "Superviseur", pay: 3000, quota: 3, tier: "officier" },
  { name: "Sergent Elite", pay: 2300, quota: 2, tier: "sous-officier" },
  { name: "Sergent Prestige", pay: 2100, quota: 3, tier: "sous-officier" },
  { name: "Sergent", pay: 1900, quota: 4, tier: "sous-officier" },
  { name: "Caporal Elite", pay: 2000, quota: 2, tier: "sous-officier" },
  { name: "Caporal Prestige", pay: 1850, quota: 3, tier: "sous-officier" },
  { name: "Caporal", pay: 1700, quota: 8, tier: "sous-officier" },
  { name: "Soldat", pay: 1600, quota: 39, tier: "troupe" },
  { name: "Class-S", pay: 150, quota: 4, tier: "class" },
  { name: "Class-B", pay: 120, quota: 4, tier: "class" },
  { name: "Class-D", pay: 90, quota: 24, tier: "class" },
  { name: "Scientifique Qualifier", pay: 3800, quota: 4, tier: "scientifique" },
  { name: "Scientifique Aguerris", pay: 3300, quota: 8, tier: "scientifique" },
  { name: "Scientifique", pay: 2900, quota: 11, tier: "scientifique" },
  { name: "Chercheur Expérimenteur", pay: 2600, quota: 2, tier: "scientifique" },
  { name: "Chercheur Compétent", pay: 2200, quota: 3, tier: "scientifique" },
  { name: "Chercheur", pay: 1900, quota: 4, tier: "scientifique" },
  { name: "Archiviste", pay: 1500, quota: 4, tier: "scientifique" },
  { name: "Dr.", pay: 3600, quota: 3, tier: "medical" },
  { name: "Médecin / Psychologue", pay: 3300, quota: 12, tier: "medical" },
  { name: "M/C Dr.", pay: 1700, quota: 6, tier: "medical" },
  { name: "Responsable", pay: 3900, quota: 3, tier: "officier" },
  { name: "Chef", pay: 2800, quota: 3, tier: "technique" },
  { name: "Chef d'équipe", pay: 2600, quota: 3, tier: "technique" },
  { name: "Travailleur", pay: 2300, quota: 15, tier: "technique" },
];

export const site12Departments: Department[] = [
  {
    id: "securite",
    name: "Département Sécurité",
    omega: "O2",
    director: "Directeur Sécurité",
    color: "#1e40af",
    utilities: ["Sécurité", "Class-D / B / S", "SCP", "Nuke", "Armements"],
    leadership: [
      "Directeur Sécurité",
      "Adjoint-Directeur Sécurité",
      "Commandant",
      "Commandant Patrouilles",
      "Lieutenant de Terrain",
      "Lieutenant Sécurité",
      "Responsable Garde D",
      "Général de Com.",
      "Instructeur / Formateur",
    ],
    grades: allGrades.filter((g) =>
      ["Commandant", "Lieutenant de Terrain", "Superviseur", "Sergent Elite", "Sergent Prestige", "Sergent", "Caporal Elite", "Caporal Prestige", "Caporal", "Soldat", "Class-S", "Class-B", "Class-D"].includes(g.name)
    ),
    teams: securityTeams,
    clearance: 1,
  },
  {
    id: "recherche",
    name: "Département Scientifique",
    omega: "O3",
    director: "Directeur Scientifique",
    color: "#15803d",
    utilities: ["Recherche", "Soin", "Archives", "Technologie", "Expérience"],
    leadership: [
      "Directeur Scientifique",
      "Adjoint-Directeur Scientifique",
      "Superviseur d'Expérience",
      "Superviseur de SCP",
      "Responsable d'Autorisation",
      "Chef d'Archive",
      "Chef de Com.",
      "Directeur-Adjoint Médical",
      "Médecin en Chef",
      "Superviseur d'Intervention",
      "Chef de Com. en Soin",
    ],
    grades: allGrades.filter((g) =>
      ["Responsable", "Scientifique Qualifier", "Scientifique Aguerris", "Scientifique", "Chercheur Expérimenteur", "Chercheur Compétent", "Chercheur", "Archiviste", "Dr.", "Médecin / Psychologue", "M/C Dr.", "Chef", "Chef d'équipe", "Travailleur"].includes(g.name)
    ),
    teams: medicalTeams,
    chambers: researchChambers,
    experiences: researchExperiences,
    clearance: 2,
  },
  {
    id: "maintenance",
    name: "Département Maintenance",
    omega: "O4",
    director: "Directeur Maintenance",
    color: "#c2410c",
    utilities: ["Entretiens", "Réparation", "Livraison", "Commande", "Construction"],
    leadership: [
      "Directeur Maintenance",
      "Adjoint-Directeur Maintenance",
      "Responsable d'Entretien",
      "Responsable Livraison",
      "Chef D'intervention",
      "Chef de Commande",
      "Com. de Maintenance",
    ],
    grades: allGrades.filter((g) => ["Superviseur", "Responsable", "Chef", "Chef d'équipe", "Travailleur"].includes(g.name)),
    teams: maintenanceTeams,
    clearance: 1,
  },
  {
    id: "general",
    name: "Département Général",
    omega: "O5",
    director: "Directeur Général",
    color: "#e5e7eb",
    utilities: ["Secrétariat", "Restauration", "Nettoyage", "Paye", "Communication"],
    leadership: [
      "Directeur Général",
      "Adjoint-Directeur Général",
      "Superviseur Secrétaire",
      "Superviseur Restauration",
      "Superviseur Nettoyage",
      "Superviseur Communication",
    ],
    grades: [],
    teams: [
      { id: "secretariat", exampleName: "Secrétariat (5 branches)", departmentId: "general", category: "Admin", composition: ["Secrétaire Admin.", "Secrétaire Sécu.", "Secrétaire Scient.", "Secrétaire Médic", "Secrétaire Maint.", "+ adjoints"], customizableBy: "Directeur Général" },
      { id: "restauration", exampleName: "Restauration", departmentId: "general", category: "Services", composition: ["Chef de Cuisine ×4"], customizableBy: "Superviseur Restauration" },
      { id: "nettoyage", exampleName: "Nettoyage", departmentId: "general", category: "Services", composition: ["Concierge ×4"], customizableBy: "Superviseur Nettoyage" },
      { id: "communication", exampleName: "Communication", departmentId: "general", category: "Com.", composition: ["Com. Sécurité", "Com. Scientifique", "Com. Maintenance", "Com. Extérieur", "Com. Interne"], customizableBy: "Superviseur Communication" },
    ],
    clearance: 1,
  },
];
