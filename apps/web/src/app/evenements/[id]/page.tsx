import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { CLEARANCE_LABELS, ClearanceLevel } from "@/lib/clearance";
import { formatDate } from "@/lib/utils";
import { API_URL } from "@/lib/api";

interface Props {
  params: Promise<{ id: string }>;
}

interface ApiGameEventDetail {
  title: string;
  date: string;
  description: string;
  casualties: string | null;
  outcome: string;
  clearance: ClearanceLevel;
}

async function getGameEvent(slug: string): Promise<ApiGameEventDetail | null> {
  try {
    const res = await fetch(`${API_URL}/events/${slug}`, { next: { revalidate: 60 } });
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
      <Badge variant="classified" className="mb-4">
        {CLEARANCE_LABELS[event.clearance]}
      </Badge>
      <p className="mb-2 font-mono text-sm text-gray-600">
        {formatDate(event.date)}
      </p>
      <h1 className="mb-8 text-4xl font-bold text-white">{event.title}</h1>

      <div className="space-y-6">
        <section className="hologram-border rounded-lg p-6">
          <p className="text-gray-400">{event.description}</p>
        </section>
        {event.casualties && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-2 font-bold text-white">Victimes</h2>
            <p className="text-gray-500">{event.casualties}</p>
          </section>
        )}
        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-2 font-bold text-white">Issue</h2>
          <p className="text-gray-500">{event.outcome}</p>
        </section>
      </div>
    </div>
  );
}
