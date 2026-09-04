import type { MessageThread } from "../../types/narrative.js";

/**
 * Chapitre II — Protocoles
 * Acte I : exercice de confinement Nu-7 (briefing)
 * Acte II : pivot — quelqu'un altère les seuils d'alerte du secteur Euclid-7 (écho du Ch.I)
 * Acte III : enquête / exploration libre
 * Acte IV : exercice, branches, clôture
 */

export const CHAPTER_02_THREADS: MessageThread[] = [
  // ---- Acte I ----
  {
    id: "nu7-intro",
    characterId: "commandant-nu7",
    label: "Commandant Vance — Nu-7",
    entryNodeId: "intro",
    nodes: {
      intro: {
        id: "intro",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "n1",
            sender: "character",
            text: "{player_name}. On m'a dit que vous aviez survécu à la première semaine. Pas mal.",
            delaySeconds: 5,
          },
          {
            id: "n2",
            sender: "character",
            text: "Commandant Vance, FIM Nu-7. À partir d'aujourd'hui, vous allez voir ce que « protocole » veut vraiment dire.",
            delaySeconds: 4,
          },
        ],
        conditionalAutoNext: [
          {
            requires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", value: "saved" }],
            nodeId: "ch1_callback",
          },
          {
            requires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", value: "reported" }],
            nodeId: "ch1_callback_reported",
          },
        ],
        autoNext: "briefing",
      },
      ch1_callback: {
        id: "ch1_callback",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "n-saved",
            sender: "character",
            text: "Chen m'a parlé de vous. Elle dit que vous savez garder un secret. Nu-7 apprécie.",
            delaySeconds: 3,
          },
        ],
        autoNext: "briefing",
      },
      ch1_callback_reported: {
        id: "ch1_callback_reported",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "n-reported",
            sender: "character",
            text: "Vous avez signalé Chen. Protocole respecté. Mais Nu-7 n'oublie pas qui brûle ses contacts.",
            delaySeconds: 4,
          },
        ],
        autoNext: "briefing",
      },
      briefing: {
        id: "briefing",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "n3",
            sender: "character",
            text: "Exercice de confinement demain 06h00. Secteur Euclid. Présence obligatoire.",
            delaySeconds: 3,
          },
          {
            id: "n4",
            sender: "character",
            text: "Quand Nu-7 déploie, c'est qu'il n'y a plus d'autre option. Souvenez-vous-en.",
            delaySeconds: 4,
          },
        ],
        choices: [
          {
            id: "ready",
            label: "Je serai prêt.",
            sagaChoice: { key: "ch2_nu7_response", value: "ready" },
            characterEffects: [{ characterId: "commandant-nu7", trustDelta: 1 }],
            nextNodeId: "ready_reply",
          },
          {
            id: "ask",
            label: "Quel est le niveau de menace ?",
            sagaChoice: { key: "ch2_nu7_response", value: "curious" },
            nextNodeId: "ask_reply",
          },
        ],
      },
      ready_reply: {
        id: "ready_reply",
        characterId: "commandant-nu7",
        messages: [
          { id: "n5", sender: "character", text: "Bien. Ne me faites pas regretter.", delaySeconds: 5 },
        ],
        onEnterSets: { ch2_nu7_briefing_done: true },
      },
      ask_reply: {
        id: "ask_reply",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "n6",
            sender: "character",
            text: "Suffisant pour que je vous contacte. Le reste est classifié.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch2_nu7_briefing_done: true },
      },
    },
  },

  // ---- Acte II — pivot ----
  {
    id: "chen-ch2",
    characterId: "dr-chen",
    label: "Dr. Chen — Alerte",
    unlockRequires: [{ type: "flag", key: "ch2_nu7_briefing_done", value: true }],
    initialDelaySeconds: 10,
    entryNodeId: "followup",
    nodes: {
      followup: {
        id: "followup",
        characterId: "dr-chen",
        messages: [
          {
            id: "c2-1",
            sender: "character",
            text: "Les seuils d'alerte Euclid-7 ont encore bougé. Cette fois ce n'est pas une dérive — quelqu'un a rentré les valeurs à la main. Deux heures avant l'exercice de Nu-7.",
            delaySeconds: 6,
          },
          {
            id: "c2-2",
            sender: "character",
            text: "Si Nu-7 déploie sur un secteur dont les seuils sont truqués, l'exercice devient réel. Vous comprenez ce que ça veut dire ?",
            delaySeconds: 5,
          },
        ],
        choices: [
          {
            id: "escalate",
            label: "Je préviens directement le Commandant Vance.",
            sagaChoice: { key: "ch2_protocol_breach_response", value: "escalate_nu7" },
            characterEffects: [
              { characterId: "commandant-nu7", trustDelta: 1 },
              { characterId: "dr-chen", trustDelta: -1, addNote: "went_over_chen_ch2" },
            ],
            sets: { ch2_protocol_anomaly_found: true, ch2_pivot_resolved: true },
            nextNodeId: "escalate_reply",
          },
          {
            id: "warn",
            label: "Je vous laisse le temps de vérifier avant de remonter ça.",
            sagaChoice: { key: "ch2_protocol_breach_response", value: "warn_chen" },
            requires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", op: "neq", value: "reported" }],
            characterEffects: [{ characterId: "dr-chen", trustDelta: 2, addNote: "covered_chen_ch2" }],
            sets: { ch2_protocol_anomaly_found: true, ch2_pivot_resolved: true },
            nextNodeId: "warn_reply",
          },
          {
            id: "bury",
            label: "Je remets les seuils à zéro moi-même, sans rien dire.",
            sagaChoice: { key: "ch2_protocol_breach_response", value: "bury_it" },
            characterEffects: [
              { characterId: "dr-chen", trustDelta: -1, addNote: "reckless_ch2" },
            ],
            sets: {
              ch2_protocol_anomaly_found: true,
              ch2_pivot_resolved: true,
              ch2_unauthorized_action: true,
            },
            nextNodeId: "bury_reply",
          },
        ],
      },
      escalate_reply: {
        id: "escalate_reply",
        characterId: "dr-chen",
        messages: [
          {
            id: "c2-3",
            sender: "character",
            text: "…D'accord. C'est la version « par le livre ». Prévenez-moi si Nu-7 débarque dans mon labo.",
            delaySeconds: 4,
          },
        ],
        autoNext: "investigation_hook",
      },
      warn_reply: {
        id: "warn_reply",
        characterId: "dr-chen",
        messages: [
          {
            id: "c2-4",
            sender: "character",
            text: "Merci. Deux fois maintenant. Je ne l'oublierai pas.",
            delaySeconds: 4,
          },
        ],
        autoNext: "investigation_hook",
      },
      bury_reply: {
        id: "bury_reply",
        characterId: "dr-chen",
        messages: [
          {
            id: "c2-5",
            sender: "character",
            text: "Vous n'avez pas la clearance pour ça. Si quelqu'un vérifie les logs d'accès, ça va tomber sur vous — pas sur qui a fait ça en premier.",
            delaySeconds: 5,
          },
        ],
        autoNext: "investigation_hook",
      },
      investigation_hook: {
        id: "investigation_hook",
        characterId: "dr-chen",
        messages: [
          {
            id: "c2-6",
            sender: "character",
            text: "Consultez les Protocoles de confinement sur votre terminal. L'historique des modifications y est — en théorie.",
            delaySeconds: 4,
            attachment: {
              type: "document",
              label: "PROTO_CONFINEMENT_EUCLID.pdf",
              id: "doc-protocole-confinement-euclid",
            },
          },
        ],
      },
    },
  },

  // ---- Acte III — enquête ----
  {
    id: "garrison-reveal",
    characterId: "rh-terminal",
    label: "Sécurité — Note interne",
    unlockRequires: [
      { type: "flag", key: "ch2_protocol_anomaly_found", value: true },
    ],
    initialDelaySeconds: 60,
    entryNodeId: "reveal",
    nodes: {
      reveal: {
        id: "reveal",
        characterId: "rh-terminal",
        messages: [
          {
            id: "gr1",
            sender: "character",
            text: "JOURNAL D'ACCÈS — Anomalie confirmée.",
            delaySeconds: 2,
          },
          {
            id: "gr2",
            sender: "character",
            text: "Les seuils Euclid-7 ont été modifiés depuis un terminal Class-D, superviseur Lt. Garrison. Motif inconnu.",
            delaySeconds: 3,
            attachment: {
              type: "document",
              label: "RAPPORT_ACCES_GARRISON.pdf",
              id: "doc-rapport-garrison",
            },
          },
          {
            id: "gr3",
            sender: "character",
            text: "Dossier transmis au Commandant Vance pour l'exercice de demain.",
            delaySeconds: 2,
          },
        ],
        onEnterSets: { ch2_garrison_implicated: true },
      },
    },
  },

  // ---- Acte IV — exercice + clôture ----
  {
    id: "nu7-exercise-live",
    characterId: "commandant-nu7",
    label: "Nu-7 — Exercice (live)",
    unlockRequires: [{ type: "flag", key: "ch2_pivot_resolved", value: true }],
    initialDelaySeconds: 45,
    entryNodeId: "deploy",
    nodes: {
      deploy: {
        id: "deploy",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "ex1",
            sender: "character",
            text: "[EXERCICE EN COURS — 06h00] Secteur Euclid-7. Confinement simulé... sauf que les seuils étaient faussés.",
            delaySeconds: 4,
          },
          {
            id: "ex2",
            sender: "character",
            text: "On a eu un vrai pic pendant trente secondes avant recalibrage. Personne n'a été blessé. Cette fois.",
            delaySeconds: 4,
          },
        ],
        conditionalAutoNext: [
          {
            requires: [{ type: "saga_choice", key: "ch2_protocol_breach_response", value: "escalate_nu7" }],
            nodeId: "branch_escalate",
          },
          {
            requires: [{ type: "saga_choice", key: "ch2_protocol_breach_response", value: "warn_chen" }],
            nodeId: "branch_warn",
          },
          {
            requires: [{ type: "saga_choice", key: "ch2_protocol_breach_response", value: "bury_it" }],
            nodeId: "branch_bury",
          },
        ],
      },
      branch_escalate: {
        id: "branch_escalate",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "ex3a",
            sender: "character",
            text: "Vous avez signalé tout de suite. Garrison est suspendu, l'enquête est officielle. Propre. C'est comme ça que ça devrait toujours se passer.",
            delaySeconds: 4,
          },
        ],
        autoNext: "closure_lead_in",
      },
      branch_warn: {
        id: "branch_warn",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "ex3b",
            sender: "character",
            text: "Chen a signalé une heure après vous. J'ai remarqué le délai. Je ne pose pas de questions — pour l'instant.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch2_aegis_flagged: true },
        autoNext: "closure_lead_in",
      },
      branch_bury: {
        id: "branch_bury",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "ex3c",
            sender: "character",
            text: "Les logs d'accès disent que VOUS avez touché aux seuils, pas Garrison. Officiellement. J'aimerais une explication.",
            delaySeconds: 5,
          },
          {
            id: "ex3c2",
            sender: "character",
            text: "Je la garde pour moi. Cette fois.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch2_unauthorized_action_covered: true, ch2_aegis_flagged: true },
        autoNext: "closure_lead_in",
      },
      closure_lead_in: {
        id: "closure_lead_in",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "ex4",
            sender: "character",
            text: "Rapport transmis au Directeur. Fin d'exercice.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch2_nu7_exercise_done: true },
      },
    },
  },
  {
    id: "ch2-closure",
    characterId: "rh-terminal",
    label: "RH — Fin d'exercice",
    unlockRequires: [{ type: "flag", key: "ch2_nu7_exercise_done", value: true }],
    initialDelaySeconds: 15,
    entryNodeId: "closure",
    nodes: {
      closure: {
        id: "closure",
        characterId: "rh-terminal",
        messages: [
          {
            id: "cl2-1",
            sender: "character",
            text: "EXERCICE DE CONFINEMENT — Rapport préliminaire",
            delaySeconds: 2,
          },
          {
            id: "cl2-2",
            sender: "character",
            text: "Présence enregistrée. FIM Nu-7 valide votre dossier opérationnel.",
            delaySeconds: 2,
          },
        ],
        conditionalAutoNext: [
          {
            requires: [{ type: "flag", key: "ch2_aegis_flagged", value: true }],
            nodeId: "closure_aegis_note",
          },
        ],
        autoNext: "closure_final",
      },
      closure_aegis_note: {
        id: "closure_aegis_note",
        characterId: "rh-terminal",
        messages: [
          {
            id: "cl2-aegis",
            sender: "character",
            text: "Note : un délai de signalement anormal a été consigné dans votre dossier. A.E.G.I.S. audite désormais tous les incidents Euclid-7.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch2_aegis_noted: true },
        autoNext: "closure_final",
      },
      closure_final: {
        id: "closure_final",
        characterId: "rh-terminal",
        messages: [
          {
            id: "cl2-3",
            sender: "character",
            text: "REDLAKES TERMINAL II — Protocoles : terminé.\n\nVos choix sont archivés dans la Global Narrative Save.",
            delaySeconds: 3,
          },
          {
            id: "cl2-4",
            sender: "character",
            text: "REDLAKES TERMINAL III — Surface : débloqué dans le sélecteur de chapitres.",
            delaySeconds: 2,
          },
        ],
        onEnterSets: { ch2_complete: true },
        completeChapter: true,
      },
    },
  },
];

export const CHAPTER_02_OFFLINE_EVENTS = [
  {
    id: "ch2-nu7-reminder",
    triggerAfterSeconds: 30,
    effect: { type: "set_flag" as const, flag: "ch2_exercise_reminder", value: true },
  },
];
