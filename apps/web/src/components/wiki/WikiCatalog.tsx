"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { classHex, type SCPClass } from "@/data/scp";
import { ThreatBars } from "@/components/wiki/ThreatBars";
import { TerminalSearch } from "@/components/wiki/TerminalSearch";
import { cn } from "@/lib/utils";

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

/** Texte brut d'une description (sans balisage markdown). */
function plain(text: string) {
  return text.replace(/[#*_>`[\]]/g, "").replace(/\s+/g, " ").trim();
}

export function WikiCatalog({ scpObjects }: { scpObjects: ApiScpObject[] }) {
  const [activeClass, setActiveClass] = useState<SCPClass | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("number");

  const counts = useMemo(() => {
    const map = new Map<SCPClass, number>();
    for (const scp of scpObjects) map.set(scp.class, (map.get(scp.class) ?? 0) + 1);
    return map;
  }, [scpObjects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = activeClass ? scpObjects.filter((scp) => scp.class === activeClass) : scpObjects;
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

  const chip = (active: boolean) =>
    cn(
      "flex items-center gap-2 border px-3 py-1.5 text-sm transition-colors",
      active ? "border-white/60 bg-white/10 text-white" : "border-line text-gray-400 hover:border-line-strong hover:text-white",
    );

  return (
    <>
      <div className="panel-flat mb-6 space-y-4 p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <TerminalSearch />
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrer par numéro, nom ou description…"
              aria-label="Filtrer les dossiers"
              className="w-full border border-line bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake-glow"
            />
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            aria-label="Trier les dossiers"
            className="border border-line bg-black/40 px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-redlake-glow"
          >
            {(Object.entries(SORT_LABELS) as [SortMode, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                Trier : {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Classe d'objet">
          <button type="button" onClick={() => setActiveClass(null)} aria-pressed={activeClass === null} className={chip(activeClass === null)}>
            Toutes <span className="tabular-nums text-gray-500">{scpObjects.length}</span>
          </button>
          {CLASSES.filter((c) => (counts.get(c) ?? 0) > 0).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveClass(activeClass === c ? null : c)}
              aria-pressed={activeClass === c}
              className={chip(activeClass === c)}
            >
              <span className="h-2 w-2" style={{ background: classHex[c] }} aria-hidden />
              {c} <span className="tabular-nums text-gray-500">{counts.get(c)}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="hologram-border p-8 text-center text-gray-400">
          {query.trim() ? "Aucun objet ne correspond à ce filtre." : "Aucun objet dans cette classe pour le moment."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((scp) => {
            const color = classHex[scp.class] ?? "#e6eaf0";
            return (
              <Link
                key={scp.id}
                href={`/wiki/${scp.slug}`}
                className="group relative flex flex-col overflow-hidden border border-line bg-[#0d1117] transition-colors hover:border-line-strong"
              >
                <span className="h-1" style={{ background: color }} aria-hidden />
                <span
                  className="font-display pointer-events-none absolute -right-1 top-2 select-none text-7xl font-extrabold leading-none text-transparent"
                  style={{ WebkitTextStroke: `1px ${color}33` }}
                  aria-hidden
                >
                  {scp.number.replace(/^SCP-/i, "")}
                </span>
                <div className="relative flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2">
                    <span className="label-mono border px-1.5 py-0.5 text-[10px]" style={{ color, borderColor: `${color}66` }}>
                      {scp.class}
                    </span>
                  </div>
                  <p className="font-display mt-3 text-3xl font-extrabold uppercase leading-none text-white">{scp.number}</p>
                  <h2 className="font-display mt-1 text-lg font-bold uppercase tracking-wide text-gray-200 transition-colors group-hover:text-white">
                    {scp.name}
                  </h2>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-400">{plain(scp.description)}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-3">
                    <span className="flex items-center gap-2">
                      <span className="label-mono text-[9px] text-gray-500">Menace</span>
                      <ThreatBars level={scp.threatLevel} scpClass={scp.class} />
                    </span>
                    {scp.personnelAssigned != null && (
                      <span className="label-mono text-[10px] tabular-nums text-gray-500">
                        {scp.personnelAssigned} agent{scp.personnelAssigned > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
