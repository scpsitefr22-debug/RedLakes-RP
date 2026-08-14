import { timelineEvents } from "@/data/timeline";
import { Badge } from "@/components/ui/Badge";
import { CLEARANCE_LABELS } from "@/lib/clearance";

export const metadata = { title: "Chronologie" };

const typeColors: Record<string, string> = {
  fondation: "border-blue-400/30 text-blue-400",
  incident: "border-yellow-400/30 text-yellow-400",
  guerre: "border-red-400/30 text-red-400",
  breach: "border-orange-400/30 text-orange-400",
  faction: "border-purple-400/30 text-purple-400",
};

export default function ChronologiePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          ARCHIVES TEMPORELLES COMPLÈTES
        </p>
        <h1 className="text-4xl font-bold text-white">Chronologie</h1>
      </div>

      <div className="relative space-y-0">
        <div className="absolute left-8 top-0 hidden h-full w-px bg-redlake/30 md:block" />
        {timelineEvents.map((event) => (
          <div key={event.id} className="relative flex gap-6 pb-12">
            <div className="hidden h-4 w-4 shrink-0 rounded-full border-2 border-redlake-glow bg-black md:ml-6 md:block" />
            <div className="flex-1 hologram-border rounded-lg p-6">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="font-mono text-2xl font-bold text-redlake-glow">
                  {event.year}
                </span>
                <Badge className={typeColors[event.type]}>{event.type}</Badge>
                <span className="font-mono text-xs text-gray-600">
                  {CLEARANCE_LABELS[event.clearance]}
                </span>
              </div>
              <h2 className="mb-2 text-xl font-bold text-white">{event.title}</h2>
              <p className="text-gray-500">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
