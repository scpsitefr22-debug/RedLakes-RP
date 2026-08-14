import type { GlobalNarrativeSave } from "../types/gns.js";
import {
  GNS_STORAGE_KEY,
  createGlobalNarrativeSave,
  getPlayerDisplayName,
  migrateGNS,
  touchGNS,
} from "./create.js";

export const GNS_SLOTS_INDEX_KEY = "redlakes-terminal-slots";

export function gnsStorageKey(saveId: string): string {
  return `${GNS_STORAGE_KEY}-${saveId}`;
}

export interface GNSSlotSummary {
  saveId: string;
  displayName: string;
  employeeId: string | null;
  chaptersCompleted: number;
  updatedAt: string;
  hasProfile: boolean;
}

interface SlotsIndex {
  version: 1;
  activeSaveId: string | null;
  saveIds: string[];
}

function emptyIndex(): SlotsIndex {
  return { version: 1, activeSaveId: null, saveIds: [] };
}

function readIndex(): SlotsIndex {
  if (typeof localStorage === "undefined") return emptyIndex();
  try {
    const raw = localStorage.getItem(GNS_SLOTS_INDEX_KEY);
    if (!raw) return emptyIndex();
    const parsed = JSON.parse(raw) as SlotsIndex;
    if (parsed.version !== 1 || !Array.isArray(parsed.saveIds)) return emptyIndex();
    return parsed;
  } catch {
    return emptyIndex();
  }
}

function writeIndex(index: SlotsIndex): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(GNS_SLOTS_INDEX_KEY, JSON.stringify(index));
}

function readGNSFromKey(key: string): GlobalNarrativeSave | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return migrateGNS(JSON.parse(raw) as GlobalNarrativeSave);
  } catch {
    return null;
  }
}

function writeGNS(gns: GlobalNarrativeSave): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(gnsStorageKey(gns.saveId), JSON.stringify(gns));
}

export function summarizeGNS(gns: GlobalNarrativeSave): GNSSlotSummary {
  return {
    saveId: gns.saveId,
    displayName: getPlayerDisplayName(gns),
    employeeId: gns.player.employeeId,
    chaptersCompleted: gns.session.chaptersCompleted.length,
    updatedAt: gns.updatedAt,
    hasProfile: gns.player.displayName.trim().length >= 2,
  };
}

/** Importe l'ancienne clé unique vers le système multi-dossiers. */
export function migrateLegacyGNSSave(): void {
  if (typeof localStorage === "undefined") return;

  const legacy = localStorage.getItem(GNS_STORAGE_KEY);
  if (!legacy) return;

  const gns = migrateGNS(JSON.parse(legacy) as GlobalNarrativeSave);
  const index = readIndex();

  if (!index.saveIds.includes(gns.saveId)) {
    index.saveIds.push(gns.saveId);
  }
  if (!index.activeSaveId) {
    index.activeSaveId = gns.saveId;
  }

  writeGNS(gns);
  writeIndex(index);
  localStorage.removeItem(GNS_STORAGE_KEY);
}

export function listGNSSlots(): GNSSlotSummary[] {
  migrateLegacyGNSSave();
  const index = readIndex();
  return index.saveIds
    .map((id) => {
      const gns = readGNSFromKey(gnsStorageKey(id));
      return gns ? summarizeGNS(gns) : null;
    })
    .filter((s): s is GNSSlotSummary => s !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function loadGNSBySaveId(saveId: string): GlobalNarrativeSave | null {
  migrateLegacyGNSSave();
  return readGNSFromKey(gnsStorageKey(saveId));
}

export function loadActiveGNS(): GlobalNarrativeSave | null {
  migrateLegacyGNSSave();
  const index = readIndex();
  if (!index.activeSaveId) return null;
  return loadGNSBySaveId(index.activeSaveId);
}

export function setActiveSaveId(saveId: string): void {
  const index = readIndex();
  if (!index.saveIds.includes(saveId)) {
    index.saveIds.push(saveId);
  }
  index.activeSaveId = saveId;
  writeIndex(index);
}

export function createNewGNSSave(): GlobalNarrativeSave {
  migrateLegacyGNSSave();
  const gns = createGlobalNarrativeSave();
  const index = readIndex();
  index.saveIds.push(gns.saveId);
  index.activeSaveId = gns.saveId;
  writeIndex(index);
  writeGNS(gns);
  return gns;
}

export function persistGNSSave(gns: GlobalNarrativeSave): GlobalNarrativeSave {
  const next = touchGNS(gns);
  writeGNS(next);

  const index = readIndex();
  if (!index.saveIds.includes(next.saveId)) {
    index.saveIds.push(next.saveId);
  }
  index.activeSaveId = next.saveId;
  writeIndex(index);

  return next;
}

export function deleteGNSSave(saveId: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(gnsStorageKey(saveId));

  const index = readIndex();
  index.saveIds = index.saveIds.filter((id) => id !== saveId);
  if (index.activeSaveId === saveId) {
    index.activeSaveId = index.saveIds[0] ?? null;
  }
  writeIndex(index);
}

/** Efface tous les dossiers (outil dev / reset complet). */
export function clearAllGNSSaves(): void {
  if (typeof localStorage === "undefined") return;
  migrateLegacyGNSSave();
  const index = readIndex();
  for (const id of index.saveIds) {
    localStorage.removeItem(gnsStorageKey(id));
  }
  localStorage.removeItem(GNS_SLOTS_INDEX_KEY);
  localStorage.removeItem(GNS_STORAGE_KEY);
}
