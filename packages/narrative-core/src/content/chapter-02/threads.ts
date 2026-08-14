import type { MessageThread } from "../../types/narrative.js";

export const CHAPTER_02_THREADS: MessageThread[] = [
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
            text: "Commandant Vance, MTF Nu-7. À partir d'aujourd'hui, vous allez voir ce que « protocole » veut vraiment dire.",
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
  {
    id: "chen-ch2",
    characterId: "dr-chen",
    label: "Dr. Chen — Suivi",
    unlockRequires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", value: "saved" }],
    entryNodeId: "followup",
    nodes: {
      followup: {
        id: "followup",
        characterId: "dr-chen",
        messages: [
          {
            id: "c2-1",
            sender: "character",
            text: "Les logs Euclid-7 circulent encore. Nu-7 a renforcé la surveillance — soyez prudent.",
            delaySeconds: 6,
          },
        ],
      },
    },
  },
  {
    id: "ch2-closure",
    characterId: "rh-terminal",
    label: "RH — Fin d'exercice",
    unlockRequires: [{ type: "flag", key: "ch2_nu7_briefing_done", value: true }],
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
            text: "Présence enregistrée. MTF Nu-7 valide votre dossier opérationnel.",
            delaySeconds: 2,
          },
          {
            id: "cl2-3",
            sender: "character",
            text: "REDLAKES TERMINAL II — Protocoles : terminé.\n\nVos choix sont archivés dans la Global Narrative Save.",
            delaySeconds: 3,
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
    triggerAfterSeconds: 180,
    effect: { type: "set_flag" as const, flag: "ch2_exercise_reminder", value: true },
  },
];
