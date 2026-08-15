export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: "mise-a-jour" | "scp" | "evenement" | "lore";
  image?: string;
  featured?: boolean;
}

export const newsArticles: NewsArticle[] = [
  {
    id: "pre-ouverture",
    title: "REDLAKES RP — Phase de préparation",
    excerpt:
      "Le serveur Minecraft est en construction. L'encyclopédie est ouverte, les candidatures staff et lore sont actives.",
    date: "2026-06-19",
    category: "lore",
    featured: true,
  },
  {
    id: "breach-site12",
    title: "Incident de confinement — Secteur Keter-02",
    excerpt:
      "Une brèche partielle a été contenue après 47 minutes. Le personnel Class-D a subi des pertes acceptables selon le protocole en vigueur.",
    date: "2026-06-15",
    category: "evenement",
    featured: true,
  },
  {
    id: "scp-████-added",
    title: "Nouveau confinement : SCP-████",
    excerpt:
      "Une entité Euclid a été transférée depuis Site-19. Accès restreint aux chercheurs Niveau 3+.",
    date: "2026-06-10",
    category: "scp",
  },
  {
    id: "aegis-audit",
    title: "Rapport d'inspection A.E.G.I.S. — Niveau 3",
    excerpt:
      "Une instance de conformité forcée a été déclenchée suite à des dérives éthiques documentées. Gel du Projet ████.",
    date: "2026-06-08",
    category: "lore",
    featured: true,
  },
  {
    id: "fim-nu7-deployment",
    title: "Déploiement FIM Nu-7 — Opération Mur de Fer",
    excerpt:
      "L'escouade « Hammer Down » a été mobilisée pour sécuriser la zone industrielle après activité CI détectée.",
    date: "2026-06-01",
    category: "evenement",
  },
  {
    id: "update-v3",
    title: "Mise à jour serveur v3.2 — Systèmes de grades",
    excerpt:
      "Refonte complète de la hiérarchie Site-12, nouvelles équipes Elite et Prestige, accès révisés.",
    date: "2026-05-28",
    category: "mise-a-jour",
  },
  {
    id: "main-serpent-ritual",
    title: "Activité Main du Serpent — Rituel intercepté",
    excerpt:
      "Le département de renseignement a détecté une cérémonie dans les égouts. Artefact non récupéré.",
    date: "2026-05-20",
    category: "lore",
  },
];

export const categoryLabels: Record<NewsArticle["category"], string> = {
  "mise-a-jour": "Mise à jour",
  scp: "Nouveau SCP",
  evenement: "Événement",
  lore: "Changement de lore",
};
