import { timelineEvents } from "@/data/timeline";
import { ChronologieCatalog } from "@/components/chronologie/ChronologieCatalog";

export const metadata = { title: "Chronologie" };

export default function ChronologiePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          ARCHIVES TEMPORELLES COMPLÈTES
        </p>
        <h1 className="text-4xl font-bold text-white">Chronologie</h1>
        <p className="mt-4 text-gray-500">
          {timelineEvents.length} événements référencés, de 1945 à aujourd&apos;hui.
        </p>
      </div>

      <ChronologieCatalog events={timelineEvents} />
    </div>
  );
}
