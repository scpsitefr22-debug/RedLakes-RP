import type { ChapterId, GlobalNarrativeSave, TrustLevel } from "./gns.js";

export interface DialogueChoice {
  id: string;
  label: string;
  requires?: NarrativeCondition[];
  sets?: Record<string, unknown>;
  sagaChoice?: { key: string; value: unknown };
  characterEffects?: CharacterEffect[];
  unlocks?: string[];
  nextNodeId?: string;
  delaySeconds?: number;
  completeChapter?: boolean;
}

export interface CharacterEffect {
  characterId: string;
  trustDelta?: number;
  addFact?: string;
  addNote?: string;
  addPromise?: string;
  resolvePromise?: string;
}

export interface DialogueMessage {
  id: string;
  sender: "character" | "system" | "player";
  text: string;
  delaySeconds?: number;
  attachment?: { type: "document" | "image" | "video"; label: string; id: string };
  edited?: boolean;
  deleted?: boolean;
}

export interface DialogueNode {
  id: string;
  characterId?: string;
  messages: DialogueMessage[];
  choices?: DialogueChoice[];
  autoNext?: string;
  requires?: NarrativeCondition[];
  onEnter?: CharacterEffect[];
  onEnterSets?: Record<string, unknown>;
  completeChapter?: boolean;
  conditionalAutoNext?: Array<{ requires: NarrativeCondition[]; nodeId: string }>;
  /** Scène immersive (bureau du Directeur) */
  sceneStage?: "ambient" | "dialogue" | "exit";
}

export interface NarrativeCondition {
  type:
    | "flag"
    | "saga_choice"
    | "character_met"
    | "character_trust"
    | "chapter_completed"
    | "chapter_not_started"
    | "character_dead"
    | "document_read"
    | "messages_ignored";
  key?: string;
  value?: unknown;
  characterId?: string;
  trust?: TrustLevel;
  chapter?: ChapterId;
  minIgnored?: number;
  op?: "eq" | "neq" | "gte" | "lte" | "exists";
}

export interface CharacterProfile {
  id: string;
  name: string;
  title: string;
  faction: string;
  avatarColor: string;
  personality: string[];
  goals: string[];
  fears: string[];
  secrets: string[];
  availableFromChapter: ChapterId;
}

export interface MessageThread {
  id: string;
  characterId: string;
  label: string;
  nodes: Record<string, DialogueNode>;
  entryNodeId: string;
  unlockRequires?: NarrativeCondition[];
  /** Délai avant première apparition du contact (après déverrouillage) */
  initialDelaySeconds?: number;
}

export interface ChapterManifest {
  id: ChapterId;
  title: string;
  subtitle: string;
  description: string;
  requiredChapters: ChapterId[];
  recommendedChapters: ChapterId[];
  uniqueApps: string[];
  mainCharacters: string[];
  estimatedHours: number;
}

export interface NarrativeContext {
  gns: GlobalNarrativeSave;
  currentChapter: ChapterId;
  threadId: string;
  nodeId: string;
  siteTime: Date;
}

export interface IncomingMessage {
  threadId: string;
  characterId: string;
  nodeId: string;
  message: DialogueMessage;
  deliverAt: number;
}

export interface ThreadState {
  threadId: string;
  characterId: string;
  currentNodeId: string;
  history: Array<DialogueMessage & { nodeId: string }>;
  unreadCount: number;
  lastReadAt: string | null;
  isTyping: boolean;
  typingUntil: number | null;
}
