import { notFound } from "next/navigation";
import { gameEvents } from "@/data/lore";
import { Badge } from "@/components/ui/Badge";
import { CLEARANCE_LABELS } from "@/lib/clearance";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return gameEvents.map((e) => ({ id: e.id }));
}

export default async function EvenementDetailPage({ params }: Props) {
  const { id } = await params;
  const event = gameEvents.find((e) => e.id === id);
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
