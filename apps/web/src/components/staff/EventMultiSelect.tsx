"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface EventOption {
  id: string;
  title: string;
  date: string;
}

interface EventMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

export function EventMultiSelect({ value, onChange }: EventMultiSelectProps) {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    apiFetch<EventOption[]>("/events/cms").then(setEvents).catch(() => undefined);
  }, []);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((e) => e !== id) : [...value, id]);
  };

  const visible = events.filter((e) => e.title.toLowerCase().includes(filter.trim().toLowerCase()));

  return (
    <div>
      <label className="mb-1 block font-mono text-xs text-gray-500">
        Événements RP liés ({value.length})
      </label>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filtrer par titre…"
        className="mb-2 w-full rounded border border-metal/50 bg-black px-3 py-1.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake"
      />
      <div className="max-h-40 space-y-1 overflow-y-auto rounded border border-metal p-2">
        {events.length === 0 && <p className="p-1 text-xs text-gray-600">Aucun événement disponible.</p>}
        {events.length > 0 && visible.length === 0 && (
          <p className="p-1 text-xs text-gray-600">Aucun résultat pour ce filtre.</p>
        )}
        {visible.map((e) => (
          <label key={e.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-white/5">
            <input type="checkbox" checked={value.includes(e.id)} onChange={() => toggle(e.id)} />
            <span className="text-gray-300">{e.title}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
