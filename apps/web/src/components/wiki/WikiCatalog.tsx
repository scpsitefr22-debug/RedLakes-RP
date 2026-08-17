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

export function WikiCatalog({ scpObjects }: { scpObjects: ApiScpObject[] }) {
  const [activeClass, setActiveClass] = useState<SCPClass | null>(null);

  const counts = useMemo(() => {
    const map = new Map<SCPClass, number>();
    for (const scp of scpObjects) {
      map.set(scp.class, (map.get(scp.class) ?? 0) + 1);
    }
    return map;
  }, [scpObjects]);

  const visible = activeClass
    ? scpObjects.filter((scp) => scp.class === activeClass)
    : scpObjects;

  return (
    <>
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
          Aucun objet dans cette classe pour le moment.
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
