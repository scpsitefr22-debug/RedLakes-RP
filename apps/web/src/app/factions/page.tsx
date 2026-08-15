import { getFactions } from "@/lib/faction-api";
import { FactionCard } from "@/components/factions/FactionCard";

export const metadata = { title: "Factions" };

export default async function FactionsPage() {
  const factions = await getFactions();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-12">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          ORGANISATIONS RECENSÉES
        </p>
        <h1 className="text-4xl font-bold text-white">Factions</h1>
        <p className="mt-4 max-w-2xl text-gray-500">
          Toutes les organisations actives sur REDLAKES : gouvernementales,
          anomales, criminelles et occultes.
        </p>
      </div>

      {factions.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          <p>Catalogue indisponible pour le moment. Réessayez plus tard.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {factions.map((faction, i) => (
            <FactionCard key={faction.id} faction={faction} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
