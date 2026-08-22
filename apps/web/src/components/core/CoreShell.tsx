"use client";

import { useCoreShell } from "./CoreShellProvider";
import { FactionThemeScope } from "@/components/factions/FactionThemeScope";
import { CoreTopBar } from "./CoreTopBar";
import { CoreAppGrid } from "./CoreAppGrid";
import { CoreDesktopWidgets } from "./CoreDesktopWidgets";
import { CoreWindowLayer } from "./CoreWindowLayer";
import { CoreTaskbar } from "./CoreTaskbar";
import { CoreAlertOverlay } from "./CoreAlertOverlay";

export function CoreShell() {
  const { session } = useCoreShell();

  return (
    <FactionThemeScope theme={session.theme} className="h-screen w-screen">
      {/*
        FactionThemeScope's own content wrapper (.faction-scope-content) is
        shrink-to-fit by design (needed on the public faction pages it's
        normally used on) — it never stretches to fill a h-screen ancestor.
        This inner div declares its own h-screen independently so the
        flex-1 desktop area below actually gets a real height to grow into,
        instead of collapsing to its content's natural size.
      */}
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-black">
        <CoreAlertOverlay />
        <CoreTopBar />
        <div className="relative flex-1">
          <CoreAppGrid />
          <CoreDesktopWidgets />
          <CoreWindowLayer />
        </div>
        <CoreTaskbar />
      </div>
    </FactionThemeScope>
  );
}
