"use client";

import { motion, type Variants } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { CLEARANCE_LABELS, type ClearanceLevel } from "@/lib/clearance";
import type { FactionTheme } from "@/lib/faction-themes";
import type { ApiFaction } from "@/lib/faction-api";
import { cn } from "@/lib/utils";

const HERO_VARIANTS: Record<FactionTheme["motion"], Variants> = {
  reveal: {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  },
  scan: {
    hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
    show: { opacity: 1, clipPath: "inset(0 0% 0 0)", transition: { duration: 0.8, ease: "easeInOut" } },
  },
  glitch: {
    hidden: { opacity: 0, x: -10, skewX: -3 },
    show: { opacity: 1, x: 0, skewX: 0, transition: { duration: 0.3, ease: "easeOut" } },
  },
  ceremonial: {
    hidden: { opacity: 0, scale: 0.97 },
    show: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: "easeInOut" } },
  },
  siren: {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  },
  flicker: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.6 } },
  },
  formal: {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  },
};

interface Props {
  faction: ApiFaction;
  theme: FactionTheme;
  totalRoles: number;
  roleCategoryCount: number;
}

export function FactionHero({ faction, theme, totalRoles, roleCategoryCount }: Props) {
  const clearance = Math.min(Math.max(faction.clearance, 1), 5) as ClearanceLevel;
  const Icon = theme.icon;

  return (
    <motion.header
      initial="hidden"
      animate="show"
      variants={HERO_VARIANTS[theme.motion]}
      className={cn(
        "faction-card mb-8 p-8",
        theme.motion === "siren" && "faction-siren-pulse",
        theme.motion === "ceremonial" && "faction-glow-pulse"
      )}
    >
      <p className="faction-kicker mb-3 text-xs">{theme.kicker}</p>

      <div className="mb-4 flex items-center gap-4">
        {faction.slug === "aegis" && (
          <img src="/logo-aegis.svg" alt="A.E.G.I.S." className="h-16 w-16 shrink-0" />
        )}
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border",
            theme.motion === "flicker" && "faction-neon-flicker"
          )}
          style={{ borderColor: theme.colors.primary, color: theme.colors.accent }}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="faction-heading text-4xl font-bold text-white">{faction.name}</h1>
          {faction.tagline && <p className="italic text-gray-400">{faction.tagline}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="classified">{CLEARANCE_LABELS[clearance]}</Badge>
        {faction.playable && (
          <span className="inline-flex items-center rounded border border-green-400/30 bg-green-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-green-400">
            Jouable
          </span>
        )}
        {faction.departments.length > 0 && (
          <Badge>
            {faction.departments.length} département{faction.departments.length > 1 ? "s" : ""}
          </Badge>
        )}
        {totalRoles > 0 && (
          <Badge>
            {roleCategoryCount} catégories • {totalRoles} rôles
          </Badge>
        )}
      </div>
    </motion.header>
  );
}
