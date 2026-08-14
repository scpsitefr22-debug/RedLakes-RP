"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  type NotificationsPage,
  buildQueryString,
} from "@/lib/platform-types";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationsPage | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch<NotificationsPage>(
        `/platform/notifications/me${buildQueryString({ limit: 15 })}`,
      );
      setData(res);
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAllRead = async () => {
    await apiFetch("/platform/notifications/read-all", { method: "PATCH" });
    await load();
  };

  const markRead = async (id: string) => {
    await apiFetch(`/platform/notifications/${id}/read`, { method: "PATCH" });
    await load();
  };

  const unread = data?.unreadCount ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded border border-metal/50 p-2 text-gray-400 transition-colors hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-redlake px-1 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-metal bg-black shadow-xl">
          <div className="flex items-center justify-between border-b border-metal/40 px-3 py-2">
            <span className="font-mono text-xs text-gray-400">Notifications</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1 font-mono text-[10px] text-redlake-glow hover:text-white"
              >
                <CheckCheck className="h-3 w-3" />
                Tout lire
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {!data?.items.length ? (
              <li className="p-4 text-center text-xs text-gray-600">
                Aucune notification.
              </li>
            ) : (
              data.items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!n.readAt) void markRead(n.id);
                    }}
                    className={cn(
                      "w-full border-b border-metal/20 px-3 py-2.5 text-left transition-colors hover:bg-redlake/5",
                      !n.readAt && "bg-redlake/5",
                    )}
                  >
                    <p className="text-xs font-medium text-white">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[10px] text-gray-500">
                      {n.body}
                    </p>
                    <p className="mt-1 font-mono text-[9px] text-gray-600">
                      {new Date(n.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-metal/40 p-2 text-center">
            <Link
              href="/intranet"
              onClick={() => setOpen(false)}
              className="font-mono text-[10px] text-gray-500 hover:text-redlake-glow"
            >
              Ouvrir l&apos;intranet →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
