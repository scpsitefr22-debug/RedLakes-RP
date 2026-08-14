import type { ReactNode } from "react";
import type { ChapterId, GlobalNarrativeSave } from "@redlakes/narrative-core";
import type { AppId } from "../../lib/workstation";
import { APP_TITLES } from "../../lib/workstation";
import { DashboardBottomWidgets } from "./DashboardBottomWidgets";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardIdCard } from "./DashboardIdCard";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardSystemAlerts } from "./DashboardSystemAlerts";
import { DashboardWidget } from "./DashboardWidget";
import type { DashboardNavId } from "./dashboard-nav";

interface DashboardShellProps {
  chapterId: ChapterId;
  gns: GlobalNarrativeSave;
  siteTime: Date;
  clearance: number;
  playerName: string;
  employeeId: string | null;
  activeApp: AppId;
  unlockedApps: AppId[];
  muted: boolean;
  onToggleMute: () => void;
  onSelectNav: (navId: DashboardNavId) => void;
  onExit: () => void;
  showDirectorShortcut?: boolean;
  onOpenDirectorOffice?: () => void;
  renderApp: (id: AppId) => ReactNode;
  overlay?: ReactNode;
}

const WIDGET_TITLES: Partial<Record<AppId, string>> = {
  messenger: "Messagerie sécurisée v3.6",
};

export function DashboardShell({
  chapterId,
  gns,
  siteTime,
  clearance,
  playerName,
  employeeId,
  activeApp,
  unlockedApps,
  muted,
  onToggleMute,
  onSelectNav,
  onExit,
  showDirectorShortcut,
  onOpenDirectorOffice,
  renderApp,
  overlay,
}: DashboardShellProps) {
  const mainTitle = WIDGET_TITLES[activeApp] ?? APP_TITLES[activeApp].split(" — ")[0];

  return (
    <div className="dashboard-shell relative flex h-screen flex-col overflow-hidden font-[system-ui,sans-serif]">
      <DashboardHeader
        siteTime={siteTime}
        clearance={clearance}
        siteStatus={gns.world.siteStatus}
        playerName={playerName}
        employeeId={employeeId}
        chapterId={chapterId}
        muted={muted}
        onToggleMute={onToggleMute}
        onExit={onExit}
      />

      <div className="flex min-h-0 flex-1">
        <DashboardSidebar
          activeApp={activeApp}
          unlockedApps={unlockedApps}
          onSelectNav={onSelectNav}
          showDirectorShortcut={showDirectorShortcut}
          onOpenDirectorOffice={onOpenDirectorOffice}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 p-2">
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 xl:grid-cols-12">
            <div className="flex min-h-0 flex-col xl:col-span-7">
              <DashboardWidget title={mainTitle} className="h-full min-h-[280px]" bodyClassName="min-h-0">
                {renderApp(activeApp)}
              </DashboardWidget>
            </div>

            <div className="flex min-h-0 flex-col gap-2 xl:col-span-5">
              <DashboardIdCard
                gns={gns}
                clearance={clearance}
                playerName={playerName}
                employeeId={employeeId}
              />
              <div className="min-h-0 flex-1">
                <DashboardSystemAlerts gns={gns} chapterId={chapterId} />
              </div>
            </div>
          </div>

          <DashboardBottomWidgets gns={gns} />
        </div>
      </div>

      {overlay}
    </div>
  );
}
