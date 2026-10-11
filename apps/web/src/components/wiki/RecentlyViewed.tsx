"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getScpHistory, type ScpHistoryEntry } from "@/lib/scp-history";
import { classHex, type SCPClass } from "@/data/scp";

export function RecentlyViewed() {
  const [history, setHistory] = useState<ScpHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getScpHistory());
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <p className="label-mono mr-2 text-[10px] text-gray-500">Consultés récemment</p>
      {history.map((h) => (
        <Link
          key={h.slug}
          href={`/wiki/${h.slug}`}
          className="flex items-center gap-2 border border-line px-2.5 py-1 font-mono text-xs text-gray-300 transition-colors hover:border-line-strong hover:text-white"
        >
          <span className="h-1.5 w-1.5" style={{ background: classHex[h.class as SCPClass] ?? "#9ca3af" }} aria-hidden />
          {h.number}
        </Link>
      ))}
    </div>
  );
}
