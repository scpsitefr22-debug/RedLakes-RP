import type { ChapterId } from "../types/gns.js";
import type { MessageThread } from "../types/narrative.js";
import { CHAPTER_01_ALL_THREADS } from "../content/chapter-01/threads.js";
import { CHAPTER_02_THREADS } from "../content/chapter-02/threads.js";
import { CHAPTER_03_THREADS } from "../content/chapter-03/threads.js";
import { CHAPTER_04_THREADS } from "../content/chapter-04/threads.js";
import { CHAPTER_05_THREADS } from "../content/chapter-05/threads.js";
import { CHAPTER_06_THREADS } from "../content/chapter-06/threads.js";
import { CHAPTER_07_THREADS } from "../content/chapter-07/threads.js";
import { CHAPTER_08_THREADS } from "../content/chapter-08/threads.js";
import { CHAPTER_09_THREADS } from "../content/chapter-09/threads.js";

export function getMessageThreadsForChapter(chapter: ChapterId): MessageThread[] {
  switch (chapter) {
    case 1:
      return CHAPTER_01_ALL_THREADS;
    case 2:
      return CHAPTER_02_THREADS;
    case 3:
      return CHAPTER_03_THREADS;
    case 4:
      return CHAPTER_04_THREADS;
    case 5:
      return CHAPTER_05_THREADS;
    case 6:
      return CHAPTER_06_THREADS;
    case 7:
      return CHAPTER_07_THREADS;
    case 8:
      return CHAPTER_08_THREADS;
    case 9:
      return CHAPTER_09_THREADS;
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
    case 3:
      return import("../content/chapter-03/threads.js").then((m) => m.CHAPTER_03_OFFLINE_EVENTS);
    case 4:
      return import("../content/chapter-04/threads.js").then((m) => m.CHAPTER_04_OFFLINE_EVENTS);
    case 5:
      return import("../content/chapter-05/threads.js").then((m) => m.CHAPTER_05_OFFLINE_EVENTS);
    case 6:
      return import("../content/chapter-06/threads.js").then((m) => m.CHAPTER_06_OFFLINE_EVENTS);
    case 7:
      return import("../content/chapter-07/threads.js").then((m) => m.CHAPTER_07_OFFLINE_EVENTS);
    case 8:
      return import("../content/chapter-08/threads.js").then((m) => m.CHAPTER_08_OFFLINE_EVENTS);
    case 9:
      return import("../content/chapter-09/threads.js").then((m) => m.CHAPTER_09_OFFLINE_EVENTS);
    default:
      return Promise.resolve([]);
  }
}
