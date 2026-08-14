import type { ChapterManifest } from "../types/narrative.js";

export const CHAPTER_MANIFESTS: ChapterManifest[] = [
  {
    id: 1,
    title: "REDLAKES TERMINAL I",
    subtitle: "Intégration",
    description:
      "Premier jour au Site-12. Accès terminal, briefings RH, et une anomalie qui ne devrait pas exister dans le secteur Euclid.",
    requiredChapters: [],
    recommendedChapters: [],
    uniqueApps: [],
    mainCharacters: [
      "directeur-site",
      "superviseur-rh",
      "dr-chen",
      "cassie",
      "agent-securite-perimetre",
      "chercheur-junior-euclid",
      "technicien-maintenance",
    ],
    estimatedHours: 3,
  },
  {
    id: 2,
    title: "REDLAKES TERMINAL II",
    subtitle: "Protocoles",
    description: "Les protocoles de confinement ne sont pas des suggestions. Quelqu'un les contourne.",
    requiredChapters: [1],
    recommendedChapters: [1],
    uniqueApps: ["confinement-protocols"],
    mainCharacters: ["commandant-nu7", "dr-chen"],
    estimatedHours: 4,
  },
  {
    id: 3,
    title: "REDLAKES TERMINAL III",
    subtitle: "Surface",
    description: "REDLAKES la nuit. La ville respire. Moretti vous observe.",
    requiredChapters: [],
    recommendedChapters: [1, 2],
    uniqueApps: ["city-map"],
    mainCharacters: ["chef-moretti", "dr-chen"],
    estimatedHours: 4,
  },
  {
    id: 4,
    title: "REDLAKES TERMINAL IV",
    subtitle: "Égouts",
    description: "La Main du Serpent laisse des traces. La Fondation préfère ne pas regarder.",
    requiredChapters: [],
    recommendedChapters: [1, 2, 3],
    uniqueApps: ["sewer-schematics"],
    mainCharacters: ["initie-serpent"],
    estimatedHours: 5,
  },
  {
    id: 5,
    title: "REDLAKES TERMINAL V",
    subtitle: "Audit",
    description: "A.E.G.I.S. arrive. Pas de déploiement. Juste un rapport — et tout s'arrête.",
    requiredChapters: [],
    recommendedChapters: [1, 2, 3, 4],
    uniqueApps: ["aegis-database"],
    mainCharacters: ["inspecteur-aegis"],
    estimatedHours: 5,
  },
  {
    id: 6,
    title: "REDLAKES TERMINAL VI",
    subtitle: "Silence",
    description: "Des personnes disparaissent. Des messages sont supprimés. Le Site continue.",
    requiredChapters: [],
    recommendedChapters: [1, 2, 3, 4, 5],
    uniqueApps: ["deleted-files"],
    mainCharacters: ["directeur-site", "inspecteur-aegis"],
    estimatedHours: 5,
  },
  {
    id: 7,
    title: "REDLAKES TERMINAL VII",
    subtitle: "Brèche",
    description: "Keter ne demande pas la permission. Nu-7 déploie.",
    requiredChapters: [],
    recommendedChapters: [1, 2, 3, 4, 5, 6],
    uniqueApps: ["control-room"],
    mainCharacters: ["commandant-nu7", "dr-chen"],
    estimatedHours: 6,
  },
  {
    id: 8,
    title: "REDLAKES TERMINAL VIII",
    subtitle: "Corruption",
    description: "Le serveur ment. Les caméras aussi. CASSIE ne répond plus comme avant.",
    requiredChapters: [],
    recommendedChapters: [1, 2, 3, 4, 5, 6, 7],
    uniqueApps: ["corrupted-server", "admin-console"],
    mainCharacters: ["cassie", "inspecteur-aegis"],
    estimatedHours: 6,
  },
  {
    id: 9,
    title: "REDLAKES TERMINAL IX",
    subtitle: "Héritage",
    description: "Huit ans de choix convergent. Le Site se souvient — ou pas.",
    requiredChapters: [],
    recommendedChapters: [1, 2, 3, 4, 5, 6, 7, 8],
    uniqueApps: ["legacy-archive"],
    mainCharacters: [
      "directeur-site",
      "inspecteur-aegis",
      "dr-chen",
      "chef-moretti",
      "initie-serpent",
    ],
    estimatedHours: 8,
  },
];

export function getChapterManifest(id: number): ChapterManifest | undefined {
  return CHAPTER_MANIFESTS.find((c) => c.id === id);
}

export function getChapterEntryWarning(
  chapterId: number,
  completedChapters: number[]
): { level: "none" | "soft" | "hard"; message: string } | null {
  const manifest = getChapterManifest(chapterId);
  if (!manifest) return null;

  const missingRequired = manifest.requiredChapters.filter((c) => !completedChapters.includes(c));
  if (missingRequired.length > 0) {
    return {
      level: "hard",
      message: `Chapitres requis non terminés : ${missingRequired.join(", ")}.`,
    };
  }

  const missingRecommended = manifest.recommendedChapters.filter((c) => !completedChapters.includes(c));
  if (missingRecommended.length > 0 && chapterId >= 5) {
    return {
      level: chapterId === 9 ? "hard" : "soft",
      message:
        chapterId === 9
          ? "Sans les huit chapitres précédents, le Site vous traitera comme un inconnu. Certaines branches seront verrouillées."
          : `Chapitres recommandés non joués : ${missingRecommended.join(", ")}. L'expérience sera incomplète.`,
    };
  }

  return null;
}
