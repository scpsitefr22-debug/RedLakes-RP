"use client";

import { getCoreApps } from "@/lib/core/app-registry";
import { useCoreShell } from "./CoreShellProvider";

export function CoreTaskbar() {
  const { session, windows, order, toggleMinimize, focusApp } = useCoreShell();
  if (windows.length === 0) return null;

  const apps = getCoreApps(session.factionSlug);
  const topId = order[order.length - 1];

  return (
    <div
      className="sticky bottom-0 z-[5] flex flex-wrap gap-2 border-t px-4 py-2 backdrop-blur-md"
      style={{ borderColor: session.theme.rgba.border, background: "rgba(0,0,0,0.92)" }}
    >
      {windows.map((win, i) => {
        const app = apps.find((a) => a.id === win.appId);
        if (!app) return null;
        const Icon = app.icon;
        const focused = win.appId === topId && !win.minimized;
        return (
          <button
            key={win.appId}
            type="button"
            onClick={() => (win.minimized || !focused ? focusApp(win.appId) : toggleMinimize(win.appId))}
            className="core-taskbar-chip flex items-center gap-1.5 rounded border px-2.5 py-1.5 font-mono text-[11px] transition-all duration-150"
            style={{
              animationDelay: `${i * 40}ms`,
              borderColor: focused ? session.theme.colors.glow : session.theme.rgba.border,
              background: focused ? session.theme.rgba.surface : "transparent",
              color: focused ? session.theme.colors.glow : "#9ca3af",
              opacity: win.minimized ? 0.55 : 1,
              boxShadow: focused ? `0 0 12px ${session.theme.rgba.surface}` : "none",
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            {app.label}
          </button>
        );
      })}
    </div>
  );
}
