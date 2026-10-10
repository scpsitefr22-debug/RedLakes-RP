import Link from "next/link";
import { getFactionTheme } from "@/lib/faction-themes";
import type { ApiFaction } from "@/lib/faction-api";
import { FactionThemeScope } from "@/components/factions/FactionThemeScope";

interface Props {
  faction: ApiFaction;
  gradeCount: number;
}

/**
 * La Fondation en tête de l'index /factions : c'est le cœur du serveur
 * (le Site-12), elle ne doit pas se perdre dans l'ordre alphabétique.
 * Les chiffres viennent tous de la base (grades, départements, membres).
 */
export function FeaturedFaction({ faction, gradeCount }: Props) {
  const theme = getFactionTheme(faction.slug);
  const Icon = theme.icon;
  const stats = [
    { value: gradeCount, label: "Grades au Site-12" },
    { value: faction.departments.length, label: "Départements" },
    { value: faction.memberCount, label: "Membres actifs" },
  ].filter((stat) => stat.value > 0);

  return (
    <FactionThemeScope theme={theme} as="article">
      <div
        className="faction-card grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
        style={{ borderLeftColor: theme.colors.primary, borderLeftWidth: 4 }}
      >
        <div className="min-w-0">
          <p className="faction-kicker mb-3 text-[11px]">{theme.kicker}</p>
          <div className="flex items-center gap-4">
            <Icon className="h-9 w-9 shrink-0" style={{ color: theme.colors.accent }} />
            <h2 className="faction-heading text-4xl font-bold text-white sm:text-5xl">{faction.name}</h2>
          </div>
          {faction.tagline && <p className="mt-4 text-lg italic text-gray-300">{faction.tagline}</p>}
          {faction.description && (
            <p className="mt-3 max-w-2xl text-gray-400">{faction.description}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/factions/${faction.slug}`}
              className="font-display inline-flex items-center gap-2 bg-redlake-glow px-6 py-3 text-base font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#ff4a3f]"
            >
              Voir la Fondation →
            </Link>
            <Link
              href="/departements/site-12"
              className="font-display inline-flex items-center gap-2 border border-line-strong px-6 py-3 text-base font-bold uppercase tracking-[0.12em] text-gray-200 transition-colors hover:border-white hover:text-white"
            >
              Organigramme du Site-12
            </Link>
          </div>
        </div>

        {stats.length > 0 && (
          <dl className="grid grid-cols-3 gap-6 lg:grid-cols-1 lg:gap-4 lg:border-l lg:border-line lg:pl-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="label-mono mt-1 text-[10px] text-gray-400">{stat.label}</dt>
                <dd className="font-display text-5xl font-extrabold leading-none text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </FactionThemeScope>
  );
}
