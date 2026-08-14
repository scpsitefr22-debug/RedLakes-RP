import { markChapterStarted, setPlayerProfile } from "../../gns/create.js";
import { applyChoice, isThreadUnlocked, resolveAutoNext } from "../../narrative/engine.js";
import type { GlobalNarrativeSave } from "../../types/gns.js";
import { CHAPTER_01_ACT4_THREADS } from "./act4.js";
import { CHAPTER_01_THREADS } from "./threads.js";

type ChenFate = "saved" | "reported" | "ignored";

const CHEN_THREAD = CHAPTER_01_THREADS.find((t) => t.id === "dr-chen-anomaly")!;
const DISTRESS = CHEN_THREAD.nodes.distress;
const CHEN_CHOICE_ID: Record<ChenFate, string> = {
  saved: "help",
  reported: "report",
  ignored: "ignore",
};

const FOLLOWUP_THREADS: Record<ChenFate, string> = {
  saved: "dr-chen-briefing",
  reported: "securite-convocation",
  ignored: "chen-ignored-fallout",
};

const EPILOGUE_NODE: Record<ChenFate, string> = {
  saved: "closure_epilogue",
  reported: "closure_epilogue_reported",
  ignored: "closure_epilogue_ignored",
};

function applyDirectorOffice(gns: GlobalNarrativeSave): GlobalNarrativeSave {
  let next = setPlayerProfile(gns, "Test Joueur");
  next = markChapterStarted(next, 1);
  return {
    ...next,
    flags: {
      ...next.flags,
      ch1_left_director_office: true,
      ch1_directeur_resolved: true,
      ch1_unlock_mtf_liaison: true,
    },
    sagaChoices: { ...next.sagaChoices, ch1_briefing_response: "professional" },
  };
}

function applyChenChoice(gns: GlobalNarrativeSave, fate: ChenFate): GlobalNarrativeSave {
  const choice = DISTRESS.choices!.find((c) => c.id === CHEN_CHOICE_ID[fate])!;
  return applyChoice(
    {
      gns,
      currentChapter: 1,
      threadId: "dr-chen-anomaly",
      nodeId: "distress",
      siteTime: new Date(),
    },
    choice
  );
}

function applyBriefingComplete(gns: GlobalNarrativeSave): GlobalNarrativeSave {
  const fate = gns.sagaChoices.ch1_dr_chen_fate as ChenFate | undefined;
  return {
    ...gns,
    flags: {
      ...gns.flags,
      ch1_briefing_reminder_sent: true,
      ch1_briefing_attended: true,
      ch1_branch_followup_seen: true,
      ...(fate === "reported" ? { ch1_security_review: true } : {}),
    },
    sagaChoices: { ...gns.sagaChoices, ch1_briefing_conduct: "engaged" },
  };
}

export interface ChenPathResult {
  fate: ChenFate;
  chenResolved: boolean;
  sagaChoice: unknown;
  followUpUnlocked: boolean;
  closureUnlocked: boolean;
  epilogueNode: string | null;
  hasCompleteChapter: boolean;
}

export function validateChapter01ChenPaths(): ChenPathResult[] {
  const fates: ChenFate[] = ["saved", "reported", "ignored"];
  const closureThread = CHAPTER_01_ACT4_THREADS.find((t) => t.id === "ch1-closure")!;
  const closureNode = closureThread.nodes.closure;

  return fates.map((fate) => {
    let gns = applyDirectorOffice(createBase());
    gns = applyChenChoice(gns, fate);
    gns = applyBriefingComplete(gns);

    const followUpId = FOLLOWUP_THREADS[fate];
    const followUpThread = CHAPTER_01_ACT4_THREADS.find((t) => t.id === followUpId);
    const followUpUnlocked = followUpThread
      ? isThreadUnlocked(gns, followUpThread, 1)
      : true;

    const epilogueNode = resolveAutoNext(closureNode, gns, 1);
    const finalNode = closureThread.nodes.closure_final;

    return {
      fate,
      chenResolved: Boolean(gns.flags.ch1_chen_resolved),
      sagaChoice: gns.sagaChoices.ch1_dr_chen_fate,
      followUpUnlocked,
      closureUnlocked: isThreadUnlocked(gns, closureThread, 1),
      epilogueNode,
      hasCompleteChapter: Boolean(finalNode.completeChapter),
    };
  });
}

function createBase(): GlobalNarrativeSave {
  return setPlayerProfile(
      {
        schemaVersion: 2,
        saveId: "test",
        createdAt: "",
        updatedAt: "",
        player: { displayName: "", role: "recrue", employeeId: null, registeredAt: null },
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
      },
      "Test"
    );
}

export function assertChapter01ChenPaths(): void {
  const results = validateChapter01ChenPaths();
  const failures: string[] = [];

  for (const r of results) {
    if (!r.chenResolved) failures.push(`${r.fate}: ch1_chen_resolved manquant`);
    if (r.sagaChoice !== r.fate) failures.push(`${r.fate}: sagaChoice incorrect`);
    if (!r.followUpUnlocked) failures.push(`${r.fate}: fil suivi non débloqué`);
    if (!r.closureUnlocked) failures.push(`${r.fate}: clôture non débloquée`);
    if (r.epilogueNode !== EPILOGUE_NODE[r.fate]) {
      failures.push(`${r.fate}: épilogue ${r.epilogueNode} au lieu de ${EPILOGUE_NODE[r.fate]}`);
    }
    if (!r.hasCompleteChapter) failures.push(`${r.fate}: completeChapter absent`);
  }

  if (failures.length > 0) {
    throw new Error(`Branches Chen Ch. I — échecs:\n${failures.join("\n")}`);
  }
}

assertChapter01ChenPaths();
