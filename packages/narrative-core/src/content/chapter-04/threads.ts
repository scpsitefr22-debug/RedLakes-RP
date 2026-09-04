import type { MessageThread } from "../../types/narrative.js";
import type { ScheduledWorldEvent } from "../../types/gns.js";

/**
 * Chapitre IV — Égouts
 * Suite directe de l'incident Ch.I « Rituel intercepté — Égouts » (artefact non récupéré).
 * La Main du Serpent laisse des traces. La Fondation préfère ne pas regarder.
 */

export const CHAPTER_04_THREADS: MessageThread[] = [
  // ---- Acte I — guide ----
  {
    id: "bruno-guide",
    characterId: "technicien-maintenance",
    label: "Bruno P. — Accès égouts",
    entryNodeId: "brief",
    nodes: {
      brief: {
        id: "brief",
        characterId: "technicien-maintenance",
        messages: [
          {
            id: "b1",
            sender: "character",
            text: "On m'a dit que vous alliez descendre voir ce qu'il reste de ce « rituel » qu'on a raté en juin. Je connais les passages — les vrais plans sont faux, remarquez.",
            delaySeconds: 5,
          },
          {
            id: "b2",
            sender: "character",
            text: "L'artefact n'a jamais été récupéré. Personne n'a voulu y retourner. Vous, apparemment, si.",
            delaySeconds: 4,
          },
          {
            id: "b3",
            sender: "character",
            text: "Restez sur le balisage jaune. Le reste du réseau n'est pas cartographié — même par moi.",
            delaySeconds: 4,
            attachment: {
              type: "document",
              label: "SCHEMA_EGOUTS_partiel.pdf",
              id: "doc-schema-egouts",
            },
          },
        ],
        onEnterSets: { ch4_briefing_done: true },
      },
    },
  },

  // ---- Acte II — pivot : rencontre Initié ----
  {
    id: "serpent-encounter",
    characterId: "initie-serpent",
    label: "??? — Signal souterrain",
    unlockRequires: [{ type: "flag", key: "ch4_briefing_done", value: true }],
    initialDelaySeconds: 30,
    entryNodeId: "presence",
    nodes: {
      presence: {
        id: "presence",
        characterId: "initie-serpent",
        messages: [
          {
            id: "s1",
            sender: "character",
            text: "Vous marchez sur des lignes que vous ne voyez pas.",
            delaySeconds: 6,
          },
          {
            id: "s2",
            sender: "character",
            text: "L'objet que vous cherchez n'est pas perdu. Il attend celui qui saura ne pas le prendre par la force.",
            delaySeconds: 5,
          },
          {
            id: "s3",
            sender: "character",
            text: "Votre Fondation classe, enferme, oublie. Nous, nous nous souvenons. C'est toute la différence.",
            delaySeconds: 5,
          },
        ],
        choices: [
          {
            id: "seize",
            label: "L'objet appartient à la Fondation. Je le récupère.",
            sagaChoice: { key: "ch4_serpent_encounter", value: "seize" },
            characterEffects: [{ characterId: "initie-serpent", trustDelta: -2, addNote: "seized_artifact_ch4" }],
            sets: { ch4_pivot_resolved: true, ch4_artifact_seized: true },
            nextNodeId: "seize_reply",
          },
          {
            id: "negotiate",
            label: "Parlez-moi de cet objet. Je ne suis pas venu pour un affrontement.",
            sagaChoice: { key: "ch4_serpent_encounter", value: "negotiate" },
            characterEffects: [{ characterId: "initie-serpent", trustDelta: 2, addNote: "negotiated_ch4" }],
            sets: { ch4_pivot_resolved: true, ch4_lore_shared: true },
            nextNodeId: "negotiate_reply",
          },
          {
            id: "retreat",
            label: "[Reculer] Je rends compte, sans intervenir.",
            sagaChoice: { key: "ch4_serpent_encounter", value: "retreat" },
            sets: { ch4_pivot_resolved: true },
            nextNodeId: "retreat_reply",
          },
        ],
      },
      seize_reply: {
        id: "seize_reply",
        characterId: "initie-serpent",
        messages: [
          {
            id: "s4a",
            sender: "character",
            text: "Prenez-le, alors. Il ne vous appartiendra pas plus qu'à nous. Vous comprendrez, un jour, ce que ça signifie.",
            delaySeconds: 5,
          },
          {
            id: "s4a2",
            sender: "system",
            text: "L'Initié disparaît dans un conduit trop étroit pour vous.",
            delaySeconds: 3,
          },
        ],
        autoNext: "investigation_hook",
      },
      negotiate_reply: {
        id: "negotiate_reply",
        characterId: "initie-serpent",
        messages: [
          {
            id: "s4b",
            sender: "character",
            text: "Un artefact pré-fondation. Il compte les cycles, pas les années. Nous le surveillons depuis plus longtemps que votre Site n'existe.",
            delaySeconds: 6,
          },
          {
            id: "s4b2",
            sender: "character",
            text: "Laissez-le. Rapportez qu'il n'y avait rien à trouver. Vous y gagnerez plus qu'en le prenant.",
            delaySeconds: 5,
          },
        ],
        autoNext: "investigation_hook",
      },
      retreat_reply: {
        id: "retreat_reply",
        characterId: "initie-serpent",
        messages: [
          {
            id: "s4c",
            sender: "character",
            text: "Sage. Peu des vôtres savent reculer à temps.",
            delaySeconds: 5,
          },
        ],
        autoNext: "investigation_hook",
      },
      investigation_hook: {
        id: "investigation_hook",
        characterId: "initie-serpent",
        messages: [
          {
            id: "s5",
            sender: "system",
            text: "Le signal s'efface. Silence dans le conduit.",
            delaySeconds: 3,
          },
        ],
      },
    },
  },

  // ---- Acte III — rapport ----
  {
    id: "ch4-report-thread",
    characterId: "rh-terminal",
    label: "Sécurité — Rapport Égouts",
    unlockRequires: [{ type: "flag", key: "ch4_pivot_resolved", value: true }],
    initialDelaySeconds: 30,
    entryNodeId: "report",
    nodes: {
      report: {
        id: "report",
        characterId: "rh-terminal",
        messages: [],
        conditionalAutoNext: [
          { requires: [{ type: "flag", key: "ch4_artifact_seized", value: true }], nodeId: "report_seized" },
          { requires: [{ type: "flag", key: "ch4_lore_shared", value: true }], nodeId: "report_negotiated" },
        ],
        autoNext: "report_retreat",
      },
      report_seized: {
        id: "report_seized",
        characterId: "rh-terminal",
        messages: [
          {
            id: "r1a",
            sender: "character",
            text: "ARTEFACT RÉCUPÉRÉ — mise en quarantaine, clearance 3. Aucune réaction anomale détectée pour l'instant.",
            delaySeconds: 3,
          },
          {
            id: "r1a2",
            sender: "character",
            text: "La Main du Serpent n'a pas revendiqué l'incident. Ce silence inquiète plus que l'objet lui-même.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch4_report_done: true },
      },
      report_negotiated: {
        id: "report_negotiated",
        characterId: "rh-terminal",
        messages: [
          {
            id: "r1b",
            sender: "character",
            text: "RAPPORT — Objet laissé en place sous surveillance discrète. Contact établi avec un membre de la Main du Serpent, non hostile.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch4_report_done: true, ch4_serpent_contact_open: true },
      },
      report_retreat: {
        id: "report_retreat",
        characterId: "rh-terminal",
        messages: [
          {
            id: "r1c",
            sender: "character",
            text: "RAPPORT — Aucune récupération. Zone marquée à réévaluer selon priorités futures.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch4_report_done: true },
      },
    },
  },
  {
    id: "ch4-closure",
    characterId: "rh-terminal",
    label: "RH — Fin de mission",
    unlockRequires: [{ type: "flag", key: "ch4_report_done", value: true }],
    initialDelaySeconds: 15,
    entryNodeId: "closure",
    nodes: {
      closure: {
        id: "closure",
        characterId: "rh-terminal",
        messages: [
          { id: "c4-1", sender: "character", text: "MISSION ÉGOUTS — Rapport clos.", delaySeconds: 2 },
          {
            id: "c4-2",
            sender: "character",
            text: "REDLAKES TERMINAL IV — Égouts : terminé.\n\nVos choix sont archivés dans la Global Narrative Save.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch4_complete: true },
        completeChapter: true,
      },
    },
  },
];

export const CHAPTER_04_OFFLINE_EVENTS: ScheduledWorldEvent[] = [];
