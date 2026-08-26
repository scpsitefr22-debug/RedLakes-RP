"use client";

import { useRef } from "react";
import { Minus, Square, Shrink, X } from "lucide-react";
import { getCoreApps } from "@/lib/core/app-registry";
import { cn } from "@/lib/utils";
import { useCoreShell, type CoreWindowState } from "./CoreShellProvider";

const WINDOW_WIDTH = 460;
const TITLEBAR_HEIGHT = 48;

export function CoreWindow({
  win,
  zIndex,
  focused,
}: {
  win: CoreWindowState;
  zIndex: number;
  focused: boolean;
}) {
  const { session, closeApp, focusApp, toggleMinimize, toggleMaximize, moveWindow } = useCoreShell();
  const rootRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    containerLeft: number;
    containerTop: number;
  } | null>(null);

  const app = getCoreApps(session.factionSlug).find((a) => a.id === win.appId);
  if (!app || win.minimized) return null;

  const AppComponent = app.component;

  const onTitlePointerDown = (e: React.PointerEvent) => {
    if (win.maximized) return;
    focusApp(win.appId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const containerRect = (rootRef.current?.offsetParent as HTMLElement | null)?.getBoundingClientRect();
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: win.x,
      originY: win.y,
      containerLeft: containerRect?.left ?? 0,
      containerTop: containerRect?.top ?? 0,
    };
  };

  const onTitlePointerMove = (e: React.PointerEvent) => {
    const drag = dragState.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    // Position en coordonnées écran, pour garder la fenêtre entièrement
    // visible (titre + boutons réduire/fermer toujours atteignables) même
    // si le conteneur est plus large que le viewport.
    const screenX = drag.containerLeft + drag.originX + dx;
    const screenY = drag.containerTop + drag.originY + dy;
    const maxScreenX = Math.max(0, window.innerWidth - WINDOW_WIDTH);
    const maxScreenY = Math.max(0, window.innerHeight - TITLEBAR_HEIGHT);
    const clampedScreenX = Math.min(Math.max(screenX, 0), maxScreenX);
    const clampedScreenY = Math.min(Math.max(screenY, 0), maxScreenY);

    moveWindow(win.appId, clampedScreenX - drag.containerLeft, clampedScreenY - drag.containerTop);
  };

  const onTitlePointerUp = () => {
    dragState.current = null;
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "faction-card core-window-in pointer-events-auto flex flex-col overflow-hidden bg-black/95 backdrop-blur-sm",
        !win.maximized && "max-h-[70vh]",
        focused ? "shadow-2xl faction-siren-pulse" : "shadow-lg opacity-90",
      )}
      style={
        win.maximized
          ? { position: "absolute", inset: "0.5rem", zIndex }
          : {
              position: "absolute",
              left: win.x,
              top: win.y,
              width: WINDOW_WIDTH,
              maxWidth: "calc(100vw - 2rem)",
              zIndex,
            }
      }
      onPointerDown={() => focusApp(win.appId)}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b px-3 py-2",
          win.maximized ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        )}
        style={{ borderColor: session.theme.rgba.border }}
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
        onDoubleClick={() => toggleMaximize(win.appId)}
      >
        <p
          className="faction-heading select-none text-xs font-bold tracking-wide"
          style={{ color: session.theme.colors.glow }}
        >
          {app.label.toUpperCase()}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleMinimize(win.appId)}
            className="text-gray-500 hover:text-white"
            aria-label="Réduire"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => toggleMaximize(win.appId)}
            className="text-gray-500 hover:text-white"
            aria-label={win.maximized ? "Restaurer" : "Agrandir"}
          >
            {win.maximized ? <Shrink className="h-3.5 w-3.5" /> : <Square className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={() => closeApp(win.appId)}
            className="text-gray-500 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <AppComponent />
      </div>
    </div>
  );
}
