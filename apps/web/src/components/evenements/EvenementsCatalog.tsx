"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { EVENT_TYPE_LABELS, eventTypeHex, eventTypeLabel } from "@/lib/event-types";
import { cn } from "@/lib/utils";

interface ApiGameEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
  type: string;
  description: string;
}

function dateParts(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: "—", month: "", year: "" };
  return {
    day: new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(d),
    month: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d).replace(".", ""),
    year: String(d.getFullYear()),
  };
}

export function EvenementsCatalog({ gameEvents }: { gameEvents: ApiGameEvent[] }) {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of gameEvents) map.set(e.type, (map.get(e.type) ?? 0) + 1);
    return map;
  }, [gameEvents]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return gameEvents
      .filter((e) => (activeType ? e.type === activeType : true))
      .filter((e) => !q || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [gameEvents, activeType, query]);

  const types = Object.keys(EVENT_TYPE_LABELS).filter((t) => (counts.get(t) ?? 0) > 0);
  const extraTypes = [...counts.keys()].filter((t) => !EVENT_TYPE_LABELS[t]);

  const chip = (active: boolean) =>
    cn(
      "flex items-center gap-2 border px-3 py-1.5 text-sm transition-colors",
      active ? "border-white/60 bg-white/10 text-white" : "border-line text-gray-400 hover:border-line-strong hover:text-white",
    );

  return (
    <>
      <div className="panel-flat mb-8 flex flex-wrap items-center gap-3 p-4">
        <label className="relative block min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un événement…"
            aria-label="Rechercher un événement"
            className="w-full border border-line bg-black/40 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake-glow"
          />
        </label>
        <div className="flex flex-wrap gap-2" aria-label="Type d'événement">
          <button type="button" onClick={() => setActiveType(null)} aria-pressed={activeType === null} className={chip(activeType === null)}>
            Tous <span className="tabular-nums text-gray-500">{gameEvents.length}</span>
          </button>
          {[...types, ...extraTypes].map((t) => (
            <button key={t} type="button" onClick={() => setActiveType(activeType === t ? null : t)} aria-pressed={activeType === t} className={chip(activeType === t)}>
              <span className="h-2 w-2" style={{ background: eventTypeHex(t) }} aria-hidden />
              {eventTypeLabel(t)} <span className="tabular-nums text-gray-500">{counts.get(t)}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="hologram-border p-8 text-center text-gray-400">
          {gameEvents.length === 0 ? "Aucun événement disponible pour le moment." : "Aucun événement ne correspond à ce filtre."}
        </div>
      ) : (
        <ol className="space-y-3">
          {visible.map((event) => {
            const color = eventTypeHex(event.type);
            const when = dateParts(event.date);
            return (
              <li key={event.id}>
                <Link
                  href={`/evenements/${event.slug}`}
                  className="group grid grid-cols-[5rem_minmax(0,1fr)] overflow-hidden border border-line bg-[#0d1117] transition-colors hover:border-line-strong sm:grid-cols-[6.5rem_minmax(0,1fr)]"
                >
                  <div className="flex flex-col items-center justify-center border-r border-line px-2 py-4 text-center" style={{ background: `${color}14` }}>
                    <span className="font-display text-4xl font-extrabold leading-none tabular-nums text-white">{when.day}</span>
                    <span className="label-mono mt-1 text-[10px] text-gray-300">{when.month}</span>
                    <span className="label-mono text-[10px] text-gray-500">{when.year}</span>
                  </div>
                  <div className="min-w-0 p-5" style={{ boxShadow: `inset 3px 0 0 ${color}` }}>
                    <span className="label-mono text-[10px]" style={{ color }}>
                      {eventTypeLabel(event.type)}
                    </span>
                    <h2 className="font-display mt-1 text-2xl font-bold uppercase leading-tight text-white">{event.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-400">{event.description}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
