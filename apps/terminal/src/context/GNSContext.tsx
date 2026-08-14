import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ChapterId, GlobalNarrativeSave, GNSSlotSummary } from "@redlakes/narrative-core";
import {
  createNewGNSSave,
  endSession,
  getElapsedSecondsSinceLastSession,
  getOfflineEventsForChapter,
  listGNSSlots,
  loadGNSBySaveId,
  markChapterCompleted,
  markChapterStarted,
  migrateLegacyGNSSave,
  persistGNSSave,
  processOfflineEvents,
  scheduleWorldEvent,
  setActiveSaveId,
  setPlayerProfile,
} from "@redlakes/narrative-core";

interface GNSContextValue {
  gns: GlobalNarrativeSave | null;
  currentChapter: ChapterId;
  setCurrentChapter: (ch: ChapterId) => void;
  updateGNS: (updater: (prev: GlobalNarrativeSave) => GlobalNarrativeSave) => void;
  saveNow: () => Promise<void>;
  registerPlayer: (displayName: string) => Promise<void>;
  listSaveSlots: () => GNSSlotSummary[];
  activateSave: (saveId: string) => Promise<GlobalNarrativeSave | null>;
  createNewSaveSlot: () => Promise<GlobalNarrativeSave>;
  offlineEventsTriggered: number;
  sessionStartedAt: number;
  ready: boolean;
}

const GNSContext = createContext<GNSContextValue | null>(null);

export function GNSProvider({ children }: { children: ReactNode }) {
  const [gns, setGns] = useState<GlobalNarrativeSave | null>(null);
  const [ready, setReady] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<ChapterId>(1);
  const [offlineEventsTriggered, setOfflineEventsTriggered] = useState(0);
  const sessionStartedAt = useRef(Date.now());
  const playTimeTracker = useRef(Date.now());

  useEffect(() => {
    migrateLegacyGNSSave();
    setReady(true);
  }, []);

  useEffect(() => {
    const onUnload = () => {
      if (!gns) return;
      const delta = Math.floor((Date.now() - playTimeTracker.current) / 1000);
      const ended = endSession(gns, delta);
      persistGNSSave(ended);
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [gns]);

  const updateGNS = useCallback((updater: (prev: GlobalNarrativeSave) => GlobalNarrativeSave) => {
    setGns((prev) => (prev ? updater(prev) : prev));
  }, []);

  const saveNow = useCallback(async () => {
    if (!gns) return;
    const saved = persistGNSSave(gns);
    setGns(saved);
  }, [gns]);

  const registerPlayer = useCallback(
    async (displayName: string) => {
      if (!gns) return;
      const next = persistGNSSave(setPlayerProfile(gns, displayName));
      setGns(next);
    },
    [gns]
  );

  const listSaveSlots = useCallback(() => listGNSSlots(), []);

  const activateSave = useCallback(async (saveId: string) => {
    let loaded = loadGNSBySaveId(saveId);
    if (!loaded) return null;

    setActiveSaveId(saveId);
    const elapsed = getElapsedSecondsSinceLastSession(loaded);
    if (elapsed > 0) {
      const { gns: updated, triggered } = processOfflineEvents(loaded, elapsed, 1);
      loaded = updated;
      if (triggered.length > 0) {
        setOfflineEventsTriggered((n) => n + triggered.length);
      }
    }

    loaded = persistGNSSave(loaded);
    setGns(loaded);
    sessionStartedAt.current = Date.now();
    playTimeTracker.current = Date.now();
    return loaded;
  }, []);

  const createNewSaveSlot = useCallback(async () => {
    const fresh = createNewGNSSave();
    setGns(fresh);
    setOfflineEventsTriggered(0);
    sessionStartedAt.current = Date.now();
    playTimeTracker.current = Date.now();
    return fresh;
  }, []);

  useEffect(() => {
    if (!gns) return;
    const id = setInterval(() => {
      setGns((prev) => (prev ? persistGNSSave(prev) : prev));
    }, 15000);
    return () => clearInterval(id);
  }, [gns?.saveId]);

  const value = useMemo<GNSContextValue>(
    () => ({
      gns,
      currentChapter,
      setCurrentChapter,
      updateGNS,
      saveNow,
      registerPlayer,
      listSaveSlots,
      activateSave,
      createNewSaveSlot,
      offlineEventsTriggered,
      sessionStartedAt: sessionStartedAt.current,
      ready,
    }),
    [
      gns,
      currentChapter,
      updateGNS,
      saveNow,
      registerPlayer,
      listSaveSlots,
      activateSave,
      createNewSaveSlot,
      offlineEventsTriggered,
      ready,
    ]
  );

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-terminal">
        Initialisation terminal sécurisé...
      </div>
    );
  }

  return <GNSContext.Provider value={value}>{children}</GNSContext.Provider>;
}

export function useGNS() {
  const ctx = useContext(GNSContext);
  if (!ctx) throw new Error("useGNS must be used within GNSProvider");
  return ctx;
}

export function useGNSRequired() {
  const ctx = useGNS();
  if (!ctx.gns) throw new Error("Aucun dossier personnel actif");
  return { ...ctx, gns: ctx.gns };
}

export function useStartChapter(chapter: ChapterId) {
  const { updateGNS, gns } = useGNS();
  return useCallback(() => {
    if (!gns) return;
    void getOfflineEventsForChapter(chapter).then((events) => {
      updateGNS((current) => {
        let next = markChapterStarted(current, chapter);
        for (const ev of events) {
          next = scheduleWorldEvent(next, ev);
        }
        return next;
      });
    });
  }, [chapter, updateGNS, gns]);
}

export function useCompleteChapter(chapter: ChapterId) {
  const { updateGNS, saveNow, gns } = useGNS();
  return useCallback(async () => {
    if (!gns) return;
    updateGNS((current) => markChapterCompleted(current, chapter));
    await saveNow();
  }, [chapter, updateGNS, saveNow, gns]);
}
