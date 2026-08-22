"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CoreSession } from "@/hooks/useCoreSession";

export interface CoreWindowState {
  appId: string;
  x: number;
  y: number;
  minimized: boolean;
  maximized: boolean;
}

interface CoreShellContextValue {
  session: CoreSession;
  /** Fenêtres ouvertes, dans leur ordre de création (pas l'ordre d'empilement — voir `order`) */
  windows: CoreWindowState[];
  /** Ids des fenêtres ouvertes du bas vers le haut — la dernière est au premier plan */
  order: string[];
  openApp: (id: string) => void;
  closeApp: (id: string) => void;
  focusApp: (id: string) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
}

const CoreShellContext = createContext<CoreShellContextValue | null>(null);

const CASCADE_STEP = 32;
const BASE_X = 40;
const BASE_Y = 16;
const CASCADE_SLOTS = 6;

export function CoreShellProvider({
  session,
  children,
}: {
  session: CoreSession;
  children: ReactNode;
}) {
  const [windows, setWindows] = useState<CoreWindowState[]>([]);
  const [order, setOrder] = useState<string[]>([]);

  const focusApp = (id: string) => {
    setOrder((prev) => [...prev.filter((appId) => appId !== id), id]);
    setWindows((prev) =>
      prev.map((w) => (w.appId === id ? { ...w, minimized: false } : w)),
    );
  };

  const openApp = (id: string) => {
    setWindows((prev) => {
      if (prev.some((w) => w.appId === id)) return prev;
      const slot = prev.length % CASCADE_SLOTS;
      return [
        ...prev,
        {
          appId: id,
          x: BASE_X + slot * CASCADE_STEP,
          y: BASE_Y + slot * CASCADE_STEP,
          minimized: false,
          maximized: false,
        },
      ];
    });
    focusApp(id);
  };

  const closeApp = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.appId !== id));
    setOrder((prev) => prev.filter((appId) => appId !== id));
  };

  const toggleMinimize = (id: string) => {
    const win = windows.find((w) => w.appId === id);
    if (win?.minimized) {
      focusApp(id);
    } else {
      setWindows((prev) =>
        prev.map((w) => (w.appId === id ? { ...w, minimized: true } : w)),
      );
    }
  };

  const moveWindow = (id: string, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.appId === id ? { ...w, x, y } : w)));
  };

  const toggleMaximize = (id: string) => {
    focusApp(id);
    setWindows((prev) =>
      prev.map((w) => (w.appId === id ? { ...w, maximized: !w.maximized } : w)),
    );
  };

  return (
    <CoreShellContext.Provider
      value={{
        session,
        windows,
        order,
        openApp,
        closeApp,
        focusApp,
        toggleMinimize,
        toggleMaximize,
        moveWindow,
      }}
    >
      {children}
    </CoreShellContext.Provider>
  );
}

export function useCoreShell(): CoreShellContextValue {
  const ctx = useContext(CoreShellContext);
  if (!ctx) throw new Error("useCoreShell must be used within a CoreShellProvider");
  return ctx;
}
