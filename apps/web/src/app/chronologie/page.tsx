import { timelineEvents } from "@/data/timeline";
import { ChronologieCatalog } from "@/components/chronologie/ChronologieCatalog";

export const metadata = { title: "Chronologie" };

export default function ChronologiePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="label-mono mb-3 flex items-center gap-2 text-redlake-glow">
          <span className="h-px w-8 bg-redlake-glow" aria-hidden />
          Archives temporelles
        </p>
        <h1 className="font-display text-5xl font-extrabold text-white">Chronologie</h1>
        <p className="mt-4 max-w-2xl text-gray-400">
          {timelineEvents.length} événements référencés, de {timelineEvents[0]?.year ?? "1945"} à aujourd&apos;hui.
        </p>
      </div>

      <ChronologieCatalog events={timelineEvents} />
    </div>
  );
}
