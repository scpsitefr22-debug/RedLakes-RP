import { getFactions, getLiveGrades, type ApiFaction } from "@/lib/faction-api";
import { gradesForFaction } from "@/lib/faction-stats";
import { FactionCard } from "@/components/factions/FactionCard";
import { FeaturedFaction } from "@/components/factions/FeaturedFaction";

export const metadata = { title: "Factions" };

/**
 * Deux familles, tirées des descriptions mêmes des factions : ce qui vit à
 * la surface de RedLakes, et les organisations qui connaissent les anomalies.
 * Une faction ajoutée plus tard sans famille tombe dans « Autres organisations ».
 */
const GROUPS = [
  {
    title: "La ville",
    subtitle: "La surface de RedLakes : ses institutions, ses habitants et son milieu.",
    slugs: ["civil", "gouvernement", "police", "crime"],
  },
  {
    title: "Le monde caché",
    subtitle: "Les organisations qui savent ce qui se cache sous la ville.",
    slugs: ["aegis", "goc", "chaos", "main-serpent"],
  },
];

export default async function FactionsPage() {
  const [factions, grades] = await Promise.all([getFactions(), getLiveGrades()]);
  const slugs = factions.map((f) => f.slug);
  const gradeCount = (faction: ApiFaction) => gradesForFaction(grades, faction.slug, slugs).length;

  const featured = factions.find((f) => f.slug === "fondation");
  const grouped = new Set(GROUPS.flatMap((g) => g.slugs));
  const sections = [
    ...GROUPS.map((group) => ({
      ...group,
      factions: group.slugs
        .map((slug) => factions.find((f) => f.slug === slug))
        .filter((f): f is ApiFaction => Boolean(f)),
    })),
    {
      title: "Autres organisations",
      subtitle: "",
      slugs: [],
      factions: factions.filter((f) => f.slug !== "fondation" && !grouped.has(f.slug)),
    },
  ].filter((section) => section.factions.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10">
        <p className="label-mono mb-3 flex items-center gap-2 text-redlake-glow">
          <span className="h-px w-8 bg-redlake-glow" aria-hidden />
          Organisations recensées
        </p>
        <h1 className="font-display text-5xl font-extrabold text-white">Factions</h1>
        <p className="mt-4 max-w-2xl text-gray-400">
          Toutes les organisations actives sur REDLAKES : gouvernementales, anomales, criminelles
          et occultes. Le recrutement se fait en jeu.
        </p>
      </div>

      {factions.length === 0 ? (
        <div className="hologram-border p-8 text-center text-gray-400">
          <p>Catalogue indisponible pour le moment. Réessayez plus tard.</p>
        </div>
      ) : (
        <div className="space-y-14">
          {featured && <FeaturedFaction faction={featured} gradeCount={gradeCount(featured)} />}

          {sections.map((section) => (
            <section key={section.title}>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b border-line pb-3">
                <h2 className="font-display text-3xl font-extrabold uppercase text-white">
                  {section.title}
                </h2>
                {section.subtitle && <p className="text-sm text-gray-400">{section.subtitle}</p>}
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {section.factions.map((faction, i) => (
                  <FactionCard
                    key={faction.id}
                    faction={faction}
                    index={i}
                    gradeCount={gradeCount(faction)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
