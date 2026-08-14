export interface MapLocation {
  id: string;
  name: string;
  type: "site" | "surface" | "ville" | "egouts" | "criminel" | "labo" | "scp" | "portail" | "ennemi";
  x: number;
  y: number;
  description: string;
  history: string;
  danger: 1 | 2 | 3 | 4 | 5;
  faction?: string;
}

export const mapLocations: MapLocation[] = [
  {
    id: "site-12",
    name: "Site-12 — Complexe Principal",
    type: "site",
    x: 50,
    y: 45,
    description: "Installation souterraine principale. 70+ grades, 4 directeurs Oméga, départements complets.",
    history: "Fondé en 1962. Centre névralgique de REDLAKES.",
    danger: 3,
    faction: "Fondation SCP",
  },
  {
    id: "surface-alpha",
    name: "Zone Surface Alpha",
    type: "surface",
    x: 48,
    y: 30,
    description: "Entrée officielle camouflée en installation industrielle.",
    history: "Point d'accès principal pour le personnel autorisé.",
    danger: 2,
  },
  {
    id: "redlakes-city",
    name: "Ville de REDLAKES",
    type: "ville",
    x: 65,
    y: 55,
    description: "Zone urbaine DarkRP. Commerces, habitations, activités civiles.",
    history: "Couverture civile du site. Surveillance discrète permanente.",
    danger: 2,
    faction: "Gouvernement",
  },
  {
    id: "sewers",
    name: "Réseau d'Égouts",
    type: "egouts",
    x: 35,
    y: 60,
    description: "Tunnels souterrains. Base de la Main du Serpent et activités criminelles.",
    history: "Rituels occultes et passages secrets documentés.",
    danger: 4,
    faction: "Main du Serpent",
  },
  {
    id: "crime-district",
    name: "Quartier Criminel",
    type: "criminel",
    x: 72,
    y: 40,
    description: "Territoire des familles mafieuses, cartels et groupes indépendants.",
    history: "Zone de non-droit relative. Police et Fondation en surveillance.",
    danger: 4,
    faction: "Crime Organisé",
  },
  {
    id: "lab-keter",
    name: "Laboratoire Keter",
    type: "labo",
    x: 42,
    y: 50,
    description: "Installations de recherche haute sécurité. Expériences Keter-01 et Keter-02.",
    history: "Site de l'incident de juin 2026. Gel partiel par AEGIS.",
    danger: 5,
  },
  {
    id: "sector-scp",
    name: "Secteur Confinement SCP",
    type: "scp",
    x: 38,
    y: 42,
    description: "Chambres Class-D, Class-B, Class-S. Confinement de toutes classes.",
    history: "23 chambres Class-D actives. 4 chambres spéciales.",
    danger: 5,
  },
  {
    id: "portal-omega",
    name: "Portail Oméga",
    type: "portail",
    x: 55,
    y: 65,
    description: "Anomalie spatiale instable. Accès Niveau 5 uniquement.",
    history: "Découvert en 2008. Origine inconnue.",
    danger: 5,
  },
  {
    id: "ci-outpost",
    name: "Avant-poste CI",
    type: "ennemi",
    x: 80,
    y: 25,
    description: "Base connue de l'Insurrection du Chaos en périphérie.",
    history: "Repéré par renseignement en 2024. Non neutralisé.",
    danger: 4,
    faction: "Chaos Insurgency",
  },
  {
    id: "goc-facility",
    name: "Installation GOC",
    type: "ennemi",
    x: 20,
    y: 35,
    description: "Présence rivale du Global Occult Coalition.",
    history: "Tension diplomatique permanente avec la Fondation.",
    danger: 3,
    faction: "GOC",
  },
];

export const locationTypeLabels: Record<MapLocation["type"], string> = {
  site: "Site principal",
  surface: "Surface",
  ville: "Ville",
  egouts: "Égouts",
  criminel: "Zone criminelle",
  labo: "Laboratoire",
  scp: "Secteur SCP",
  portail: "Portail",
  ennemi: "Base ennemie",
};
