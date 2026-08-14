import type { GNSStorageAdapter, GlobalNarrativeSave } from "../types/gns.js";
import { GNS_STORAGE_KEY, createGlobalNarrativeSave, migrateGNS } from "./create.js";

export function createLocalStorageAdapter(key = GNS_STORAGE_KEY): GNSStorageAdapter {
  return {
    async load(): Promise<GlobalNarrativeSave | null> {
      if (typeof localStorage === "undefined") return null;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as GlobalNarrativeSave;
        return migrateGNS(parsed);
      } catch {
        return null;
      }
    },
    async save(gns: GlobalNarrativeSave): Promise<void> {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(key, JSON.stringify(gns));
    },
  };
}

export async function loadOrCreateGNS(adapter: GNSStorageAdapter): Promise<GlobalNarrativeSave> {
  const existing = await adapter.load();
  return existing ?? createGlobalNarrativeSave();
}

export async function persistGNS(adapter: GNSStorageAdapter, gns: GlobalNarrativeSave): Promise<void> {
  await adapter.save(gns);
}
