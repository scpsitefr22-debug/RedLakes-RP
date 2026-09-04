import type { DashboardNavId, DashboardNavItem } from "./dashboard-nav";
import type { AppId } from "../../lib/workstation";

interface DashboardSidebarProps {
  nav: DashboardNavItem[];
  activeApp: AppId;
  unlockedApps: AppId[];
  onSelectNav: (navId: DashboardNavId) => void;
  showDirectorShortcut?: boolean;
  onOpenDirectorOffice?: () => void;
}

function isNavActive(nav: DashboardNavItem[], navId: DashboardNavId, activeApp: AppId): boolean {
  const item = nav.find((n) => n.id === navId);
  return item?.appId === activeApp;
}

export function DashboardSidebar({
  nav,
  activeApp,
  unlockedApps,
  onSelectNav,
  showDirectorShortcut,
  onOpenDirectorOffice,
}: DashboardSidebarProps) {
  return (
    <aside className="flex w-[168px] shrink-0 flex-col border-r border-dashboard-border bg-dashboard-sidebar">
      <div className="flex-1 overflow-y-auto py-2">
        {showDirectorShortcut && onOpenDirectorOffice && (
          <button
            type="button"
            onClick={onOpenDirectorOffice}
            className="mx-2 mb-2 flex w-[calc(100%-1rem)] items-center gap-2 border border-amber-500/40 bg-amber-500/10 px-2.5 py-2 text-[9px] uppercase tracking-wide text-amber-400 transition-colors hover:bg-amber-500/20"
          >
            <span>★</span>
            <span>Bureau Directeur</span>
          </button>
        )}

        {nav.map(({ id, label, icon: Icon, appId }) => {
          const locked = appId !== null && !unlockedApps.includes(appId);
          const disabled = appId === null || locked;
          const active = isNavActive(nav, id, activeApp);

          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectNav(id)}
              className={`relative flex w-full items-center gap-2.5 px-3 py-2 text-left text-[10px] uppercase tracking-wide transition-colors ${
                active
                  ? "bg-dashboard-accent/15 text-dashboard-accent"
                  : disabled
                    ? "cursor-not-allowed text-metal/35"
                    : "text-metal hover:bg-dashboard-panel hover:text-foreground"
              }`}
              title={disabled ? `${label} — indisponible` : label}
            >
              {active && (
                <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-dashboard-accent" />
              )}
              <Icon size={16} strokeWidth={1.5} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-dashboard-border px-3 py-2.5">
        <p className="flex items-center gap-1.5 text-[9px] text-terminal">
          <span className="h-1.5 w-1.5 rounded-full bg-terminal" />
          Connexion sécurisée
        </p>
        <p className="mt-0.5 font-mono text-[9px] text-metal">192.168.12.12</p>
      </div>
    </aside>
  );
}
