import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { API_URL } from "@/lib/api";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";

interface Props {
  params: Promise<{ id: string }>;
}

interface ApiGameEventDetail {
  title: string;
  date: string;
  description: string;
  casualties: string | null;
  outcome: string;
}

async function getGameEvent(slug: string): Promise<ApiGameEventDetail | null> {
  try {
    const res = await fetch(`${API_URL}/events/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function EvenementDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getGameEvent(id);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="mb-2 font-mono text-sm text-gray-600">
        {formatDate(event.date)}
      </p>
      <h1 className="mb-8 text-4xl font-bold text-white">{event.title}</h1>

      <div className="space-y-6">
        <section className="hologram-border rounded-lg p-6">
          <DiscordMarkdown text={event.description} className="text-gray-400" />
        </section>
        {event.casualties && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-2 font-bold text-white">Victimes</h2>
            <DiscordMarkdown text={event.casualties} className="text-gray-500" />
          </section>
        )}
        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-2 font-bold text-white">Issue</h2>
          <DiscordMarkdown text={event.outcome} className="text-gray-500" />
        </section>
      </div>
    </div>
  );
}
