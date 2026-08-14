import type { CharacterMemory, ChapterId, GlobalNarrativeSave, PlayerProfile } from "../types/gns.js";

export const GNS_SCHEMA_VERSION = 2;
export const GNS_STORAGE_KEY = "redlakes-terminal-gns";

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `gns-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyCharacterMemory(): CharacterMemory {
  return {
    met: false,
    trust: "neutral",
    knownFacts: [],
    unresolvedPromises: [],
    liesDetected: [],
    lastContactChapter: null,
    messagesIgnored: 0,
    relationshipNotes: [],
  };
}

export function createEmptyPlayerProfile(): PlayerProfile {
  return {
    displayName: "",
    role: "recrue",
    employeeId: null,
    registeredAt: null,
  };
}

export function createGlobalNarrativeSave(): GlobalNarrativeSave {
  const now = new Date().toISOString();
  return {
    schemaVersion: GNS_SCHEMA_VERSION,
    saveId: generateId(),
    createdAt: now,
    updatedAt: now,
    player: createEmptyPlayerProfile(),
    session: {
      lastSessionEnd: null,
      lastPlayedChapter: null,
      chaptersCompleted: [],
      chaptersStarted: [],
      playTimeSeconds: 0,
    },
    world: {
      siteStatus: "stable",
      currentDirectorId: "directeur-site",
      deadCharacters: [],
      promotedCharacters: {},
      scpEncountered: [],
      documentsRead: [],
      videosWatched: [],
      unlockedApps: ["messenger", "email"],
    },
    characterMemory: {},
    sagaChoices: {},
    flags: {},
    pendingWorldEvents: [],
    processedEventIds: [],
    chapterProgress: {},
  };
}

export function getCharacterMemory(gns: GlobalNarrativeSave, characterId: string): CharacterMemory {
  if (!gns.characterMemory[characterId]) {
    gns.characterMemory[characterId] = createEmptyCharacterMemory();
  }
  return gns.characterMemory[characterId];
}

export function touchGNS(gns: GlobalNarrativeSave): GlobalNarrativeSave {
  return { ...gns, updatedAt: new Date().toISOString() };
}

export function hasCompletedChapter(gns: GlobalNarrativeSave, chapter: ChapterId): boolean {
  return gns.session.chaptersCompleted.includes(chapter);
}

export function hasPriorSagaProgress(gns: GlobalNarrativeSave): boolean {
  return gns.session.chaptersCompleted.length > 0 || Object.keys(gns.sagaChoices).length > 0;
}

export function getCompletedChapterCount(gns: GlobalNarrativeSave): number {
  return gns.session.chaptersCompleted.length;
}

export function markChapterStarted(gns: GlobalNarrativeSave, chapter: ChapterId): GlobalNarrativeSave {
  const started = new Set(gns.session.chaptersStarted);
  started.add(chapter);
  const progress = { ...gns.chapterProgress };
  if (!progress[chapter]) {
    progress[chapter] = {
      currentNodeId: null,
      completed: false,
      startedAt: new Date().toISOString(),
    };
  }
  return touchGNS({
    ...gns,
    session: {
      ...gns.session,
      lastPlayedChapter: chapter,
      chaptersStarted: [...started],
    },
    chapterProgress: progress,
  });
}

export function markChapterCompleted(gns: GlobalNarrativeSave, chapter: ChapterId): GlobalNarrativeSave {
  const completed = new Set(gns.session.chaptersCompleted);
  completed.add(chapter);
  const progress = { ...gns.chapterProgress };
  progress[chapter] = {
    ...progress[chapter],
    currentNodeId: null,
    completed: true,
    startedAt: progress[chapter]?.startedAt ?? new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
  return touchGNS({
    ...gns,
    session: { ...gns.session, chaptersCompleted: [...completed].sort((a, b) => a - b) },
    chapterProgress: progress,
  });
}

export function migrateGNS(raw: GlobalNarrativeSave): GlobalNarrativeSave {
  let next = { ...raw };

  if (!next.player) {
    next = { ...next, player: createEmptyPlayerProfile() };
  }
  if (!next.flags) next = { ...next, flags: {} };
  if (!next.sagaChoices) next = { ...next, sagaChoices: {} };
  if (!next.characterMemory) next = { ...next, characterMemory: {} };
  if (!next.chapterProgress) next = { ...next, chapterProgress: {} };

  const flags = { ...next.flags };

  // Sauvegardes antérieures à la scène bureau : l'entretien passait par la messagerie
  if (next.sagaChoices.ch1_briefing_response && !flags.ch1_directeur_resolved) {
    flags.ch1_directeur_resolved = true;
  }
  // Sans ce flag, tous les contacts restent verrouillés indéfiniment
  if (flags.ch1_directeur_resolved && !flags.ch1_left_director_office) {
    flags.ch1_left_director_office = true;
  }

  next = { ...next, flags };

  if (next.schemaVersion < GNS_SCHEMA_VERSION) {
    next = { ...next, schemaVersion: GNS_SCHEMA_VERSION };
  }

  return next;
}

export function hasPlayerProfile(gns: GlobalNarrativeSave): boolean {
  return gns.player.displayName.trim().length >= 2;
}

export function getPlayerDisplayName(gns: GlobalNarrativeSave): string {
  return gns.player.displayName.trim() || "Recrue";
}

function generateEmployeeId(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RL-${suffix}`;
}

export function setPlayerProfile(gns: GlobalNarrativeSave, displayName: string): GlobalNarrativeSave {
  const trimmed = displayName.trim();
  return touchGNS({
    ...gns,
    player: {
      displayName: trimmed,
      role: "recrue",
      employeeId: gns.player.employeeId ?? generateEmployeeId(),
      registeredAt: gns.player.registeredAt ?? new Date().toISOString(),
    },
  });
}

export function validatePlayerName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Minimum 2 caractères.";
  if (trimmed.length > 32) return "Maximum 32 caractères.";
  if (!/^[\p{L}\p{N}\s'.-]+$/u.test(trimmed)) {
    return "Caractères autorisés : lettres, chiffres, espaces, tirets.";
  }
  return null;
}
