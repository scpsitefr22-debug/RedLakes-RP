import type {
  DialogueChoice,
  DialogueMessage,
  DialogueNode,
  MessageThread,
  NarrativeContext,
} from "../types/narrative.js";
import { applyCharacterEffects, applyFlags, applySagaChoice, evaluateConditions } from "../narrative/conditions.js";
import { getCharacterMemory } from "../gns/create.js";
import { getMemoryGreeting } from "../world/offline-events.js";

export function getAvailableChoices(
  gns: NarrativeContext["gns"],
  node: DialogueNode,
  chapter: number
): DialogueChoice[] {
  if (!node.choices) return [];
  return node.choices.filter((c) => evaluateConditions(gns, c.requires, chapter));
}

export function resolveEntryNodeId(
  thread: MessageThread,
  gns: NarrativeContext["gns"],
  chapter: number
): string {
  const memoryNode = Object.values(thread.nodes).find(
    (n) => n.requires && evaluateConditions(gns, n.requires, chapter) && n.id.includes("remember")
  );
  if (memoryNode) return memoryNode.id;

  const greeting = thread.characterId ? getMemoryGreeting(gns, thread.characterId) : null;
  if (greeting && thread.nodes["memory_return"] && evaluateConditions(gns, thread.nodes["memory_return"].requires, chapter)) {
    return "memory_return";
  }

  return thread.entryNodeId;
}

export function applyChoice(
  ctx: NarrativeContext,
  choice: DialogueChoice
): NarrativeContext["gns"] {
  let gns = ctx.gns;
  if (choice.sagaChoice) {
    gns = applySagaChoice(gns, choice.sagaChoice.key, choice.sagaChoice.value);
  }
  gns = applyFlags(gns, choice.sets);
  if (choice.unlocks?.length) {
    const unlockFlags: Record<string, unknown> = {};
    for (const key of choice.unlocks) unlockFlags[key] = true;
    gns = applyFlags(gns, unlockFlags);
  }
  gns = applyCharacterEffects(gns, choice.characterEffects, ctx.currentChapter);
  return gns;
}

export function getNodeMessages(node: DialogueNode): DialogueNode["messages"] {
  return node.messages.filter((m) => !m.deleted);
}

export function applyNodeEnter(
  gns: NarrativeContext["gns"],
  node: DialogueNode,
  chapter: number
): NarrativeContext["gns"] {
  let next = applyFlags(gns, node.onEnterSets);
  next = applyCharacterEffects(next, node.onEnter, chapter);
  return next;
}

export function resolveAutoNext(
  node: DialogueNode,
  gns: NarrativeContext["gns"],
  chapter: number
): string | null {
  if (node.conditionalAutoNext) {
    for (const branch of node.conditionalAutoNext) {
      if (evaluateConditions(gns, branch.requires, chapter)) {
        return branch.nodeId;
      }
    }
  }
  return node.autoNext ?? null;
}

export function isThreadUnlocked(
  gns: NarrativeContext["gns"],
  thread: MessageThread,
  chapter: number
): boolean {
  return evaluateConditions(gns, thread.unlockRequires, chapter);
}

/** Délai min/max avant affichage — assez court pour rester réactif, assez long pour l'indicateur « écrit… » */
export const TYPING_DELAY_MIN_SECONDS = 0.35;
export const TYPING_DELAY_MAX_SECONDS = 1.1;

export function estimateTypingDelay(text: string, baseSeconds = 0.25): number {
  const perChar = 0.003;
  const raw = baseSeconds + text.length * perChar;
  return Math.min(TYPING_DELAY_MAX_SECONDS, Math.max(TYPING_DELAY_MIN_SECONDS, raw));
}

/** Délai réel avant livraison d'un message — compresse les delaySeconds narratifs tout en gardant l'effet frappe */
export function resolveMessageDeliveryDelay(
  message: Pick<DialogueMessage, "sender" | "text" | "delaySeconds">
): number {
  if (message.sender === "player") return 0;

  if (message.sender === "system") {
    const hint = message.delaySeconds != null ? message.delaySeconds * 0.08 : 0.2;
    return Math.min(0.55, Math.max(0.12, hint));
  }

  const fromText = estimateTypingDelay(message.text);
  const fromNarrative =
    message.delaySeconds != null ? message.delaySeconds * 0.1 : fromText;
  const delay = message.delaySeconds != null ? fromNarrative : fromText;
  return Math.min(TYPING_DELAY_MAX_SECONDS, Math.max(TYPING_DELAY_MIN_SECONDS, delay));
}

/** Enregistre la première prise de contact avec un personnage (annuaire, mémoire GNS). */
export function markCharacterMet(
  gns: NarrativeContext["gns"],
  characterId: string,
  chapter: number
): NarrativeContext["gns"] {
  if (getCharacterMemory(gns, characterId).met) return gns;
  return applyCharacterEffects(gns, [{ characterId }], chapter);
}

export function isThreadAtRest(
  node: DialogueNode | undefined,
  gns: NarrativeContext["gns"],
  chapter: number,
  state: {
    pendingMessages: unknown[];
    isTyping: boolean;
    choices: unknown[];
  }
): boolean {
  if (!node) return true;
  if (state.pendingMessages.length > 0 || state.isTyping || state.choices.length > 0) return false;
  if (resolveAutoNext(node, gns, chapter)) return false;
  if (getAvailableChoices(gns, node, chapter).length > 0) return false;
  return true;
}
