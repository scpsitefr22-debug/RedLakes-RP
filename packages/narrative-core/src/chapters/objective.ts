import type { ChapterId, GlobalNarrativeSave } from "../types/gns.js";
import { hasCompletedChapter } from "../gns/create.js";

/** Objectif courant affiché au joueur — null si rien à signaler */
export function getChapterObjective(
  gns: GlobalNarrativeSave,
  chapter: ChapterId
): string | null {
  if (hasCompletedChapter(gns, chapter)) return null;

  if (chapter === 1) {
    if (!gns.flags.ch1_left_director_office) {
      return "Acte I — Terminez l'entretien avec le Directeur du Site.";
    }
    if (!gns.flags.ch1_directeur_resolved) {
      return "Acte I — Répondez au Directeur avant de quitter son bureau.";
    }
    if (!gns.flags.ch1_chen_resolved) {
      return "Acte II — Dr. Chen vous a contacté. C'est le choix le plus important de la semaine.";
    }
    if (!gns.flags.ch1_briefing_reminder_sent) {
      return "Acte III — Explorez le terminal (CASSIE, rapports, personnel). La convocation RH arrive bientôt.";
    }
    if (!gns.flags.ch1_briefing_attended) {
      return "Acte IV — Briefing obligatoire : ouvrez le fil « Salle B » sur la messagerie.";
    }
    if (!gns.flags.ch1_complete) {
      if (!gns.flags.ch1_branch_followup_seen) {
        return "Acte IV — Consultez le message de suivi (Chen / Sécurité / RH) avant la clôture.";
      }
      return "Acte IV — Ouvrez le message RH « Fin de période » pour terminer l'intégration.";
    }
    return null;
  }

  return null;
}
