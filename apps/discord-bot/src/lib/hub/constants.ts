export const HUB_PREFIX = "rl:mainhub:";

/**
 * Items visibles dans le menu mais pas encore branches — necessitent un
 * changement cote API (session bot ou modele CORE manquant). Documente pour
 * ne jamais faire semblant qu'ils fonctionnent.
 */
export const SOON_LABELS: Record<string, string> = {
  candidatures: "Mes candidatures",
  sanctions: "Mes sanctions",
  missions: "Mes missions",
  notifications: "Mes notifications",
  candidatures_staff: "Candidatures",
  notifications_staff: "Notifications staff",
  outils: "Outils administratifs",
};

export const SOON_REASON: Record<string, string> = {
  candidatures:
    "API GAP — `GET /applications/me` exige une session utilisateur, inaccessible avec la cle bot.",
  sanctions:
    "API GAP — `GET /sanctions/player/:id` est reserve aux sessions STAFF/ADMIN, inaccessible avec la cle bot.",
  missions: "Le modele Mission n'existe pas encore dans le CORE.",
  notifications:
    "API GAP — le service de notifications existe cote API mais aucune route n'est encore exposee.",
  candidatures_staff:
    "API GAP — `GET /applications` exige une session STAFF/ADMIN, inaccessible avec la cle bot.",
  notifications_staff:
    "API GAP — aucune route n'est encore exposee pour les notifications.",
  outils: "Aucune fonctionnalite concrete identifiee pour l'instant.",
};

export const BRANCH_LABELS: Record<string, string> = {
  omega: "Conseil Oméga",
  direction: "Direction",
  securite: "Sécurité",
  scientifique: "Scientifique",
  maintenance: "Maintenance",
  general: "Général",
  classes: "Personnel détenu",
};

export const BRANCH_CHOICES = [
  { label: "Toutes les branches", value: "all", emoji: "🏛️" },
  { label: "Conseil Oméga", value: "omega", emoji: "👑" },
  { label: "Sécurité", value: "securite", emoji: "🔫" },
  { label: "Scientifique", value: "scientifique", emoji: "🔬" },
  { label: "Maintenance", value: "maintenance", emoji: "🔧" },
  { label: "Général", value: "general", emoji: "📋" },
];

export const SITE_LINKS: Record<string, { label: string; path: string; desc: string }> = {
  accueil: { label: "Accueil", path: "/", desc: "Portail REDLAKES." },
  dashboard: { label: "Mon dashboard", path: "/dashboard", desc: "Dossier agent, identité RP, liaison Discord." },
  wiki: { label: "Wiki SCP", path: "/wiki", desc: "Fiches des anomalies confinées." },
  lore: { label: "Lore", path: "/lore", desc: "Univers, chronologie, personnages." },
  factions: {
    label: "Factions",
    path: "/factions",
    desc: "Fondation, AEGIS, Chaos, Main du Serpent...",
  },
  aegis: { label: "A.E.G.I.S.", path: "/factions/aegis", desc: "Autorité de contrôle supranationale." },
  site12: { label: "Site-12", path: "/departements/site-12", desc: "Organigramme complet." },
  carte: { label: "Carte", path: "/carte", desc: "Carte interactive de REDLAKES." },
  chronologie: { label: "Chronologie", path: "/chronologie", desc: "Frise temporelle de l'univers." },
  actualites: { label: "Actualités", path: "/actualites", desc: "Annonces et nouvelles du serveur." },
  transmissions: {
    label: "Transmissions",
    path: "/transmissions",
    desc: "Flux Discord → Site, thème Fondation.",
  },
  archives: {
    label: "Archives classifiées",
    path: "/archives",
    desc: "Documents niveau 3+ (connexion requise).",
  },
};

export const CANDIDATURE_TYPES = [
  { label: "Staff", desc: "Modération, administration, support." },
  { label: "Rédacteur Lore", desc: "SCP, factions, chronologie." },
  { label: "Builder / Map", desc: "Site-12, ville, zones RP." },
  { label: "Recherche", desc: "Chercheurs, scientifiques." },
  { label: "Community / Admin", desc: "Discord, communication." },
];
