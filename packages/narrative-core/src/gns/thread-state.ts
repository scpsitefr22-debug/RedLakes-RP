import type { ChapterId, GlobalNarrativeSave, PersistedThreadMessage, PersistedThreadState } from "../types/gns.js";
import type { DialogueNode, MessageThread } from "../types/narrative.js";
import { getAvailableChoices, getNodeMessages } from "../narrative/engine.js";
import { touchGNS } from "./create.js";

export function getChapterThreads(
  gns: GlobalNarrativeSave,
  chapter: ChapterId
): Record<string, PersistedThreadState> {
  return gns.chapterProgress[chapter]?.threads ?? {};
}

export function saveChapterThread(
  gns: GlobalNarrativeSave,
  chapter: ChapterId,
  state: PersistedThreadState
): GlobalNarrativeSave {
  const progress = { ...gns.chapterProgress };
  const chapterState = progress[chapter] ?? {
    currentNodeId: null,
    completed: false,
    startedAt: new Date().toISOString(),
    threads: {},
  };

  progress[chapter] = {
    ...chapterState,
    threads: {
      ...chapterState.threads,
      [state.threadId]: state,
    },
  };

  return touchGNS({ ...gns, chapterProgress: progress });
}

export function getQueuedMessageThreads(gns: GlobalNarrativeSave): Array<{ threadId: string; nodeId: string }> {
  return Object.entries(gns.flags)
    .filter(([key]) => key.startsWith("queued_message:"))
    .map(([key, nodeId]) => ({
      threadId: key.replace("queued_message:", ""),
      nodeId: String(nodeId),
    }));
}

export function clearQueuedMessage(
  gns: GlobalNarrativeSave,
  threadId: string
): GlobalNarrativeSave {
  const flags = { ...gns.flags };
  delete flags[`queued_message:${threadId}`];
  return touchGNS({ ...gns, flags });
}

export function markEmailsRead(gns: GlobalNarrativeSave, emailId: string): GlobalNarrativeSave {
  const read = gns.flags.emails_read;
  const list = Array.isArray(read) ? [...read] : [];
  if (list.includes(emailId)) return gns;
  return touchGNS({
    ...gns,
    flags: { ...gns.flags, emails_read: [...list, emailId] },
  });
}

export function isEmailRead(gns: GlobalNarrativeSave, emailId: string): boolean {
  const read = gns.flags.emails_read;
  return Array.isArray(read) && read.includes(emailId);
}

export function threadStateToPersisted(
  state: {
    threadId: string;
    currentNodeId: string;
    history: PersistedThreadMessage[];
    started: boolean;
    choices: unknown[];
    pendingMessages: unknown[];
    isTyping: boolean;
  },
  complete = false
): PersistedThreadState {
  return {
    threadId: state.threadId,
    currentNodeId: state.currentNodeId,
    history: state.history,
    started: state.started,
    complete,
    awaitingChoices: state.choices.length > 0 && state.pendingMessages.length === 0 && !state.isTyping,
  };
}

export function getUndeliveredNodeMessages(
  node: DialogueNode,
  history: PersistedThreadMessage[]
) {
  const delivered = new Set(history.map((m) => m.id));
  return getNodeMessages(node).filter((m) => !delivered.has(m.id));
}

export function hydrateThreadStatesFromGNS(
  gns: GlobalNarrativeSave,
  chapter: ChapterId,
  threads: MessageThread[]
): Record<string, PersistedThreadState & { characterId: string }> {
  const saved = getChapterThreads(gns, chapter);
  const result: Record<string, PersistedThreadState & { characterId: string }> = {};

  for (const [threadId, persisted] of Object.entries(saved)) {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread || !persisted.started) continue;
    result[threadId] = { ...persisted, characterId: thread.characterId };
  }

  return result;
}

export interface RestoredThreadUIState {
  threadId: string;
  characterId: string;
  currentNodeId: string;
  history: PersistedThreadMessage[];
  pendingMessages: ReturnType<typeof getUndeliveredNodeMessages>;
  choices: ReturnType<typeof getAvailableChoices>;
  isTyping: boolean;
  unread: number;
  started: boolean;
  nodeEnterApplied: boolean;
}

export function restoreThreadUIState(
  persisted: PersistedThreadState,
  thread: MessageThread,
  gns: GlobalNarrativeSave,
  chapter: ChapterId
): RestoredThreadUIState {
  const node = thread.nodes[persisted.currentNodeId];
  const pendingMessages = node ? getUndeliveredNodeMessages(node, persisted.history) : [];
  const choices =
    node && pendingMessages.length === 0 ? getAvailableChoices(gns, node, chapter) : [];

  return {
    threadId: persisted.threadId,
    characterId: thread.characterId,
    currentNodeId: persisted.currentNodeId,
    history: [...persisted.history],
    pendingMessages,
    choices,
    isTyping: false,
    unread: 0,
    started: persisted.started,
    nodeEnterApplied: true,
  };
}
