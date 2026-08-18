"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getScpHistory, ScpHistoryEntry } from "@/lib/scp-history";
import { classColors, SCPClass } from "@/data/scp";
import { cn } from "@/lib/utils";

export function RecentlyViewed() {
  const [history, setHistory] = useState<ScpHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getScpHistory());
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="panel-flat mb-8 rounded-lg p-4">
      <p className="mb-3 font-mono text-[11px] font-bold tracking-widest text-gray-500">
        DOSSIERS RÉCEMMENT CONSULTÉS
      </p>
      <div className="flex flex-wrap gap-2">
        {history.map((h) => (
          <Link
            key={h.slug}
            href={`/wiki/${h.slug}`}
            className={cn(
              "rounded border px-3 py-1.5 font-mono text-xs transition-colors hover:border-redlake-glow",
              classColors[h.class as SCPClass] ?? "border-metal text-gray-400"
            )}
          >
            {h.number}
          </Link>
        ))}
      </div>
    </div>
  );
}
