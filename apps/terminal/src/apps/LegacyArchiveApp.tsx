import { getPlayerDisplayName } from "@redlakes/narrative-core";
import { Archive } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

interface LegacyEntry {
  chapter: string;
  key: string;
  labels: Record<string, string>;
}

const LEGACY_ENTRIES: LegacyEntry[] = [
  {
    chapter: "Chapitre I — Intégration",
    key: "ch1_dr_chen_fate",
    labels: {
      saved: "Vous avez sauvé Dr. Chen.",
      reported: "Vous avez signalé Dr. Chen.",
      ignored: "Vous avez ignoré Dr. Chen.",
    },
  },
  {
    chapter: "Chapitre II — Protocoles",
    key: "ch2_protocol_breach_response",
    labels: {
      escalate_nu7: "Vous avez remonté l'anomalie directement à Nu-7.",
      warn_chen: "Vous avez laissé Chen vérifier avant de signaler.",
      bury_it: "Vous avez agi seul, sans autorisation.",
    },
  },
  {
    chapter: "Chapitre III — Surface",
    key: "ch3_moretti_deal",
    labels: {
      accepted: "Vous avez conclu un accord avec Vincent Moretti.",
      refused: "Vous avez refusé l'offre de Moretti.",
      reported: "Vous avez signalé le contact de Moretti.",
    },
  },
  {
    chapter: "Chapitre IV — Égouts",
    key: "ch4_serpent_encounter",
    labels: {
      seize: "Vous avez saisi l'artefact par la force.",
      negotiate: "Vous avez négocié avec la Main du Serpent.",
      retreat: "Vous avez reculé sans intervenir.",
    },
  },
  {
    chapter: "Chapitre V — Audit",
    key: "ch5_aegis_cooperation",
    labels: {
      full_disclosure: "Vous avez tout révélé à l'Inspecteur AEGIS.",
      foundation_line: "Vous avez protégé la ligne officielle de la Fondation.",
      selective: "Vous avez coopéré de façon sélective.",
    },
  },
  {
    chapter: "Chapitre VI — Silence",
    key: "ch6_silence_response",
    labels: {
      dig_deeper: "Vous avez cherché la vérité sur la disparition d'Amir Hassan.",
      let_it_go: "Vous avez laissé filer l'affaire Hassan.",
      confront_directeur: "Vous avez confronté le Directeur.",
    },
  },
  {
    chapter: "Chapitre VII — Brèche",
    key: "ch7_breach_response",
    labels: {
      assist_nu7: "Vous avez rejoint Nu-7 en salle de contrôle.",
      evacuate_civilians: "Vous avez évacué le personnel et les Class-D.",
      shelter: "Vous avez suivi le protocole de confinement standard.",
    },
  },
  {
    chapter: "Chapitre VIII — Corruption",
    key: "ch8_cassie_response",
    labels: {
      shutdown: "Vous avez recommandé l'isolement de CASSIE.",
      investigate: "Vous avez enquêté aux côtés de CASSIE.",
      trust_cassie: "Vous avez fait confiance à CASSIE.",
    },
  },
  {
    chapter: "Chapitre IX — Héritage",
    key: "ch9_legacy_choice",
    labels: {
      reveal_everything: "Vous avez tout révélé à A.E.G.I.S.",
      protect_the_site: "Vous avez choisi de protéger le Site, en silence.",
      walk_away: "Vous avez demandé votre réaffectation.",
    },
  },
];

export function LegacyArchiveApp() {
  const { gns } = useGNSRequired();
  const playerName = getPlayerDisplayName(gns);
  const completed = gns.session.chaptersCompleted.length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-dashboard-border px-4 py-2">
        <Archive className="h-4 w-4 text-dashboard-accent" />
        <span className="text-[10px] uppercase tracking-wider text-metal">
          Archives héritées — Dossier {gns.player.employeeId ?? "—"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 border border-dashboard-border bg-[#0a1018] p-3 text-[10px]">
          <p className="text-xs text-foreground">{playerName}</p>
          <p className="mt-1 text-metal">
            {completed} chapitre{completed > 1 ? "s" : ""} terminé{completed > 1 ? "s" : ""} sur 9.
          </p>
        </div>

        <div className="space-y-2">
          {LEGACY_ENTRIES.map((entry) => {
            const value = gns.sagaChoices[entry.key];
            const label = typeof value === "string" ? entry.labels[value] : null;
            return (
              <div key={entry.key} className="border border-dashboard-border/70 bg-[#0a1018] p-2.5">
                <p className="text-[9px] uppercase tracking-wider text-metal/70">{entry.chapter}</p>
                <p className="mt-1 text-[11px] text-foreground/90">
                  {label ?? "Non résolu — chapitre non joué ou choix absent."}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
