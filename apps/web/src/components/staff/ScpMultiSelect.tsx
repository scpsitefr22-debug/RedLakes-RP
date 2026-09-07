"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface ScpOption {
  id: string;
  number: string;
  name: string;
}

interface ScpMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

export function ScpMultiSelect({ value, onChange }: ScpMultiSelectProps) {
  const [objects, setObjects] = useState<ScpOption[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    apiFetch<ScpOption[]>("/scp/cms").then(setObjects).catch(() => undefined);
  }, []);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((s) => s !== id) : [...value, id]);
  };

  const q = filter.trim().toLowerCase();
  const visible = objects.filter(
    (s) => s.number.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
  );

  return (
    <div>
      <label className="mb-1 block font-mono text-xs text-gray-500">
        Objets SCP liés ({value.length})
      </label>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filtrer par numéro ou nom…"
        className="mb-2 w-full rounded border border-metal/50 bg-black px-3 py-1.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake"
      />
      <div className="max-h-40 space-y-1 overflow-y-auto rounded border border-metal p-2">
        {objects.length === 0 && <p className="p-1 text-xs text-gray-600">Aucun objet disponible.</p>}
        {objects.length > 0 && visible.length === 0 && (
          <p className="p-1 text-xs text-gray-600">Aucun résultat pour ce filtre.</p>
        )}
        {visible.map((s) => (
          <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-white/5">
            <input type="checkbox" checked={value.includes(s.id)} onChange={() => toggle(s.id)} />
            <span className="font-mono text-redlake-glow">{s.number}</span>
            <span className="text-gray-300">{s.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
