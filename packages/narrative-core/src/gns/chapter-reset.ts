import { CHARACTERS } from "../content/characters.js";
import { CHAPTER_01_OFFLINE_EVENTS } from "../content/chapter-01/threads.js";
import { getAllTerminalDocuments } from "../content/documents.js";
import type { ChapterId, GlobalNarrativeSave } from "../types/gns.js";
import { createEmptyCharacterMemory, touchGNS } from "./create.js";

function chapterFlagPrefix(chapter: ChapterId): string {
  return `ch${chapter}_`;
}

function getChapterCharacterIds(chapter: ChapterId): string[] {
  return Object.values(CHARACTERS)
    .filter((c) => c.availableFromChapter <= chapter)
    .map((c) => c.id);
}

function getChapterDocumentIds(chapter: ChapterId): Set<string> {
  const prefix = chapterFlagPrefix(chapter);
  const ids = getAllTerminalDocuments()
    .filter((doc) => {
      const flag = doc.unlockRequires?.flag;
      return typeof flag === "string" && flag.startsWith(prefix);
    })
    .map((doc) => doc.id);
  return new Set(ids);
}

/** Remet à zéro la progression d'un chapitre tout en conservant le profil joueur et les autres chapitres. */
export function resetChapterForReplay(
  gns: GlobalNarrativeSave,
  chapter: ChapterId
): GlobalNarrativeSave {
  const prefix = chapterFlagPrefix(chapter);

  const flags = { ...gns.flags };
  for (const key of Object.keys(flags)) {
    if (key.startsWith(prefix)) delete flags[key];
  }
  if (chapter === 1) {
    delete flags.cassie_queried_incidents;
    delete flags.emails_read;
  }

  const sagaChoices = { ...gns.sagaChoices };
  for (const key of Object.keys(sagaChoices)) {
    if (key.startsWith(prefix)) delete sagaChoices[key];
  }

  const chapterProgress = { ...gns.chapterProgress };
  delete chapterProgress[chapter];

  const chaptersCompleted = gns.session.chaptersCompleted.filter((c) => c !== chapter);
  const chaptersStarted = gns.session.chaptersStarted.filter((c) => c !== chapter);

  const characterMemory = { ...gns.characterMemory };
  for (const id of getChapterCharacterIds(chapter)) {
    characterMemory[id] = createEmptyCharacterMemory();
  }

  const clearDocIds = getChapterDocumentIds(chapter);
  const documentsRead = gns.world.documentsRead.filter((id) => !clearDocIds.has(id));

  const pendingWorldEvents =
    chapter === 1
      ? [...CHAPTER_01_OFFLINE_EVENTS]
      : gns.pendingWorldEvents.filter((ev) => ev.chapterMin == null || ev.chapterMin > chapter);
  const processedEventIds = gns.processedEventIds.filter(
    (id) => !id.startsWith(`ch${chapter}-`)
  );

  return touchGNS({
    ...gns,
    flags,
    sagaChoices,
    chapterProgress,
    characterMemory,
    pendingWorldEvents,
    processedEventIds,
    session: {
      ...gns.session,
      chaptersCompleted,
      chaptersStarted,
      lastPlayedChapter:
        chaptersCompleted.length > 0 ? chaptersCompleted[chaptersCompleted.length - 1]! : null,
    },
    world: {
      ...gns.world,
      documentsRead,
    },
  });
}

export function hasChapterProgress(gns: GlobalNarrativeSave, chapter: ChapterId): boolean {
  if (gns.session.chaptersStarted.includes(chapter)) return true;
  if (gns.session.chaptersCompleted.includes(chapter)) return true;
  const prefix = chapterFlagPrefix(chapter);
  if (Object.keys(gns.flags).some((k) => k.startsWith(prefix))) return true;
  if (Object.keys(gns.sagaChoices).some((k) => k.startsWith(prefix))) return true;
  const threads = gns.chapterProgress[chapter]?.threads;
  return Boolean(threads && Object.keys(threads).length > 0);
}
