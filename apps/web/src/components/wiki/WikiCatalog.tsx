"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SCPClass } from "@/data/scp";
import { ThreatIndicator } from "@/components/ui/ThreatIndicator";

interface ApiScpObject {
  id: string;
  slug: string;
  number: string;
  name: string;
  class: SCPClass;
  threatLevel: number;
  description: string;
  personnelAssigned: number | null;
}

const CLASSES: SCPClass[] = ["Safe", "Euclid", "Keter", "Thaumiel", "Apollyon"];

type SortMode = "number" | "threat-desc" | "threat-asc";

const SORT_LABELS: Record<SortMode, string> = {
  number: "N° d'objet",
  "threat-desc": "Menace décroissante",
  "threat-asc": "Menace croissante",
};

export function WikiCatalog({ scpObjects }: { scpObjects: ApiScpObject[] }) {
  const [activeClass, setActiveClass] = useState<SCPClass | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("number");

  const counts = useMemo(() => {
    const map = new Map<SCPClass, number>();
    for (const scp of scpObjects) {
      map.set(scp.class, (map.get(scp.class) ?? 0) + 1);
    }
    return map;
  }, [scpObjects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = activeClass
      ? scpObjects.filter((scp) => scp.class === activeClass)
      : scpObjects;
    if (q) {
      list = list.filter(
        (scp) =>
          scp.number.toLowerCase().includes(q) ||
          scp.name.toLowerCase().includes(q) ||
          scp.description.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      if (sort === "threat-desc") return b.threatLevel - a.threatLevel;
      if (sort === "threat-asc") return a.threatLevel - b.threatLevel;
      return a.number.localeCompare(b.number, "fr", { numeric: true });
    });
  }, [scpObjects, activeClass, query, sort]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrer par numéro, nom ou description…"
          className="min-w-[240px] flex-1 rounded border border-metal/50 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="rounded border border-metal/50 bg-black/40 px-3 py-2 font-mono text-xs uppercase tracking-wider text-gray-400 outline-none focus:border-redlake"
        >
          {(Object.entries(SORT_LABELS) as [SortMode, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              Trier : {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveClass(null)}
          className={`rounded border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
            activeClass === null
              ? "border-redlake bg-redlake/20 text-white"
              : "border-metal/50 text-gray-500 hover:border-metal"
          }`}
        >
          Toutes ({scpObjects.length})
        </button>
        {CLASSES.filter((c) => (counts.get(c) ?? 0) > 0).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveClass(activeClass === c ? null : c)}
            className={`rounded border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              activeClass === c
                ? "border-redlake bg-redlake/20 text-white"
                : "border-metal/50 text-gray-500 hover:border-metal"
            }`}
          >
            {c} ({counts.get(c)})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          {query.trim() ? "Aucun objet ne correspond à ce filtre." : "Aucun objet dans cette classe pour le moment."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((scp) => (
            <Link
              key={scp.id}
              href={`/wiki/${scp.slug}`}
              className="group hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-lg font-bold text-redlake-glow">
                  {scp.number}
                </span>
                <ThreatIndicator scpClass={scp.class} />
              </div>
              <h2 className="mb-2 text-xl font-bold text-white group-hover:text-redlake-glow">
                {scp.name}
              </h2>
              <p className="mb-4 line-clamp-3 text-sm text-gray-500">
                {scp.description}
              </p>
              <div className="flex gap-4 font-mono text-xs text-gray-600">
                <span>Menace {scp.threatLevel}/5</span>
                <span>{scp.personnelAssigned ?? "—"} agents</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
