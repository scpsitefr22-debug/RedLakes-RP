/**
 * Système de thématisation par faction — un seul point de vérité pour la
 * palette étendue, la police de titre, le style de motif de fond et le
 * style d'animation de chaque faction. Consommé par `FactionThemeScope`
 * et les composants sous `src/components/factions/`.
 *
 * Objectif (brief "Identités de faction") : chaque faction doit être un
 * monde visuel reconnaissable — pas juste une couleur d'accent différente —
 * tout en restant un seul système cohérent (pas de styles dispersés en
 * `if (faction.slug === ...)` dans les pages).
 */
import {
  Oswald,
  Black_Ops_One,
  Cinzel,
  Teko,
  Libre_Baskerville,
  Bebas_Neue,
  Monoton,
} from "next/font/google";
import {
  ShieldAlert,
  ScanEye,
  FlameKindling,
  Eye,
  Crosshair,
  Landmark,
  Siren,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Les loaders next/font/google doivent être appelés au niveau module (pas
// conditionnellement) — next les auto-héberge au build, aucune requête
// externe en runtime. Un seul poids/sous-ensemble par police : usage
// réservé aux titres (jamais au texte courant, pour la lisibilité).
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-aegis",
  display: "swap",
});
const blackOpsOne = Black_Ops_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-chaos",
  display: "swap",
});
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-serpent",
  display: "swap",
});
const teko = Teko({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-goc",
  display: "swap",
});
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gouvernement",
  display: "swap",
});
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-police",
  display: "swap",
});
const monoton = Monoton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-crime",
  display: "swap",
});

export type FactionMotif =
  | "redacted" // Fondation — défaut du site
  | "clinical" // AEGIS — audit, salle blanche
  | "stencil" // Chaos — pochoir, tract
  | "occult" // Main du Serpent — grimoire, bougie
  | "tactical" // GOC — quadrillage, viseur
  | "letterhead" // Gouvernement — en-tête officiel
  | "badge" // Police — insigne, gyrophare
  | "neon"; // Crime — enseigne néon, ruelle

export type FactionMotion =
  | "reveal" // fondu + montée standard
  | "scan" // balayage type scanner
  | "glitch" // secousse/décalage rapide
  | "ceremonial" // fondu lent, respiration
  | "siren" // pulsation bleu/rouge
  | "flicker" // scintillement néon irrégulier
  | "formal"; // fondu très sobre

export interface FactionTheme {
  slug: string;
  /** Couleurs "réelles" (hex) — usage direct en style inline (icônes, etc.) */
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  /** Couleurs pré-calculées en rgba — usage CSS custom properties */
  rgba: {
    /** Fond très diffus (lavis) */
    surface: string;
    /** Bordure des panneaux */
    border: string;
  };
  /** Classe(s) de variable de police à poser sur le scope (chaîne vide = police du site) */
  fontVariable: string;
  /** Expression CSS `var(--font-x)` pour les titres, avec repli sur la police du site */
  headingFont: string;
  motif: FactionMotif;
  motion: FactionMotion;
  icon: LucideIcon;
  /** Étiquette courte affichée au-dessus du nom de la faction */
  kicker: string;
}

const FONDATION_THEME: FactionTheme = {
  slug: "fondation",
  colors: {
    primary: "#8b0a0a",
    secondary: "#5c0606",
    accent: "#c41e1e",
    glow: "#c41e1e",
  },
  rgba: {
    surface: "rgba(139, 10, 10, 0.15)",
    border: "rgba(139, 10, 10, 0.4)",
  },
  fontVariable: "",
  headingFont: "var(--font-sans)",
  motif: "redacted",
  motion: "reveal",
  icon: ShieldAlert,
  kicker: "ORGANISATION CLASSIFIÉE — RÉFÉRENCE SITE-12",
};

