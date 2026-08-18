export interface ReportTypeLabels {
  INCIDENT: string;
  AUTHORIZATION: string;
  MEMO: string;
  EQUIPMENT: string;
}

export interface FactionTheme {
  label: string;
  tagline: string;
  color: string;
  network: string;
  reportLabels: ReportTypeLabels;
}

const DEFAULT_REPORT_LABELS: ReportTypeLabels = {
  INCIDENT: "Rapport d'incident",
  AUTHORIZATION: "Demande d'autorisation",
  MEMO: "Mémo interne",
  EQUIPMENT: "Réquisition matériel",
};

const DEFAULT_THEME: FactionTheme = {
  label: "Réseau indépendant",
  tagline: "Terminal RP standard. Déposez vos rapports au staff.",
  color: "#8b0a0a",
  network: "RÉSEAU GÉNÉRAL",
  reportLabels: DEFAULT_REPORT_LABELS,
};

const FACTION_THEMES: Record<string, FactionTheme> = {
  fondation: {
    label: "Fondation SCP",
    tagline: "Rapports d'incidents, habilitation et secteurs autorisés par votre grade.",
    color: "#8b0a0a",
    network: "RÉSEAU INTERNE // SITE-12",
    reportLabels: DEFAULT_REPORT_LABELS,
  },
  police: {
    label: "REDLAKES Police Department",
    tagline: "Mains courantes, réquisitions et suivi des interventions du service.",
    color: "#2563eb",
    network: "RÉSEAU // RPD",
    reportLabels: {
      INCIDENT: "Rapport d'intervention",
      AUTHORIZATION: "Mandat / autorisation",
      MEMO: "Note de service",
      EQUIPMENT: "Réquisition matériel",
    },
  },
  gouvernement: {
    label: "Gouvernement",
    tagline: "Notes de service, dossiers administratifs et communiqués officiels.",
    color: "#1e3a5f",
    network: "RÉSEAU // ADMINISTRATION",
    reportLabels: {
      INCIDENT: "Signalement",
      AUTHORIZATION: "Décret / autorisation",
      MEMO: "Communiqué interne",
      EQUIPMENT: "Demande de budget",
    },
  },
  crime: {
    label: "Crime Organisé",
    tagline: "Canal chiffré. Ce qui est écrit ici n'existe pour personne d'autre.",
    color: "#374151",
    network: "CANAL NON-RÉFÉRENCÉ",
    reportLabels: {
      INCIDENT: "Problème sur le territoire",
      AUTHORIZATION: "Feu vert du patron",
      MEMO: "Message codé",
      EQUIPMENT: "Approvisionnement",
    },
  },
  chaos: {
    label: "Insurrection du Chaos",
    tagline: "La Fondation croit tout contrôler. Documentez ce qu'elle ne voit pas.",
    color: "#2d5016",
    network: "SIGNAL LIBRE",
    reportLabels: {
      INCIDENT: "Rapport d'opération",
      AUTHORIZATION: "Ordre de cellule",
      MEMO: "Transmission libre",
      EQUIPMENT: "Réquisition d'armement",
    },
  },
  aegis: {
    label: "A.E.G.I.S.",
    tagline: "Supervision inter-agences. Vos rapports engagent la Fondation entière.",
    color: "#c0c0c0",
    network: "RÉSEAU // OVERSIGHT",
    reportLabels: {
      INCIDENT: "Signalement de dérive",
      AUTHORIZATION: "Mandat d'enquête",
      MEMO: "Note de supervision",
      EQUIPMENT: "Réquisition",
    },
  },
  goc: {
    label: "Global Occult Coalition",
    tagline: "Rapports opérationnels — coordination hors juridiction Fondation.",
    color: "#1a3a5c",
    network: "RÉSEAU // GOC",
    reportLabels: {
      INCIDENT: "Rapport d'anomalie",
      AUTHORIZATION: "Ordre de mission",
      MEMO: "Note opérationnelle",
      EQUIPMENT: "Réquisition PSYCHE",
    },
  },
  "main-serpent": {
    label: "Main du Serpent",
    tagline: "Certaines choses ne se couchent pas sur le papier. Faites au mieux.",
    color: "#4a0080",
    network: "SANS NOM",
    reportLabels: {
      INCIDENT: "Présage rompu",
      AUTHORIZATION: "Sceau d'autorisation",
      MEMO: "Missive",
      EQUIPMENT: "Offrande requise",
    },
  },
  civil: {
    label: "Civil & Ville",
    tagline: "La vie continue à la surface. Rien à voir avec ce qui se passe sous terre.",
    color: "#6b7280",
    network: "RÉSEAU // VILLE DE REDLAKES",
    reportLabels: {
      INCIDENT: "Signalement citoyen",
      AUTHORIZATION: "Demande de permis",
      MEMO: "Message au conseil",
      EQUIPMENT: "Demande de matériel",
    },
  },
};

export function getFactionTheme(slug: string | null | undefined): FactionTheme {
  if (!slug) return DEFAULT_THEME;
  return FACTION_THEMES[slug] ?? DEFAULT_THEME;
}
