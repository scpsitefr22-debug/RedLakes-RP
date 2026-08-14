import type { ChapterId } from "../types/gns.js";
import type { MessageThread } from "../types/narrative.js";
import { CHAPTER_01_ALL_THREADS } from "../content/chapter-01/threads.js";
import { CHAPTER_02_THREADS } from "../content/chapter-02/threads.js";

export function getMessageThreadsForChapter(chapter: ChapterId): MessageThread[] {
  switch (chapter) {
    case 1:
      return CHAPTER_01_ALL_THREADS;
    case 2:
      return CHAPTER_02_THREADS;
    default:
      return [];
  }
}

export function getOfflineEventsForChapter(chapter: ChapterId) {
  switch (chapter) {
    case 1:
      return import("../content/chapter-01/threads.js").then((m) => m.CHAPTER_01_OFFLINE_EVENTS);
    case 2:
      return import("../content/chapter-02/threads.js").then((m) => m.CHAPTER_02_OFFLINE_EVENTS);
    default:
      return Promise.resolve([]);
  }
}
