import Link from "next/link";
import { getFactionTheme } from "@/lib/faction-themes";
import type { ApiFaction } from "@/lib/faction-api";
import { FactionThemeScope } from "@/components/factions/FactionThemeScope";
import { cn } from "@/lib/utils";

interface Props {
  faction: ApiFaction;
  index: number;
}

/**
 * Carte d'aperçu pour l'index /factions — chaque carte se thématise
 * elle-même (police, texture, couleurs) pour donner un avant-goût de
 * l'identité de la faction avant même le clic.
 */
export function FactionCard({ faction, index }: Props) {
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

        <div className="mt-4 flex gap-3 font-mono text-xs">
          {faction.playable && <span className="text-green-400">JOUABLE</span>}
          <span className="text-gray-600">Niv. {faction.clearance}</span>
          {faction.departments.length > 0 && (
            <span className="text-gray-600">
              {faction.departments.length} département{faction.departments.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </Link>
    </FactionThemeScope>
  );
}
