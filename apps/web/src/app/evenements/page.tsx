import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { API_URL } from "@/lib/api";

export const metadata = { title: "Événements" };

const typeLabels: Record<string, string> = {
  breach: "Brèche",
  invasion: "Invasion",
  guerre: "Guerre",
  "crise-xk": "Crise XK",
  experience: "Expérience ratée",
};

interface ApiGameEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
  type: string;
  description: string;
}

async function getGameEvents(): Promise<ApiGameEvent[]> {
  try {
    const res = await fetch(`${API_URL}/events`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function EvenementsPage() {
  const gameEvents = await getGameEvents();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white">Archives d&apos;événements</h1>
        <p className="mt-4 text-gray-500">
          Brèches, invasions, guerres, crises XK et expériences ratées.
        </p>
      </div>

      {gameEvents.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          Aucun événement disponible pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {gameEvents.map((event) => (
            <Link
              key={event.id}
              href={`/evenements/${event.slug}`}
              className="group block hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
            >
              <div className="mb-2 flex items-center gap-3">
                <Badge variant="keter">{typeLabels[event.type] ?? event.type}</Badge>
                <span className="font-mono text-xs text-gray-600">
                  {formatDate(event.date)}
                </span>
              </div>
              <h2 className="mb-2 text-xl font-bold text-white group-hover:text-redlake-glow">
                {event.title}
              </h2>
              <p className="text-gray-500">{event.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
