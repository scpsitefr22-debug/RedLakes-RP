import { API_URL } from "@/lib/api";
import { EvenementsCatalog } from "@/components/evenements/EvenementsCatalog";

export const metadata = { title: "Événements" };

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
    const res = await fetch(`${API_URL}/events`, { cache: "no-store" });
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

      <EvenementsCatalog gameEvents={gameEvents} />
    </div>
  );
}