export const FACTION_THEMES: Record<string, FactionTheme> = {
  fondation: FONDATION_THEME,
  aegis: {
    slug: "aegis",
    colors: {
      primary: "#c0c0c0",
      secondary: "#e5e7eb",
      accent: "#f5f5f5",
      glow: "#ffffff",
    },
    rgba: {
      surface: "rgba(192, 192, 192, 0.07)",
      border: "rgba(192, 192, 192, 0.35)",
    },
    fontVariable: oswald.variable,
    headingFont: "var(--font-aegis)",
    motif: "clinical",
    motion: "scan",
    icon: ScanEye,
    kicker: "AUTORITÉ SUPRANATIONALE — AUDIT PERMANENT",
  },
  chaos: {
    slug: "chaos",
    colors: {
      primary: "#2d5016",
      secondary: "#1a3009",
      accent: "#b91c1c",
      glow: "#dc2626",
    },
    rgba: {
      surface: "rgba(45, 80, 22, 0.16)",
      border: "rgba(45, 80, 22, 0.5)",
    },
    fontVariable: blackOpsOne.variable,
    headingFont: "var(--font-chaos)",
    motif: "stencil",
    motion: "glitch",
    icon: FlameKindling,
    kicker: "CELLULE INSURGÉE — DIFFUSION CLANDESTINE",
  },
  "main-serpent": {
    slug: "main-serpent",
    colors: {
      primary: "#4a0080",
      secondary: "#2e004f",
      accent: "#c9a227",
      glow: "#c9a227",
    },
    rgba: {
      surface: "rgba(74, 0, 128, 0.18)",
      border: "rgba(154, 106, 12, 0.4)",
    },
    fontVariable: cinzel.variable,
    headingFont: "var(--font-serpent)",
    motif: "occult",
    motion: "ceremonial",
    icon: Eye,
    kicker: "ORDRE OCCULTE — SAVOIR INTERDIT",
  },
  goc: {
    slug: "goc",
    colors: {
      primary: "#1a3a5c",
      secondary: "#0d1f30",
      accent: "#dc2626",
      glow: "#ef4444",
    },
    rgba: {
      surface: "rgba(26, 58, 92, 0.2)",
      border: "rgba(26, 58, 92, 0.55)",
    },
    fontVariable: teko.variable,
    headingFont: "var(--font-goc)",
    motif: "tactical",
    motion: "reveal",
    icon: Crosshair,
    kicker: "COALITION MILITARISÉE — DOSSIER OPÉRATIONNEL",
  },
  gouvernement: {
    slug: "gouvernement",
    colors: {
      primary: "#1e3a5f",
      secondary: "#33547d",
      accent: "#c9a227",
      glow: "#e0b84a",
    },
    rgba: {
      surface: "rgba(30, 58, 95, 0.1)",
      border: "rgba(30, 58, 95, 0.4)",
    },
    fontVariable: libreBaskerville.variable,
    headingFont: "var(--font-gouvernement)",
    motif: "letterhead",
    motion: "formal",
    icon: Landmark,
    kicker: "ADMINISTRATION PUBLIQUE — VILLE DE REDLAKES",
  },
  police: {
    slug: "police",
    colors: {
      primary: "#2563eb",
      secondary: "#0f172a",
      accent: "#dc2626",
      glow: "#3b82f6",
    },
    rgba: {
      surface: "rgba(37, 99, 235, 0.14)",
      border: "rgba(37, 99, 235, 0.4)",
    },
    fontVariable: bebasNeue.variable,
    headingFont: "var(--font-police)",
    motif: "badge",
    motion: "siren",
    icon: Siren,
    kicker: "FORCES DE L'ORDRE — RAPPORT DE SERVICE",
  },
  crime: {
    slug: "crime",
    colors: {
      primary: "#374151",
      secondary: "#111827",
      accent: "#f472b6",
      glow: "#ec4899",
    },
    rgba: {
      surface: "rgba(55, 65, 81, 0.22)",
      border: "rgba(55, 65, 81, 0.55)",
    },
    fontVariable: monoton.variable,
    headingFont: "var(--font-crime)",
    motif: "neon",
    motion: "flicker",
    icon: Zap,
    kicker: "RÉSEAU CLANDESTIN — AUCUNE AFFILIATION OFFICIELLE",
  },
  /**
   * Pas une des 9 factions jouables avec fiche publique (pas d'entrée dans
   * data/factions.ts) — mais "Civil" est la valeur par defaut reelle de
   * Player.faction (voir schema.prisma), donc REDLAKES CORE a besoin d'une
   * identite visuelle neutre dediee plutot que de retomber silencieusement
   * sur le rouge "classifie" de la Fondation via getFactionTheme().
   */
  civil: {
    slug: "civil",
    colors: {
      primary: "#5c5c5c",
      secondary: "#3a3a3a",
      accent: "#9ca3af",
      glow: "#d1d5db",
    },
    rgba: {
      surface: "rgba(92, 92, 92, 0.1)",
      border: "rgba(92, 92, 92, 0.35)",
    },
    fontVariable: "",
    headingFont: "var(--font-sans)",
    motif: "letterhead",
    motion: "formal",
    icon: Landmark,
    kicker: "ACCÈS CIVIL — RÉSEAU PUBLIC DE REDLAKES",
  },
};

export function getFactionTheme(slug: string): FactionTheme {
  return FACTION_THEMES[slug] ?? FONDATION_THEME;
}
