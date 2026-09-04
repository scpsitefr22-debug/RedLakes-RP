import type { MessageThread } from "../../types/narrative.js";
import type { ScheduledWorldEvent } from "../../types/gns.js";

/**
 * Chapitre VII — Brèche
 * Keter ne demande pas la permission. Nu-7 déploie.
 * Le sort de Dr. Chen (Ch.I) détermine si elle intervient pour protéger le joueur.
 */

export const CHAPTER_07_THREADS: MessageThread[] = [
  // ---- Acte I — alerte ----
  {
    id: "breach-alarm",
    characterId: "rh-terminal",
    label: "#alertes-site12 — URGENT",
    entryNodeId: "alarm",
    nodes: {
      alarm: {
        id: "alarm",
        characterId: "rh-terminal",
        messages: [
          {
            id: "al1",
            sender: "character",
            text: "ALERTE CONFINEMENT — NIVEAU MAXIMAL. Secteur Keter, brèche active. Ce n'est pas un exercice.",
            delaySeconds: 2,
          },
          {
            id: "al2",
            sender: "character",
            text: "FIM Nu-7 déployée. Tout le personnel : suivre le protocole d'évacuation niveau 1.",
            delaySeconds: 2,
          },
        ],
        onEnterSets: { ch7_breach_active: true },
      },
    },
  },
  {
    id: "nu7-breach-command",
    characterId: "commandant-nu7",
    label: "Commandant Vance — Confinement",
    unlockRequires: [{ type: "flag", key: "ch7_breach_active", value: true }],
    initialDelaySeconds: 5,
    entryNodeId: "command",
    nodes: {
      command: {
        id: "command",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "nc1",
            sender: "character",
            text: "{player_name}. Pas le temps pour les politesses. Secteur Keter-02 a cédé. J'ai besoin de gens qui savent où sont les issues et les postes de contrôle.",
            delaySeconds: 4,
          },
          {
            id: "nc2",
            sender: "character",
            text: "Trois options, trente secondes pour choisir.",
            delaySeconds: 3,
          },
        ],
        choices: [
          {
            id: "assist",
            label: "Je rejoins Nu-7 en salle de contrôle pour appuyer le confinement.",
            sagaChoice: { key: "ch7_breach_response", value: "assist_nu7" },
            characterEffects: [{ characterId: "commandant-nu7", trustDelta: 2 }],
            sets: { ch7_pivot_resolved: true, ch7_assisted_containment: true },
            nextNodeId: "assist_reply",
          },
          {
            id: "evacuate",
            label: "Je m'occupe d'évacuer le personnel et les Class-D du secteur.",
            sagaChoice: { key: "ch7_breach_response", value: "evacuate_civilians" },
            characterEffects: [{ characterId: "responsable-class-d", trustDelta: 2 }],
            sets: { ch7_pivot_resolved: true, ch7_evacuated_classd: true },
            nextNodeId: "evacuate_reply",
          },
          {
            id: "shelter",
            label: "[Suivre le protocole] Je me confine à mon poste.",
            sagaChoice: { key: "ch7_breach_response", value: "shelter" },
            sets: { ch7_pivot_resolved: true },
            nextNodeId: "shelter_reply",
          },
        ],
      },
      assist_reply: {
        id: "assist_reply",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "nc3a",
            sender: "character",
            text: "Salle de contrôle, maintenant. Ouvrez le panneau de confinement sur votre terminal.",
            delaySeconds: 3,
          },
        ],
        conditionalAutoNext: [
          {
            requires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", value: "saved" }],
            nodeId: "chen_saves_you",
          },
        ],
        autoNext: "resolution_lead_in",
      },
      evacuate_reply: {
        id: "evacuate_reply",
        characterId: "commandant-nu7",
        messages: [
          { id: "nc3b", sender: "character", text: "Compris. Gardez le canal ouvert.", delaySeconds: 3 },
        ],
        autoNext: "resolution_lead_in",
      },
      shelter_reply: {
        id: "shelter_reply",
        characterId: "commandant-nu7",
        messages: [
          { id: "nc3c", sender: "character", text: "Prudent. Restez-y.", delaySeconds: 3 },
        ],
        autoNext: "resolution_lead_in",
      },
      chen_saves_you: {
        id: "chen_saves_you",
        characterId: "dr-chen",
        messages: [
          {
            id: "cs1",
            sender: "character",
            text: "Pas par là — le conduit d'aération de ce couloir a cédé avec la brèche. Passez par le labo B, je vous guide.",
            delaySeconds: 4,
          },
          {
            id: "cs2",
            sender: "character",
            text: "Vous m'avez couverte la première semaine. Aujourd'hui, c'est mon tour.",
            delaySeconds: 4,
          },
        ],
        autoNext: "resolution_lead_in",
      },
      resolution_lead_in: {
        id: "resolution_lead_in",
        characterId: "commandant-nu7",
        messages: [],
        onEnterSets: { ch7_resolution_ready: true },
      },
    },
  },

  // ---- Acte III — résolution ----
  {
    id: "ch7-containment-result",
    characterId: "commandant-nu7",
    label: "Nu-7 — Confinement rétabli",
    unlockRequires: [{ type: "flag", key: "ch7_resolution_ready", value: true }],
    initialDelaySeconds: 40,
    entryNodeId: "result",
    nodes: {
      result: {
        id: "result",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "cr1",
            sender: "character",
            text: "Confinement rétabli. Secteur Keter-02 de nouveau scellé. Pertes : deux agents Class-D, aucun personnel Fondation.",
            delaySeconds: 4,
          },
        ],
        conditionalAutoNext: [
          {
            requires: [{ type: "flag", key: "ch7_assisted_containment", value: true }],
            nodeId: "result_assisted",
          },
          {
            requires: [{ type: "flag", key: "ch7_evacuated_classd", value: true }],
            nodeId: "result_evacuated",
          },
        ],
        autoNext: "result_default",
      },
      result_assisted: {
        id: "result_assisted",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "cr2a",
            sender: "character",
            text: "Sans votre appui en salle de contrôle, ça aurait été pire. Nu-7 s'en souvient.",
            delaySeconds: 4,
          },
        ],
        autoNext: "closure_lead_in",
      },
      result_evacuated: {
        id: "result_evacuated",
        characterId: "commandant-nu7",
        messages: [
          {
            id: "cr2b",
            sender: "character",
            text: "Les deux pertes Class-D auraient été quatre sans votre évacuation. Ça ne fera pas les gros titres. Ça compte quand même.",
            delaySeconds: 4,
          },
        ],
        autoNext: "closure_lead_in",
      },
      result_default: {
        id: "result_default",
        characterId: "commandant-nu7",
        messages: [
          { id: "cr2c", sender: "character", text: "Vous avez suivi le protocole. C'est déjà ça.", delaySeconds: 4 },
        ],
        autoNext: "closure_lead_in",
      },
      closure_lead_in: {
        id: "closure_lead_in",
        characterId: "commandant-nu7",
        messages: [],
        onEnterSets: { ch7_containment_resolved: true, ch7_breach_active: false },
      },
    },
  },
  {
    id: "ch7-closure",
    characterId: "rh-terminal",
    label: "RH — Fin d'alerte",
    unlockRequires: [{ type: "flag", key: "ch7_containment_resolved", value: true }],
    initialDelaySeconds: 20,
    entryNodeId: "closure",
    nodes: {
      closure: {
        id: "closure",
        characterId: "rh-terminal",
        messages: [
          { id: "c7-1", sender: "character", text: "FIN D'ALERTE — Secteur Keter-02 confiné.", delaySeconds: 2 },
          {
            id: "c7-2",
            sender: "character",
            text: "REDLAKES TERMINAL VII — Brèche : terminé.\n\nVos choix sont archivés dans la Global Narrative Save.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch7_complete: true },
        completeChapter: true,
      },
    },
  },
];

export const CHAPTER_07_OFFLINE_EVENTS: ScheduledWorldEvent[] = [];
