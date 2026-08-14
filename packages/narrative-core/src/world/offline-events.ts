import type { GlobalNarrativeSave, ScheduledWorldEvent } from "../types/gns.js";
import { getCharacterMemory, touchGNS } from "../gns/create.js";
import { evaluateConditions } from "../narrative/conditions.js";

export function processOfflineEvents(
  gns: GlobalNarrativeSave,
  elapsedSeconds: number,
  currentChapter: number
): { gns: GlobalNarrativeSave; triggered: ScheduledWorldEvent[] } {
  if (elapsedSeconds <= 0 || !gns.pendingWorldEvents.length) {
    return { gns, triggered: [] };
  }

  let next = { ...gns };
  const triggered: ScheduledWorldEvent[] = [];
  const remaining: ScheduledWorldEvent[] = [];

  for (const event of gns.pendingWorldEvents) {
    if (next.processedEventIds.includes(event.id)) continue;

    const ready = event.triggerAfterSeconds <= elapsedSeconds;
    const flagsOk = evaluateConditions(
      next,
      [
        ...(event.requiresFlags?.map((f) => ({ type: "flag" as const, key: f, op: "exists" as const })) ?? []),
        ...(event.excludesFlags?.map((f) => ({ type: "flag" as const, key: f, op: "neq" as const, value: true })) ??
          []),
      ],
      currentChapter
    );
    const chapterOk = !event.chapterMin || next.session.chaptersCompleted.includes(event.chapterMin);

    if (ready && flagsOk && chapterOk) {
      next = applyWorldEvent(next, event);
      triggered.push(event);
      next.processedEventIds = [...next.processedEventIds, event.id];
    } else if (!ready) {
      remaining.push({
        ...event,
        triggerAfterSeconds: event.triggerAfterSeconds - elapsedSeconds,
      });
    } else {
      remaining.push(event);
    }
  }

  return {
    gns: touchGNS({ ...next, pendingWorldEvents: remaining }),
    triggered,
  };
}

function applyWorldEvent(gns: GlobalNarrativeSave, event: ScheduledWorldEvent): GlobalNarrativeSave {
  const effect = event.effect;
  switch (effect.type) {
    case "character_death":
      if (gns.world.deadCharacters.includes(effect.characterId)) return gns;
      return {
        ...gns,
        world: {
          ...gns.world,
          deadCharacters: [...gns.world.deadCharacters, effect.characterId],
        },
      };
    case "character_promotion":
      return {
        ...gns,
        world: {
          ...gns.world,
          promotedCharacters: {
            ...gns.world.promotedCharacters,
            [effect.characterId]: effect.newTitle,
          },
        },
      };
    case "set_flag":
      return { ...gns, flags: { ...gns.flags, [effect.flag]: effect.value } };
    case "site_status":
      return { ...gns, world: { ...gns.world, siteStatus: effect.status } };
    case "unlock_app":
      if (gns.world.unlockedApps.includes(effect.appId)) return gns;
      return {
        ...gns,
        world: {
          ...gns.world,
          unlockedApps: [...gns.world.unlockedApps, effect.appId],
        },
      };
    case "queue_message":
      return {
        ...gns,
        flags: {
          ...gns.flags,
          [`queued_message:${effect.threadId}`]: effect.nodeId,
        },
      };
    default:
      return gns;
  }
}

export function scheduleWorldEvent(gns: GlobalNarrativeSave, event: ScheduledWorldEvent): GlobalNarrativeSave {
  if (gns.processedEventIds.includes(event.id)) return gns;
  if (gns.pendingWorldEvents.some((e) => e.id === event.id)) return gns;
  return touchGNS({
    ...gns,
    pendingWorldEvents: [...gns.pendingWorldEvents, event],
  });
}

export function endSession(gns: GlobalNarrativeSave, playTimeDeltaSeconds: number): GlobalNarrativeSave {
  return touchGNS({
    ...gns,
    session: {
      ...gns.session,
      lastSessionEnd: new Date().toISOString(),
      playTimeSeconds: gns.session.playTimeSeconds + playTimeDeltaSeconds,
    },
  });
}

export function getElapsedSecondsSinceLastSession(gns: GlobalNarrativeSave): number {
  if (!gns.session.lastSessionEnd) return 0;
  const last = new Date(gns.session.lastSessionEnd).getTime();
  return Math.max(0, Math.floor((Date.now() - last) / 1000));
}

export function getMemoryGreeting(gns: GlobalNarrativeSave, characterId: string): string | null {
  const mem = getCharacterMemory(gns, characterId);
  if (!mem.met) return null;

  const notes = mem.relationshipNotes;
  if (notes.includes("saved_in_ch1")) return "Vous m'avez sauvé. Je n'oublie pas.";
  if (notes.includes("abandoned_moretti")) return "Vous avez abandonné Moretti. Je m'en souviens.";
  if (mem.liesDetected.length > 0) return "Vous avez déjà menti.";
  if (mem.messagesIgnored >= 3) return "Vous ne répondez jamais.";
  if (mem.trust === "loyal") return "Je vous connais. On peut se parler franchement.";
  if (mem.trust === "hostile") return "Je n'ai rien à vous dire.";

  return mem.met ? "On s'est déjà parlé." : null;
}
