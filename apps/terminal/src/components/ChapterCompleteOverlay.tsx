import { motion } from "framer-motion";
import type { GlobalNarrativeSave } from "@redlakes/narrative-core";

interface ChapterCompleteOverlayProps {
  gns: GlobalNarrativeSave;
  chapterTitle: string;
  onContinue: () => void;
}

const DIRECTOR_LABELS: Record<string, string> = {
  professional: "Réponse professionnelle au Directeur",
  curious: "Curiosité face au Directeur",
  reluctant: "Réticence face au Directeur",
};

const CHEN_LABELS: Record<string, string> = {
  saved: "Vous avez protégé Dr. Chen — elle s'en souviendra.",
  reported: "Vous avez signalé Chen — la sécurité a pris note.",
  ignored: "Vous avez ignoré Chen — le Site a enregistré votre passivité.",
};

const CONDUCT_LABELS: Record<string, string> = {
  engaged: "Briefing : vous vous êtes engagé.",
  questioned: "Briefing : question sur les Class-D — AEGIS noté.",
  silent: "Briefing : silence stratégique.",
};

function getEpilogueLine(gns: GlobalNarrativeSave): string {
  const chen = gns.sagaChoices["ch1_dr_chen_fate"];
  if (typeof chen === "string" && CHEN_LABELS[chen]) return CHEN_LABELS[chen];
  return "Votre première semaine au Site-12 est archivée.";
}

export function ChapterCompleteOverlay({ gns, chapterTitle, onContinue }: ChapterCompleteOverlayProps) {
  const director = gns.sagaChoices["ch1_briefing_response"];
  const conduct = gns.sagaChoices["ch1_briefing_conduct"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-6"
    >
      <div className="max-w-md border border-panel-border bg-panel p-8">
        <p className="text-[10px] uppercase tracking-widest text-terminal">Transmission archivée</p>
        <h2 className="mt-2 text-lg text-foreground">{chapterTitle}</h2>
        <p className="mt-1 text-xs text-redlake/80">Intégration — terminée</p>

        <p className="mt-6 text-sm leading-relaxed text-foreground/90">{getEpilogueLine(gns)}</p>

        <div className="mt-6 space-y-2 border border-panel-border bg-classified p-3 text-[10px] text-metal">
          <p className="uppercase tracking-wider text-metal/80">Dossier semaine 1</p>
          {typeof director === "string" && (
            <p>{DIRECTOR_LABELS[director] ?? `Directeur : ${director}`}</p>
          )}
          {typeof conduct === "string" && (
            <p>{CONDUCT_LABELS[conduct] ?? `Briefing : ${conduct}`}</p>
          )}
          {Boolean(gns.flags.ch1_chen_logs_received) && (
            <p className="text-amber-200/90">Logs Euclid-7 en votre possession.</p>
          )}
          {Boolean(gns.flags.ch1_security_review) && (
            <p className="text-amber-200/90">Convocation sécurité planifiée.</p>
          )}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-8 w-full border border-redlake/50 bg-redlake/10 py-2.5 text-xs text-foreground transition-colors hover:bg-redlake/20"
        >
          Retour au sélecteur de chapitres
        </button>
      </div>
    </motion.div>
  );
}
