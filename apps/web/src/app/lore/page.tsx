import { LoreCatalog } from "@/components/lore/LoreCatalog";

export const metadata = { title: "Lore" };

export default function LorePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="label-mono mb-3 flex items-center gap-2 text-redlake-glow">
          <span className="h-px w-8 bg-redlake-glow" aria-hidden />
          Encyclopédie narrative
        </p>
        <h1 className="font-display text-5xl font-extrabold text-white">Lore</h1>
        <p className="mt-4 max-w-2xl text-gray-400">
          L&apos;histoire du monde, des factions, des guerres et des événements. Certains dossiers
          dépendent de votre département.
        </p>
      </div>
      <LoreCatalog />
    </div>
  );
}
