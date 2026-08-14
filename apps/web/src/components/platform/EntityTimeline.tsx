"use client";

import { useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  AUDIT_ACTION_LABELS,
  type AuditLogEntry,
  type PaginatedResult,
  type PlatformEntityType,
  buildQueryString,
} from "@/lib/platform-types";
import { cn } from "@/lib/utils";

interface EntityTimelineProps {
  entityType: PlatformEntityType;
  entityId: string;
  className?: string;
}

export function EntityTimeline({
  entityType,
  entityId,
  className,
}: EntityTimelineProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch<PaginatedResult<AuditLogEntry>>(
      `/platform/audit/${entityType}/${entityId}${buildQueryString({ limit: 20 })}`,
    )
      .then((res) => {
        if (!cancelled) setEntries(res.items);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entityType, entityId]);

  return (
    <div className={cn("rounded border border-metal/30 bg-black/20 p-4", className)}>
      <h4 className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase text-gray-500">
        <History className="h-3.5 w-3.5" />
        Journal du dossier
      </h4>
      {loading ? (
        <p className="flex items-center gap-2 text-xs text-gray-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          Chargement…
        </p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-gray-600">Aucun événement enregistré.</p>
      ) : (
        <ol className="space-y-3 border-l border-metal/40 pl-4">
          {entries.map((e) => {
            const actor =
              e.actorLabel ??
              e.actor?.minecraftUsername ??
              e.actor?.discordUsername ??
              "Système";
            return (
              <li key={e.id} className="relative">
                <span className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-redlake/60" />
                <p className="text-xs text-white">{e.summary}</p>
                <p className="mt-0.5 font-mono text-[10px] text-gray-600">
                  {AUDIT_ACTION_LABELS[e.action] ?? e.action} — {actor} —{" "}
                  {new Date(e.createdAt).toLocaleString("fr-FR")}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
