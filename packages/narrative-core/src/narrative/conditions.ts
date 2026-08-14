import type { CharacterEffect, NarrativeCondition } from "../types/narrative.js";
import type { GlobalNarrativeSave, TrustLevel } from "../types/gns.js";
import { getCharacterMemory, touchGNS } from "../gns/create.js";

const TRUST_ORDER: TrustLevel[] = ["hostile", "wary", "neutral", "warm", "loyal"];

function adjustTrust(current: TrustLevel, delta: number): TrustLevel {
  const idx = TRUST_ORDER.indexOf(current);
  const next = Math.max(0, Math.min(TRUST_ORDER.length - 1, idx + delta));
  return TRUST_ORDER[next];
}

export function evaluateConditions(
  gns: GlobalNarrativeSave,
  conditions: NarrativeCondition[] | undefined,
  currentChapter: number
): boolean {
  if (!conditions?.length) return true;

  return conditions.every((cond) => {
    switch (cond.type) {
      case "flag": {
        const val = gns.flags[cond.key ?? ""];
        if (cond.op === "exists") return val !== undefined;
        if (cond.op === "neq") return val !== cond.value;
        return val === cond.value;
      }
      case "saga_choice": {
        const val = gns.sagaChoices[cond.key ?? ""];
        if (cond.op === "exists") return val !== undefined;
        if (cond.op === "neq") return val !== cond.value;
        return val === cond.value;
      }
      case "character_met": {
        const mem = gns.characterMemory[cond.characterId ?? ""];
        return cond.value === false ? !mem?.met : !!mem?.met;
      }
      case "character_trust": {
        const mem = gns.characterMemory[cond.characterId ?? ""];
        if (!mem || !cond.trust) return false;
        return TRUST_ORDER.indexOf(mem.trust) >= TRUST_ORDER.indexOf(cond.trust);
      }
      case "chapter_completed":
        return gns.session.chaptersCompleted.includes(cond.chapter ?? (1 as never));
      case "chapter_not_started":
        return !gns.session.chaptersStarted.includes(cond.chapter ?? (currentChapter as never));
      case "character_dead":
        return gns.world.deadCharacters.includes(cond.characterId ?? "");
      case "document_read":
        return gns.world.documentsRead.includes(cond.key ?? "");
      case "messages_ignored": {
        const mem = gns.characterMemory[cond.characterId ?? ""];
        return (mem?.messagesIgnored ?? 0) >= (cond.minIgnored ?? 1);
      }
      default:
        return true;
    }
  });
}

export function applyCharacterEffects(
  gns: GlobalNarrativeSave,
  effects: CharacterEffect[] | undefined,
  chapter: number
): GlobalNarrativeSave {
  if (!effects?.length) return gns;

  let next = { ...gns, characterMemory: { ...gns.characterMemory } };

  for (const effect of effects) {
    const mem = { ...getCharacterMemory(next, effect.characterId) };
    mem.met = true;
    mem.metInChapter = mem.metInChapter ?? (chapter as never);
    mem.lastContactChapter = chapter as never;

    if (effect.trustDelta) {
      mem.trust = adjustTrust(mem.trust, effect.trustDelta);
    }
    if (effect.addFact) mem.knownFacts = [...new Set([...mem.knownFacts, effect.addFact])];
    if (effect.addNote) mem.relationshipNotes = [...new Set([...mem.relationshipNotes, effect.addNote])];
    if (effect.addPromise) mem.unresolvedPromises = [...mem.unresolvedPromises, effect.addPromise];
    if (effect.resolvePromise) {
      mem.unresolvedPromises = mem.unresolvedPromises.filter((p: string) => p !== effect.resolvePromise);
    }

    next.characterMemory[effect.characterId] = mem;
  }

  return touchGNS(next);
}

export function applySagaChoice(
  gns: GlobalNarrativeSave,
  key: string,
  value: unknown
): GlobalNarrativeSave {
  return touchGNS({
    ...gns,
    sagaChoices: { ...gns.sagaChoices, [key]: value },
  });
}

export function applyFlags(gns: GlobalNarrativeSave, sets: Record<string, unknown> | undefined): GlobalNarrativeSave {
  if (!sets) return gns;
  return touchGNS({
    ...gns,
    flags: { ...gns.flags, ...sets },
  });
}

export function recordDocumentRead(gns: GlobalNarrativeSave, documentId: string): GlobalNarrativeSave {
  if (gns.world.documentsRead.includes(documentId)) return gns;
  return touchGNS({
    ...gns,
    world: {
      ...gns.world,
      documentsRead: [...gns.world.documentsRead, documentId],
    },
  });
}

export function incrementMessagesIgnored(gns: GlobalNarrativeSave, characterId: string): GlobalNarrativeSave {
  const mem = { ...getCharacterMemory(gns, characterId) };
  mem.messagesIgnored += 1;
  return touchGNS({
    ...gns,
    characterMemory: { ...gns.characterMemory, [characterId]: mem },
  });
}
