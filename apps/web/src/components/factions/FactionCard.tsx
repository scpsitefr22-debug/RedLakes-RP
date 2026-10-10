import Link from "next/link";
import { getFactionTheme } from "@/lib/faction-themes";
import type { ApiFaction } from "@/lib/faction-api";
import { FactionThemeScope } from "@/components/factions/FactionThemeScope";
import { cn } from "@/lib/utils";

interface Props {
  faction: ApiFaction;
  index: number;
  /** Nombre de grades de la faction (réglés dans Grades & accès). */
  gradeCount: number;
}

/**
 * Carte d'aperçu pour l'index /factions — chaque carte se thématise
 * elle-même (police, texture, couleurs) pour donner un avant-goût de
 * l'identité de la faction avant même le clic.
 */
export function FactionCard({ faction, index, gradeCount }: Props) {
  const theme = getFactionTheme(faction.slug);
  const Icon = theme.icon;

  return (
    <FactionThemeScope theme={theme} as="article">
      <Link
        href={`/factions/${faction.slug}`}
        className={cn(
          "faction-card faction-card-reveal group block h-full p-6 transition-transform duration-300 hover:-translate-y-0.5",
          theme.motion === "siren" && "faction-siren-pulse",
          theme.motion === "ceremonial" && "faction-glow-pulse"
        )}
        style={{
          animationDelay: `${index * 40}ms`,
          borderLeftColor: theme.colors.primary,
          borderLeftWidth: 4,
        }}
      >
        <p className="faction-kicker mb-2 text-[10px]">{theme.kicker}</p>

        <div className="mb-3 flex items-center gap-3">
          <Icon
            className={cn("h-6 w-6 shrink-0", theme.motion === "flicker" && "faction-neon-flicker")}
            style={{ color: theme.colors.accent }}
          />
          <h2 className="faction-heading text-2xl font-bold text-white group-hover:text-[var(--f-accent)]">
            {faction.name}
          </h2>
        </div>

        {faction.tagline && <p className="mb-3 italic text-gray-400">{faction.tagline}</p>}
        {faction.description && (
          <p className="line-clamp-3 text-sm text-gray-500">{faction.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs">
          {faction.playable && <span className="text-green-400">JOUABLE</span>}
          {gradeCount > 0 && (
            <span className="text-gray-400">
              {gradeCount} grade{gradeCount > 1 ? "s" : ""}
            </span>
          )}
          {faction.memberCount > 0 && (
            <span className="text-gray-400">
              {faction.memberCount} membre{faction.memberCount > 1 ? "s" : ""}
            </span>
          )}
          <span className="ml-auto text-gray-500 transition-colors group-hover:text-[var(--f-accent)]">
            Voir la faction →
          </span>
        </div>
      </Link>
    </FactionThemeScope>
  );
}
