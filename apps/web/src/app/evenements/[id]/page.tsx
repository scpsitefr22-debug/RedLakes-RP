import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileLock2, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { API_URL } from "@/lib/api";
import { classHex } from "@/data/scp";
import { eventTypeHex, eventTypeLabel } from "@/lib/event-types";
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
  type?: string;
  description: string;
  casualties: string | null;
  outcome: string;
  faction: { slug: string; name: string; color: string | null } | null;
  linkedDocuments: { id: string; slug: string; title: string; excerpt: string | null }[];
  linkedScpObjects: ApiScpRef[];
}

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

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const event = await getGameEvent(id);
  return { title: event?.title ?? "Événement introuvable" };
}

export default async function EvenementDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getGameEvent(id);
  if (!event) notFound();

  const color = event.type ? eventTypeHex(event.type) : "#e5392f";
  const hasAside = event.linkedDocuments.length > 0 || event.linkedScpObjects.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/evenements" className="label-mono text-[11px] text-gray-400 transition-colors hover:text-white">
        ← Archives d&apos;événements
      </Link>

      <header className="mt-6 overflow-hidden border border-line bg-[#0d1117]">
        <div className="hazard-stripes h-1.5" aria-hidden />
        <div className="p-6 sm:p-8" style={{ boxShadow: `inset 4px 0 0 ${color}` }}>
          <div className="flex flex-wrap items-center gap-3">
            {event.type && (
              <span className="label-mono border px-1.5 py-0.5 text-[10px]" style={{ color, borderColor: `${color}66` }}>
                {eventTypeLabel(event.type)}
              </span>
            )}
            <time className="label-mono text-[11px] text-gray-400" dateTime={event.date}>
              {formatDate(event.date)}
            </time>
            {event.faction && (
              <Link
                href={`/factions/${event.faction.slug}`}
                className="label-mono border px-1.5 py-0.5 text-[10px] transition-opacity hover:opacity-80"
                style={{ borderColor: event.faction.color ?? undefined, color: event.faction.color ?? undefined }}
              >
                {event.faction.name}
              </Link>
            )}
          </div>
          <EditableText
            as="h1"
            className="font-display mt-4 text-5xl font-extrabold uppercase leading-[0.95] text-white"
            value={event.title}
            endpoint={`/events/${event.id}`}
            field="title"
          />
        </div>
      </header>

      <div className={hasAside ? "mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]" : "mt-8"}>
        <div className="space-y-6">
          <section>
            <h2 className="label-mono mb-3 flex items-center gap-3 text-[11px] text-gray-400">
              Déroulé
              <span className="h-px flex-1 bg-line" aria-hidden />
            </h2>
            <EditableText
              value={event.description}
              endpoint={`/events/${event.id}`}
              field="description"
              multiline
              markdown
              className="prose-redlake max-w-[70ch] text-lg leading-relaxed text-gray-200"
            />
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <OptionalSection show={!!event.casualties}>
              <section className="border border-line bg-[#0d1117] p-5" style={{ boxShadow: "inset 3px 0 0 #ef4444" }}>
                <h2 className="label-mono mb-2 text-[11px] text-red-300">Victimes</h2>
                <EditableText
                  value={event.casualties}
                  endpoint={`/events/${event.id}`}
                  field="casualties"
                  multiline
                  markdown
                  className="text-gray-300"
                  placeholder="Cliquer pour ajouter…"
                />
              </section>
            </OptionalSection>
            <section className="border border-line bg-[#0d1117] p-5" style={{ boxShadow: "inset 3px 0 0 #4ade80" }}>
              <h2 className="label-mono mb-2 text-[11px] text-green-300">Issue</h2>
              <EditableText
                value={event.outcome}
                endpoint={`/events/${event.id}`}
                field="outcome"
                multiline
                markdown
                className="text-gray-300"
              />
            </section>
          </div>
        </div>

        {hasAside && (
          <aside className="space-y-6">
            {event.linkedScpObjects.length > 0 && (
              <section>
                <h2 className="label-mono mb-3 flex items-center gap-2 text-[11px] text-gray-400">
                  <BookOpen className="h-3.5 w-3.5" />
                  Objets SCP liés
                </h2>
                <ul className="space-y-2">
                  {event.linkedScpObjects.map((scp) => (
                    <li key={scp.id}>
                      <Link
                        href={`/wiki/${scp.slug}`}
                        className="flex items-center justify-between gap-3 border border-line bg-[#0d1117] p-3 transition-colors hover:border-line-strong"
                        style={{ boxShadow: `inset 3px 0 0 ${classHex[scp.class]}` }}
                      >
                        <span className="min-w-0">
                          <span className="font-display block text-lg font-bold uppercase leading-none text-white">{scp.number}</span>
                          <span className="block truncate text-sm text-gray-400">{scp.name}</span>
                        </span>
                        <span className="label-mono shrink-0 text-[10px]" style={{ color: classHex[scp.class] }}>
                          {scp.class}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {event.linkedDocuments.length > 0 && (
              <section>
                <h2 className="label-mono mb-3 flex items-center gap-2 text-[11px] text-gray-400">
                  <FileLock2 className="h-3.5 w-3.5" />
                  Documents classifiés liés
                </h2>
                <ul className="space-y-2">
                  {event.linkedDocuments.map((doc) => (
                    <li key={doc.id}>
                      <Link href={`/documents/${doc.slug}`} className="block border border-line bg-[#0d1117] p-3 transition-colors hover:border-line-strong">
                        <p className="text-sm font-semibold text-white">{doc.title}</p>
                        {doc.excerpt && <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">{doc.excerpt}</p>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
