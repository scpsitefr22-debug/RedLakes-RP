"use client";

import { useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  AUDIT_ACTION_LABELS,
  type AuditLogEntry,
  type PaginatedResult,
  buildQueryString,
} from "@/lib/platform-types";
import { Pagination } from "@/components/platform/Pagination";

export function StaffAuditFeed() {
  const [data, setData] = useState<PaginatedResult<AuditLogEntry> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch<PaginatedResult<AuditLogEntry>>(
      `/platform/audit${buildQueryString({ page, limit: 15 })}`,
    )
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <section className="hologram-border rounded-lg p-6">
      <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
        <History className="h-5 w-5 text-redlake-glow" />
        Journal d&apos;activité plateforme
      </h2>
      {loading ? (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement du journal…
        </p>
      ) : !data?.items.length ? (
        <p className="text-sm text-gray-500">Aucune activité enregistrée.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {data.items.map((e) => {
              const actor =
                e.actorLabel ??
                e.actor?.minecraftUsername ??
                e.actor?.discordUsername ??
                "Système";
              return (
                <li
                  key={e.id}
                  className="rounded border border-metal/30 bg-black/20 px-3 py-2"
                >
                  <p className="text-sm text-white">{e.summary}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-gray-600">
                    {AUDIT_ACTION_LABELS[e.action] ?? e.action} — {e.entityType}{" "}
                    — {actor} — {new Date(e.createdAt).toLocaleString("fr-FR")}
                  </p>
                </li>
              );
            })}
          </ul>
          {data && (
            <Pagination
              className="mt-4"
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </section>
  );
}
