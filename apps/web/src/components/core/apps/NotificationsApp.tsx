"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { type NotificationsPage, buildQueryString } from "@/lib/platform-types";
import { cn } from "@/lib/utils";

export function NotificationsApp() {
  const [data, setData] = useState<NotificationsPage | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch<NotificationsPage>(
        `/platform/notifications/me${buildQueryString({ limit: 50 })}`,
      );
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: string) => {
    await apiFetch(`/platform/notifications/${id}/read`, { method: "PATCH" });
    load();
  };

  const markAllRead = async () => {
    await apiFetch("/platform/notifications/read-all", { method: "PATCH" });
    load();
  };

  if (loading) return <p className="text-sm text-gray-500">Chargement…</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-gray-600">
          {data?.unreadCount ?? 0} non lue(s)
        </p>
        {(data?.unreadCount ?? 0) > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1 font-mono text-[11px] text-redlake-glow hover:text-white"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {!data?.items.length ? (
        <p className="py-8 text-center text-sm text-gray-600">Aucune notification.</p>
      ) : (
        <ul className="space-y-2">
          {data.items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => !n.readAt && markRead(n.id)}
                className={cn(
                  "w-full rounded border border-metal/40 px-3 py-2.5 text-left transition-colors hover:bg-redlake/5",
                  !n.readAt && "bg-redlake/5",
                )}
              >
                <p className="text-sm font-medium text-white">{n.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{n.body}</p>
                <p className="mt-1 font-mono text-[10px] text-gray-600">
                  {new Date(n.createdAt).toLocaleString("fr-FR")}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
