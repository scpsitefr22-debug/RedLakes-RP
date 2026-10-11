"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { clearanceBadgeClass } from "@/lib/clearance";
import type { TimelineEvent } from "@/data/timeline";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<TimelineEvent["type"], string> = {
  fondation: "Fondation",
  incident: "Incident",
  guerre: "Guerre",
  breach: "Brèche",
  faction: "Faction",
};

const TYPE_HEX: Record<TimelineEvent["type"], string> = {
  fondation: "#60a5fa",
  incident: "#facc15",
  guerre: "#f87171",
  breach: "#fb923c",
  faction: "#c084fc",
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
      return e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.year.toLowerCase().includes(q);
    });
  }, [events, activeType, query]);

  const chip = (active: boolean) =>
    cn(
      "flex items-center gap-2 border px-3 py-1.5 text-sm transition-colors",
      active ? "border-white/60 bg-white/10 text-white" : "border-line text-gray-400 hover:border-line-strong hover:text-white",
    );

  return (
    <>
      <div className="panel-flat mb-10 flex flex-wrap items-center gap-3 p-4">
        <label className="relative block min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une date, un événement…"
            aria-label="Rechercher dans la chronologie"
            className="w-full border border-line bg-black/40 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake-glow"
          />
        </label>
        <div className="flex flex-wrap gap-2" aria-label="Type d'événement">
          <button type="button" onClick={() => setActiveType(null)} aria-pressed={activeType === null} className={chip(activeType === null)}>
            Tous <span className="tabular-nums text-gray-500">{events.length}</span>
          </button>
          {(Object.keys(TYPE_LABELS) as TimelineEvent["type"][])
            .filter((t) => (counts.get(t) ?? 0) > 0)
            .map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveType(activeType === t ? null : t)}
                aria-pressed={activeType === t}
                className={chip(activeType === t)}
              >
                <span className="h-2 w-2" style={{ background: TYPE_HEX[t] }} aria-hidden />
                {TYPE_LABELS[t]} <span className="tabular-nums text-gray-500">{counts.get(t)}</span>
              </button>
            ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="hologram-border p-8 text-center text-gray-400">Aucun événement ne correspond à ce filtre.</div>
      ) : (
        <ol className="relative">
          <span className="absolute bottom-0 left-[7.25rem] top-0 hidden w-px bg-line-strong sm:block" aria-hidden />
          {visible.map((event) => {
            const color = TYPE_HEX[event.type];
            return (
              <li key={event.id} className="relative grid gap-3 pb-8 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-10">
                <p
                  className={cn(
                    "font-display font-extrabold leading-none tabular-nums text-white sm:pt-4 sm:text-right",
                    // « 1950-1970 » ou « Aujourd'hui » : plus petit pour tenir dans la colonne.
                    event.year.length > 4 ? "text-3xl sm:text-xl" : "text-4xl sm:text-[2.6rem]",
                  )}
                >
                  {event.year}
                </p>
                <span
                  className="absolute left-[7.25rem] top-6 hidden h-3 w-3 -translate-x-1/2 rotate-45 border-2 bg-[#07090c] sm:block"
                  style={{ borderColor: color }}
                  aria-hidden
                />
                <article className="border border-line bg-[#0d1117] p-5" style={{ boxShadow: `inset 3px 0 0 ${color}` }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="label-mono text-[10px]" style={{ color }}>
                      {TYPE_LABELS[event.type]}
                    </span>
                    <span className={cn("label-mono ml-auto border px-1.5 py-0.5 text-[9px]", clearanceBadgeClass(event.clearance))}>
                      Hab. {event.clearance}
                    </span>
                  </div>
                  <h2 className="font-display mt-2 text-2xl font-bold uppercase leading-tight text-white">{event.title}</h2>
                  <p className="mt-2 leading-relaxed text-gray-400">{event.description}</p>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
