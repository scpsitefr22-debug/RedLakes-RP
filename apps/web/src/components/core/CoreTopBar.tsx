"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { NotificationBell } from "@/components/platform/NotificationBell";
import { useCoreShell } from "./CoreShellProvider";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function CoreTopBar() {
  const { session } = useCoreShell();
  const now = useClock();
  const Icon = session.theme.icon;
  const characterName =
    [session.character?.grade].filter(Boolean).join(" ") || session.displayName;

  return (
    <div
      className="flex h-14 items-center justify-between border-b px-4"
      style={{ borderColor: session.theme.rgba.border }}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" style={{ color: session.theme.colors.glow }} />
        <div className="leading-tight">
          <p
            className="faction-heading text-sm font-bold tracking-widest"
            style={{ color: session.theme.colors.glow }}
          >
            {session.vocab.network}
          </p>
          <p className="text-[10px] text-gray-500">{characterName}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {now && (
          <span className="font-mono text-xs text-gray-500">
            {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <NotificationBell />
        <Link
          href="/"
          title="Retour au site"
          className="rounded border border-metal/50 p-2 text-gray-400 transition-colors hover:text-white"
        >
          <Home className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
