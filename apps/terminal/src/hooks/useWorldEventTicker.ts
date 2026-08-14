import { useEffect } from "react";
import type { ChapterId } from "@redlakes/narrative-core";
import { processOfflineEvents } from "@redlakes/narrative-core";
import { useGNS } from "../context/GNSContext";

/** Fait avancer les événements offline pendant la session (rumeurs, relances, etc.) */
export function useWorldEventTicker(chapterId: ChapterId, active: boolean) {
  const { updateGNS } = useGNS();

  useEffect(() => {
    if (!active) return;

    const id = window.setInterval(() => {
      updateGNS((g) => processOfflineEvents(g, 1, chapterId).gns);
    }, 1000);

    return () => clearInterval(id);
  }, [chapterId, active, updateGNS]);
}
