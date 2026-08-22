"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { CLEARANCE_LABELS } from "@/lib/clearance";
import type { TimelineEvent } from "@/data/timeline";

const TYPE_LABELS: Record<TimelineEvent["type"], string> = {
  fondation: "Fondation",
  incident: "Incident",
  guerre: "Guerre",
  breach: "Brèche",
  faction: "Faction",
};

const TYPE_COLORS: Record<TimelineEvent["type"], string> = {
  fondation: "border-blue-400/30 text-blue-400",
  incident: "border-yellow-400/30 text-yellow-400",
  guerre: "border-red-400/30 text-red-400",
  breach: "border-orange-400/30 text-orange-400",
  faction: "border-purple-400/30 text-purple-400",
};

export function ChronologieCatalog({ events }: { events: TimelineEvent[] }) {
  const [activeType, setActiveType] = useState<TimelineEvent["type"] | null>(null);
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map = new Map<TimelineEvent["type"], number>();
    for (const e of events) map.set(e.type, (map.get(e.type) ?? 0) + 1);
    return map;
  }, [events]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (activeType && e.type !== activeType) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.year.toLowerCase().includes(q)
      );
    });
  }, [events, activeType, query]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une date, un événement…"
          className="min-w-[240px] flex-1 rounded border border-metal/50 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake"
        />
      </div>

      <div className="mb-12 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setActiveType(null)}
          className={`rounded border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
            activeType === null
              ? "border-redlake bg-redlake/20 text-white"
              : "border-metal/50 text-gray-500 hover:border-metal"
          }`}
        >
          Toutes ({events.length})
        </button>
        {(Object.keys(TYPE_LABELS) as TimelineEvent["type"][])
          .filter((t) => (counts.get(t) ?? 0) > 0)
          .map((t) => (
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
              {TYPE_LABELS[t]} ({counts.get(t)})
            </button>
          ))}
      </div>

      {visible.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          Aucun événement ne correspond à ce filtre.
        </div>
      ) : (
        <div className="relative space-y-0">
          <div className="absolute left-8 top-0 hidden h-full w-px bg-redlake/30 md:block" />
          {visible.map((event) => (
            <div key={event.id} className="relative flex gap-6 pb-12">
              <div className="hidden h-4 w-4 shrink-0 rounded-full border-2 border-redlake-glow bg-black md:ml-6 md:block" />
              <div className="flex-1 hologram-border rounded-lg p-6">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="font-mono text-2xl font-bold text-redlake-glow">
                    {event.year}
                  </span>
                  <Badge className={TYPE_COLORS[event.type]}>{TYPE_LABELS[event.type]}</Badge>
                  <span className="font-mono text-xs text-gray-600">
                    {CLEARANCE_LABELS[event.clearance]}
                  </span>
                </div>
                <h2 className="mb-2 text-xl font-bold text-white">{event.title}</h2>
                <p className="text-gray-500">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
