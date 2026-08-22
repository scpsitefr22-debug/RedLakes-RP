"use client";

import { getCoreApps } from "@/lib/core/app-registry";
import { useCoreShell } from "./CoreShellProvider";

export function CoreAppGrid() {
  const { session, openApp } = useCoreShell();
  const apps = getCoreApps(session.factionSlug);

  return (
    <div className="grid grid-cols-3 gap-4 p-6 sm:grid-cols-4 md:grid-cols-6">
      {apps.map((app, i) => {
        const Icon = app.icon;
        return (
          <button
            key={app.id}
            type="button"
            onClick={() => openApp(app.id)}
            className="core-icon-in group flex flex-col items-center gap-2 rounded-lg p-4 text-center transition-transform duration-150 hover:-translate-y-0.5"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <span
              className="faction-card faction-siren-pulse faction-glow-pulse faction-neon-flicker faction-glitch-hover flex h-14 w-14 items-center justify-center transition-shadow duration-150 group-hover:shadow-[0_0_20px_var(--f-surface)]"
              style={{ background: session.theme.rgba.surface }}
            >
              <Icon className="h-6 w-6" style={{ color: session.theme.colors.glow }} />
            </span>
            <span className="text-[11px] text-gray-400 transition-colors group-hover:text-white">
              {app.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
