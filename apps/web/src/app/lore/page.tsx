import { LoreCatalog } from "@/components/lore/LoreCatalog";

export const metadata = { title: "Lore" };

export default function LorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-12">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          ENCYCLOPÉDIE NARRATIVE
        </p>
        <h1 className="text-4xl font-bold text-white">Lore</h1>
        <p className="mt-4 max-w-2xl text-gray-500">
          Histoire du monde, factions, guerres et événements — contenu filtré selon
          votre habilitation Site-12.
        </p>
      </div>
      <LoreCatalog />
    </div>
  );
}
