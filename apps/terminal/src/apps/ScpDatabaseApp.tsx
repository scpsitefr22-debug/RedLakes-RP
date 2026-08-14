import { useState } from "react";
import { getUnlockedScpEntries } from "@redlakes/narrative-core";
import { Database } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

interface ScpDatabaseAppProps {
  onOpenDocument?: (documentId: string) => void;
}

export function ScpDatabaseApp({ onOpenDocument }: ScpDatabaseAppProps) {
  const { gns } = useGNSRequired();
  const entries = getUnlockedScpEntries(gns);
  const [expandedId, setExpandedId] = useState<string | null>(entries[0]?.id ?? null);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-panel-border px-4 py-2 text-[10px] uppercase tracking-wider text-metal">
        Base de données SCP — Site-12 ({entries.length} fiche{entries.length !== 1 ? "s" : ""})
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Database className="h-8 w-8 text-metal/40" />
            <p className="text-xs text-metal">Aucune fiche accessible à votre clearance.</p>
            <p className="text-[10px] text-metal/60">
              Consultez la messagerie et les documents pour débloquer des entrées.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              className="block w-full border border-panel-border bg-classified p-3 text-left transition-colors hover:border-redlake/30"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-foreground">{entry.title}</span>
                <span
                  className={`shrink-0 text-[10px] ${
                    entry.class === "Keter"
                      ? "text-redlake"
                      : entry.class === "Euclid"
                        ? "text-amber-500"
                        : "text-terminal"
                  }`}
                >
                  {entry.class}
                </span>
              </div>
              <p className="mt-2 text-[10px] text-metal">{entry.summary}</p>
              {expandedId === entry.id && entry.detail && (
                <p className="mt-2 border-t border-panel-border pt-2 text-[10px] leading-relaxed text-foreground/80">
                  {entry.detail}
                </p>
              )}
              <p className="mt-2 text-[9px] text-metal/60">Clearance {entry.clearance}+ requise</p>
            </button>
          ))
        )}
        {entries.length <= 1 && entries.length > 0 && (
          <p className="text-[10px] text-metal/50">
            D'autres fiches se débloquent selon votre progression narrative.
          </p>
        )}
        {gns.world.documentsRead.length > 0 && onOpenDocument && (
          <div className="border border-panel-border bg-panel/50 p-3">
            <p className="text-[10px] text-metal">Documents liés consultés :</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {gns.world.documentsRead.map((docId) => (
                <button
                  key={docId}
                  type="button"
                  onClick={() => onOpenDocument(docId)}
                  className="border border-panel-border px-2 py-1 text-[9px] text-terminal hover:bg-classified"
                >
                  {docId}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
