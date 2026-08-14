export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type SiteStatus = "stable" | "breach" | "lockdown" | "audit" | "xk-scenario";

export type TrustLevel = "hostile" | "wary" | "neutral" | "warm" | "loyal";

export interface CharacterMemory {
  met: boolean;
  metInChapter?: ChapterId;
  trust: TrustLevel;
  knownFacts: string[];
  unresolvedPromises: string[];
  liesDetected: string[];
  lastContactChapter: ChapterId | null;
  messagesIgnored: number;
  relationshipNotes: string[];
}

export interface ScheduledWorldEvent {
  id: string;
  triggerAfterSeconds: number;
  requiresFlags?: string[];
  excludesFlags?: string[];
  chapterMin?: ChapterId;
  effect: WorldEventEffect;
}

export type WorldEventEffect =
  | { type: "character_death"; characterId: string }
  | { type: "character_promotion"; characterId: string; newTitle: string }
  | { type: "set_flag"; flag: string; value: unknown }
  | { type: "queue_message"; threadId: string; nodeId: string }
  | { type: "site_status"; status: SiteStatus }
  | { type: "unlock_app"; appId: string };

export interface WorldState {
  siteStatus: SiteStatus;
  currentDirectorId: string | null;
  deadCharacters: string[];
  promotedCharacters: Record<string, string>;
  scpEncountered: string[];
  documentsRead: string[];
  videosWatched: string[];
  unlockedApps: string[];
}

export interface SessionMeta {
  lastSessionEnd: string | null;
  lastPlayedChapter: ChapterId | null;
  chaptersCompleted: ChapterId[];
  chaptersStarted: ChapterId[];
  playTimeSeconds: number;
}

export interface PlayerProfile {
  displayName: string;
  role: "recrue";
  employeeId: string | null;
  registeredAt: string | null;
}

export interface GlobalNarrativeSave {
  schemaVersion: number;
  saveId: string;
  createdAt: string;
  updatedAt: string;
  player: PlayerProfile;
  session: SessionMeta;
  world: WorldState;
  characterMemory: Record<string, CharacterMemory>;
  sagaChoices: Record<string, unknown>;
  flags: Record<string, unknown>;
  pendingWorldEvents: ScheduledWorldEvent[];
  processedEventIds: string[];
  chapterProgress: Partial<Record<ChapterId, ChapterProgressState>>;
}

export interface PersistedThreadMessage {
  id: string;
  sender: "character" | "system" | "player";
  text: string;
  fromPlayer?: boolean;
  attachment?: { type: "document" | "image" | "video"; label: string; id: string };
}

export interface PersistedThreadState {
  threadId: string;
  currentNodeId: string;
  history: PersistedThreadMessage[];
  started: boolean;
  complete: boolean;
  awaitingChoices: boolean;
}

export interface ChapterProgressState {
  currentNodeId: string | null;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  threads?: Record<string, PersistedThreadState>;
}

export interface GNSStorageAdapter {
  load(): Promise<GlobalNarrativeSave | null>;
  save(gns: GlobalNarrativeSave): Promise<void>;
}
