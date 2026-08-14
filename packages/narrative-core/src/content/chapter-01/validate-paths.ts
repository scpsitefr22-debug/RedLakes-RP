import { createGlobalNarrativeSave } from "../../gns/create.js";
import { isThreadUnlocked } from "../../narrative/engine.js";
import type { GlobalNarrativeSave } from "../../types/gns.js";
import { CHAPTER_01_ACT4_THREADS } from "./act4.js";

const CLOSURE_THREAD = CHAPTER_01_ACT4_THREADS.find((t) => t.id === "ch1-closure")!;

type ChenFate = "saved" | "reported" | "ignored";
type BriefingConduct = "engaged" | "questioned" | "silent";
type DirectorResponse = "professional" | "curious" | "reluctant";

function buildGnsAtBriefingEnd(
  chen: ChenFate,
  conduct: BriefingConduct,
  director: DirectorResponse
): GlobalNarrativeSave {
  const unlockFlags: Record<string, boolean> = {
    ch1_left_director_office: true,
    ch1_directeur_resolved: true,
    ch1_chen_resolved: true,
    ch1_briefing_reminder_sent: true,
    ch1_briefing_attended: true,
    ch1_branch_followup_seen: true,
  };

  if (director === "professional") unlockFlags.ch1_unlock_mtf_liaison = true;
  if (director === "curious") unlockFlags.ch1_unlock_junior_researcher = true;
  if (director === "reluctant") unlockFlags.ch1_unlock_classd_handler = true;

  if (chen === "saved") unlockFlags.ch1_chen_logs_received = true;
  if (conduct === "questioned") unlockFlags.ch1_aegis_noted = true;

  return {
    ...createGlobalNarrativeSave(),
    flags: unlockFlags,
    sagaChoices: {
      ch1_dr_chen_fate: chen,
      ch1_briefing_response: director,
      ch1_briefing_conduct: conduct,
    },
  };
}

export interface Chapter01PathResult {
  chen: ChenFate;
  conduct: BriefingConduct;
  director: DirectorResponse;
  closureUnlocked: boolean;
}

/** Vérifie que chaque branche principale débloque le fil de clôture. */
export function validateChapter01ClosurePaths(): Chapter01PathResult[] {
  const chenFates: ChenFate[] = ["saved", "reported", "ignored"];
  const conducts: BriefingConduct[] = ["engaged", "questioned", "silent"];
  const directors: DirectorResponse[] = ["professional", "curious", "reluctant"];
  const results: Chapter01PathResult[] = [];

  for (const chen of chenFates) {
    for (const conduct of conducts) {
      for (const director of directors) {
        if (conduct === "questioned" && director === "reluctant") continue;

        const gns = buildGnsAtBriefingEnd(chen, conduct, director);
        results.push({
          chen,
          conduct,
          director,
          closureUnlocked: isThreadUnlocked(gns, CLOSURE_THREAD, 1),
        });
      }
    }
  }

  return results;
}

export function assertChapter01ClosurePaths(): void {
  const results = validateChapter01ClosurePaths();
  const failed = results.filter((r) => !r.closureUnlocked);
  if (failed.length > 0) {
    const detail = failed
      .map((r) => `${r.chen}/${r.conduct}/${r.director}`)
      .join(", ");
    throw new Error(`Chapitre I — fils de clôture non débloqués : ${detail}`);
  }
}

assertChapter01ClosurePaths();
