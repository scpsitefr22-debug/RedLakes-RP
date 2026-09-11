import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileLock2, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { API_URL } from "@/lib/api";
import { EditableText } from "@/components/staff/EditableText";
import { OptionalSection } from "@/components/staff/OptionalSection";

interface Props {
  params: Promise<{ id: string }>;
}

interface ApiScpRef {
  id: string;
  slug: string;
  number: string;
  name: string;
  class: "Safe" | "Euclid" | "Keter" | "Thaumiel" | "Apollyon";
}

interface ApiGameEventDetail {
  id: string;
  title: string;
  date: string;
  description: string;
  casualties: string | null;
  outcome: string;
  faction: { slug: string; name: string; color: string | null } | null;
  linkedDocuments: { id: string; slug: string; title: string; excerpt: string | null }[];
  linkedScpObjects: ApiScpRef[];
}

const SCP_CLASS_COLORS: Record<ApiScpRef["class"], string> = {
  Safe: "text-green-400",
  Euclid: "text-yellow-400",
  Keter: "text-red-400",
  Thaumiel: "text-purple-400",
  Apollyon: "text-orange-400",
};

/**
 * Fetch anonyme jusqu'ici (aucun cookie transmis) — un vrai bug, pas juste
 * une amelioration : un evenement restreint par departement/habilitation
 * etait donc INACCESSIBLE A TOUT LE MONDE, meme au personnel autorise, la
 * verification cote API n'ayant jamais l'identite du visiteur. Corrige au
 * meme moment que l'ajout des SCP lies, meme fonction touchee.
 */
async function getGameEvent(slug: string): Promise<ApiGameEventDetail | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("redlakes_token")?.value;
  try {
    const res = await fetch(`${API_URL}/events/${slug}`, {
      cache: "no-store",
      headers: token ? { Cookie: `redlakes_token=${token}` } : undefined,
    });
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
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <p className="font-mono text-sm text-gray-600">{formatDate(event.date)}</p>
        {event.faction && (
          <Link
            href={`/factions/${event.faction.slug}`}
            className="rounded border px-2 py-0.5 font-mono text-[10px] uppercase transition-opacity hover:opacity-80"
            style={{ borderColor: event.faction.color ?? undefined, color: event.faction.color ?? undefined }}
          >
            {event.faction.name}
          </Link>
        )}
      </div>
      <EditableText
        as="h1"
        className="mb-8 text-4xl font-bold text-white"
        value={event.title}
        endpoint={`/events/${event.id}`}
        field="title"
      />

      <div className="space-y-6">
        <section className="hologram-border rounded-lg p-6">
          <EditableText
            value={event.description}
            endpoint={`/events/${event.id}`}
            field="description"
            multiline
            markdown
            className="text-gray-400"
          />
        </section>
        <OptionalSection show={!!event.casualties}>
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-2 font-bold text-white">Victimes</h2>
            <EditableText
              value={event.casualties}
              endpoint={`/events/${event.id}`}
              field="casualties"
              multiline
              markdown
              className="text-gray-500"
              placeholder="Cliquer pour ajouter…"
            />
          </section>
        </OptionalSection>
        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-2 font-bold text-white">Issue</h2>
          <EditableText
            value={event.outcome}
            endpoint={`/events/${event.id}`}
            field="outcome"
            multiline
            markdown
            className="text-gray-500"
          />
        </section>

        {event.linkedDocuments.length > 0 && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
              <FileLock2 className="h-4 w-4 text-redlake-glow" />
              Documents classifiés liés
            </h2>
            <div className="space-y-2">
              {event.linkedDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.slug}`}
                  className="block rounded border border-metal/40 p-3 transition-colors hover:border-redlake/30"
                >
                  <p className="text-sm font-bold text-white">{doc.title}</p>
                  {doc.excerpt && <p className="line-clamp-1 text-xs text-gray-500">{doc.excerpt}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {event.linkedScpObjects.length > 0 && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
              <BookOpen className="h-4 w-4 text-redlake-glow" />
              Objets SCP liés
            </h2>
            <div className="space-y-2">
              {event.linkedScpObjects.map((scp) => (
                <Link
                  key={scp.id}
                  href={`/wiki/${scp.slug}`}
                  className="flex items-center justify-between gap-3 rounded border border-metal/40 p-3 transition-colors hover:border-redlake/30"
                >
                  <p className="truncate text-sm font-bold text-white">
                    {scp.number} — {scp.name}
                  </p>
                  <span
                    className={`shrink-0 font-mono text-[10px] uppercase tracking-wide ${SCP_CLASS_COLORS[scp.class]}`}
                  >
                    {scp.class}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
