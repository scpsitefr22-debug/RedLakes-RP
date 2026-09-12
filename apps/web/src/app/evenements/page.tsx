import { cookies } from "next/headers";
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

/** Meme correctif que evenements/[id] : le cookie n'etait jamais transmis. */
async function getGameEvents(): Promise<ApiGameEvent[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("redlakes_token")?.value;
  try {
    const res = await fetch(`${API_URL}/events`, {
      cache: "no-store",
      headers: token ? { Cookie: `redlakes_token=${token}` } : undefined,
    });
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
