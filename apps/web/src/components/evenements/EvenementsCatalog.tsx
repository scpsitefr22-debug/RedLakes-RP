"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
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
      .filter(
        (e) =>
          !q ||
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [gameEvents, activeType, query]);

  const types = Object.keys(TYPE_LABELS).filter((t) => (counts.get(t) ?? 0) > 0);
  const extraTypes = [...counts.keys()].filter((t) => !TYPE_LABELS[t]);

  return (
    <>
      <div className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un événement…"
          className="w-full rounded border border-metal/50 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveType(null)}
          className={`rounded border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
            activeType === null
              ? "border-redlake bg-redlake/20 text-white"
              : "border-metal/50 text-gray-500 hover:border-metal"
          }`}
        >
          Tous ({gameEvents.length})
        </button>
        {[...types, ...extraTypes].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveType(activeType === t ? null : t)}
            className={`rounded border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              activeType === t
                ? "border-redlake bg-redlake/20 text-white"
                : "border-metal/50 text-gray-500 hover:border-metal"
            }`}
          >
            {TYPE_LABELS[t] ?? t} ({counts.get(t)})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          {gameEvents.length === 0
            ? "Aucun événement disponible pour le moment."
            : "Aucun événement ne correspond à ce filtre."}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((event) => (
            <Link
              key={event.id}
              href={`/evenements/${event.slug}`}
              className="group block hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
            >
              <div className="mb-2 flex items-center gap-3">
                <Badge variant="keter">{TYPE_LABELS[event.type] ?? event.type}</Badge>
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
    </>
  );
}
