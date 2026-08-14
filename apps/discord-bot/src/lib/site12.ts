/** Donnees Site-12 (miroir compact de apps/web/src/data/site12.ts) */

export const omegaCouncil = [
  { role: "President du Conseil (O1)", pay: 20000 },
  { role: "Vice-President Securite (O2)", pay: 20000 },
  { role: "Conseiller Sciences (O3)", pay: 17500 },
  { role: "Conseiller Maintenance (O4)", pay: 12000 },
  { role: "Conseiller Services (O5)", pay: 10000 },
  { role: "Directeur du Site", pay: 10000 },
  { role: "Directeur Securite", pay: 3000 },
  { role: "Directeur Scientifique", pay: 3900 },
  { role: "Directeur Maintenance", pay: 2100 },
  { role: "Directeur General", pay: 2600 },
  { role: "Adjoint-Directeur", pay: 7500 },
];

export interface DeptInfo {
  id: string;
  name: string;
  omega: string;
  director: string;
  utilities: string[];
  grades: { name: string; pay: number; quota: number }[];
}

export const departments: DeptInfo[] = [
  {
    id: "securite",
    name: "Departement Securite",
    omega: "O2",
    director: "Directeur Securite",
    utilities: ["Securite", "Class-D/B/S", "SCP", "Nuke", "Armements"],
    grades: [
      { name: "Commandant", pay: 4200, quota: 2 },
      { name: "Lieutenant de Terrain", pay: 3900, quota: 2 },
      { name: "Superviseur", pay: 3000, quota: 3 },
      { name: "Sergent Elite", pay: 2300, quota: 2 },
      { name: "Sergent Prestige", pay: 2100, quota: 3 },
      { name: "Sergent", pay: 1900, quota: 4 },
      { name: "Caporal Elite", pay: 2000, quota: 2 },
      { name: "Caporal Prestige", pay: 1850, quota: 3 },
      { name: "Caporal", pay: 1700, quota: 8 },
      { name: "Soldat", pay: 1600, quota: 39 },
      { name: "Class-S", pay: 150, quota: 4 },
      { name: "Class-B", pay: 120, quota: 4 },
      { name: "Class-D", pay: 90, quota: 24 },
    ],
  },
  {
    id: "recherche",
    name: "Departement Scientifique",
    omega: "O3",
    director: "Directeur Scientifique",
    utilities: ["Recherche", "Soin", "Archives", "Technologie", "Experience"],
    grades: [
      { name: "Responsable", pay: 3900, quota: 3 },
      { name: "Scientifique Qualifier", pay: 3800, quota: 4 },
      { name: "Scientifique Aguerris", pay: 3300, quota: 8 },
      { name: "Scientifique", pay: 2900, quota: 11 },
      { name: "Chercheur Experimenteur", pay: 2600, quota: 2 },
      { name: "Chercheur Competent", pay: 2200, quota: 3 },
      { name: "Chercheur", pay: 1900, quota: 4 },
      { name: "Archiviste", pay: 1500, quota: 4 },
      { name: "Dr.", pay: 3600, quota: 3 },
      { name: "Medecin / Psychologue", pay: 3300, quota: 12 },
      { name: "M/C Dr.", pay: 1700, quota: 6 },
    ],
  },
  {
    id: "maintenance",
    name: "Departement Maintenance",
    omega: "O4",
    director: "Directeur Maintenance",
    utilities: ["Entretiens", "Reparation", "Livraison", "Commande", "Construction"],
    grades: [
      { name: "Superviseur", pay: 4200, quota: 2 },
      { name: "Responsable", pay: 3900, quota: 1 },
      { name: "Chef", pay: 2800, quota: 3 },
      { name: "Chef d'equipe", pay: 2600, quota: 3 },
      { name: "Travailleur", pay: 2300, quota: 15 },
    ],
  },
  {
    id: "general",
    name: "Departement General",
    omega: "O5",
    director: "Directeur General",
    utilities: ["Secretariat", "Restauration", "Nettoyage", "Paye", "Communication"],
    grades: [],
  },
];

export const TOTAL_WEEKLY_PAYROLL = 54080;

export function findDepartment(id: string): DeptInfo | undefined {
  return departments.find((d) => d.id === id);
}
