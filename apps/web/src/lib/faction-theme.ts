export interface FactionTheme {
  label: string;
  tagline: string;
  color: string;
  network: string;
}

const DEFAULT_THEME: FactionTheme = {
  label: "Réseau indépendant",
  tagline: "Terminal RP standard. Déposez vos rapports au staff.",
  color: "#8b0a0a",
  network: "RÉSEAU GÉNÉRAL",
};

const FACTION_THEMES: Record<string, FactionTheme> = {
  fondation: {
    label: "Fondation SCP",
    tagline: "Rapports d'incidents, habilitation et secteurs autorisés par votre grade.",
    color: "#8b0a0a",
    network: "RÉSEAU INTERNE // SITE-12",
  },
  police: {
    label: "REDLAKES Police Department",
    tagline: "Mains courantes, réquisitions et suivi des interventions du service.",
    color: "#2563eb",
    network: "RÉSEAU // RPD",
  },
  gouvernement: {
    label: "Gouvernement",
    tagline: "Notes de service, dossiers administratifs et communiqués officiels.",
    color: "#1e3a5f",
    network: "RÉSEAU // ADMINISTRATION",
  },
  crime: {
    label: "Crime Organisé",
    tagline: "Canal chiffré. Ce qui est écrit ici n'existe pour personne d'autre.",
    color: "#374151",
    network: "CANAL NON-RÉFÉRENCÉ",
  },
  chaos: {
    label: "Insurrection du Chaos",
    tagline: "La Fondation croit tout contrôler. Documentez ce qu'elle ne voit pas.",
    color: "#2d5016",
    network: "SIGNAL LIBRE",
  },
  aegis: {
    label: "A.E.G.I.S.",
    tagline: "Supervision inter-agences. Vos rapports engagent la Fondation entière.",
    color: "#c0c0c0",
    network: "RÉSEAU // OVERSIGHT",
  },
  goc: {
    label: "Global Occult Coalition",
    tagline: "Rapports opérationnels — coordination hors juridiction Fondation.",
    color: "#1a3a5c",
    network: "RÉSEAU // GOC",
  },
  "main-serpent": {
    label: "Main du Serpent",
    tagline: "Certaines choses ne se couchent pas sur le papier. Faites au mieux.",
    color: "#4a0080",
    network: "SANS NOM",
  },
  civil: {
    label: "Civil & Ville",
    tagline: "La vie continue à la surface. Rien à voir avec ce qui se passe sous terre.",
    color: "#6b7280",
    network: "RÉSEAU // VILLE DE REDLAKES",
  },
};

export function getFactionTheme(slug: string | null | undefined): FactionTheme {
  if (!slug) return DEFAULT_THEME;
  return FACTION_THEMES[slug] ?? DEFAULT_THEME;
}
