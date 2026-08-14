import { useCallback, useEffect, useMemo, useState } from "react";

import type { ChapterId } from "@redlakes/narrative-core";

import {
  getChapterManifest,
  getPlayerClearance,
  getPlayerDisplayName,
  hasCompletedChapter,
} from "@redlakes/narrative-core";

import { useAmbientAudioContext } from "../context/AmbientAudioContext";

import { useGNSRequired, useStartChapter } from "../context/GNSContext";

import {
  type AppId,
  APP_TITLES,
  getEffectiveUnlockedApps,
  hasFullWorkstation,
} from "../lib/workstation";

import { ChapterCompleteOverlay } from "./ChapterCompleteOverlay";

import { DocumentViewer } from "./DocumentViewer";

import { DirectorOfficeScene } from "./DirectorOfficeScene";

import { ToastStack, type ToastItem } from "./ToastStack";

import { DashboardShell } from "./dashboard/DashboardShell";

import { resolveNavAppId, type DashboardNavId } from "./dashboard/dashboard-nav";

import { useWorldEventTicker } from "../hooks/useWorldEventTicker";

import { MessengerApp } from "../apps/MessengerApp";

import { EmailApp } from "../apps/EmailApp";

import { DocumentsApp } from "../apps/DocumentsApp";

import { ScpDatabaseApp } from "../apps/ScpDatabaseApp";

import { PersonnelApp } from "../apps/PersonnelApp";

import { CassieApp } from "../apps/CassieApp";

import { IncidentLogApp } from "../apps/IncidentLogApp";

import { CalendarApp } from "../apps/CalendarApp";

import { SettingsApp } from "../apps/SettingsApp";

interface TerminalShellProps {
  chapterId: ChapterId;
  onExit: () => void;
}

export function TerminalShell({ chapterId, onExit }: TerminalShellProps) {
  const { gns } = useGNSRequired();
  const { muted, toggleMuted, setAmbientMode } = useAmbientAudioContext();
  const startChapter = useStartChapter(chapterId);
  const [activeApp, setActiveApp] = useState<AppId>("messenger");
  const [siteTime, setSiteTime] = useState(new Date());
  const [showComplete, setShowComplete] = useState(false);
  const [openDocumentId, setOpenDocumentId] = useState<string | null>(null);
  const [directorScene, setDirectorScene] = useState(
    () => chapterId === 1 && !gns.flags.ch1_left_director_office
  );
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const alreadyCompleted = hasCompletedChapter(gns, chapterId);
  const chapterManifest = getChapterManifest(chapterId);

  useWorldEventTicker(chapterId, !directorScene);

  const pushToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const unlockedApps = useMemo(
    () => getEffectiveUnlockedApps(gns, chapterId),
    [gns, chapterId]
  );

  const showDirectorShortcut =
    chapterId === 1 && !gns.flags.ch1_left_director_office && !directorScene;

  useEffect(() => {
    startChapter();
  }, [startChapter]);

  useEffect(() => {
    setAmbientMode(directorScene ? "office" : "terminal");
    return () => setAmbientMode("off");
  }, [directorScene, setAmbientMode]);

  useEffect(() => {
    if (chapterId === 1 && !gns.flags.ch1_left_director_office) {
      setDirectorScene(true);
    }
  }, [chapterId, gns.flags.ch1_left_director_office]);

  useEffect(() => {
    const id = setInterval(() => setSiteTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!unlockedApps.includes(activeApp)) {
      setActiveApp(unlockedApps[0] ?? "messenger");
    }
  }, [unlockedApps, activeApp]);

  const handleSelectNav = useCallback(
    (navId: DashboardNavId) => {
      const appId = resolveNavAppId(navId);
      if (!appId || !unlockedApps.includes(appId)) return;
      setActiveApp(appId);
    },
    [unlockedApps]
  );

  const handleOpenDocument = useCallback(
    (documentId: string) => {
      setOpenDocumentId(documentId);
      if (hasFullWorkstation(gns, chapterId)) {
        setActiveApp("documents");
      }
    },
    [gns, chapterId]
  );

  const renderApp = (id: AppId) => {
    switch (id) {
      case "messenger":
        return (
          <MessengerApp
            chapterId={chapterId}
            variant="dashboard"
            onChapterComplete={() => setShowComplete(true)}
            onOpenDocument={handleOpenDocument}
            onNewContact={(label) => pushToast(`Nouveau contact — ${label}`)}
          />
        );
      case "email":
        return <EmailApp />;
      case "documents":
        return <DocumentsApp onOpenDocument={setOpenDocumentId} />;
      case "scp-database":
        return <ScpDatabaseApp onOpenDocument={setOpenDocumentId} />;
      case "personnel":
        return <PersonnelApp />;
      case "cassie":
        return <CassieApp />;
      case "incident-log":
        return <IncidentLogApp />;
      case "calendar":
        return <CalendarApp />;
      case "settings":
        return <SettingsApp />;
      default:
        return (
          <div className="flex h-full items-center justify-center p-6 text-center text-[11px] text-metal">
            {APP_TITLES[id]}
          </div>
        );
    }
  };

  if (directorScene) {
    return <DirectorOfficeScene onComplete={() => setDirectorScene(false)} />;
  }

  return (
    <>
      <DashboardShell
        chapterId={chapterId}
        gns={gns}
        siteTime={siteTime}
        clearance={getPlayerClearance(gns)}
        playerName={getPlayerDisplayName(gns)}
        employeeId={gns.player.employeeId}
        activeApp={activeApp}
        unlockedApps={unlockedApps}
        muted={muted}
        onToggleMute={toggleMuted}
        onSelectNav={handleSelectNav}
        onExit={onExit}
        showDirectorShortcut={showDirectorShortcut}
        onOpenDirectorOffice={() => setDirectorScene(true)}
        renderApp={renderApp}
        overlay={
          <>
            <ToastStack toasts={toasts} />
            {showComplete && (
              <ChapterCompleteOverlay
                gns={gns}
                chapterTitle={chapterManifest?.title ?? `Chapitre ${chapterId}`}
                onContinue={onExit}
              />
            )}
            {alreadyCompleted && (
              <div className="pointer-events-none absolute right-4 top-16 z-20 border border-terminal/30 bg-panel/80 px-2 py-1 text-[9px] text-terminal backdrop-blur-sm">
                Chapitre terminé
              </div>
            )}
            {!hasFullWorkstation(gns, chapterId) && (
              <div className="pointer-events-none absolute bottom-36 left-1/2 z-20 max-w-md -translate-x-1/2 border border-dashboard-border bg-dashboard-panel/95 px-4 py-2 text-center text-[10px] text-metal backdrop-blur-sm">
                Poste minimal — accès complet après l&apos;entretien avec le Directeur
              </div>
            )}
          </>
        }
      />

      {openDocumentId && (
        <DocumentViewer documentId={openDocumentId} onClose={() => setOpenDocumentId(null)} />
      )}
    </>
  );
}
