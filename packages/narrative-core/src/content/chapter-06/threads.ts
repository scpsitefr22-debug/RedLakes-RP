import type { MessageThread } from "../../types/narrative.js";
import type { ScheduledWorldEvent } from "../../types/gns.js";

/**
 * Chapitre VI — Silence
 * Des personnes disparaissent. Des messages sont supprimés. Le Site continue.
 * Rappel : « Projet ████ — gelé jusqu'à nouvel ordre » (briefing Ch.I).
 */

export const CHAPTER_06_THREADS: MessageThread[] = [
  // ---- Acte I — l'organigramme change ----
  {
    id: "rh-org-update",
    characterId: "rh-terminal",
    label: "RH — Mise à jour organigramme",
    entryNodeId: "update",
    nodes: {
      update: {
        id: "update",
        characterId: "rh-terminal",
        messages: [
          {
            id: "u1",
            sender: "character",
            text: "MISE À JOUR ORGANIGRAMME — Secteur Recherche.",
            delaySeconds: 2,
          },
          {
            id: "u2",
            sender: "character",
            text: "Amir Hassan, chercheur junior, retiré des effectifs actifs. Motif : transfert administratif.",
            delaySeconds: 3,
          },
          {
            id: "u3",
            sender: "character",
            text: "Aucune action requise de votre part.",
            delaySeconds: 2,
          },
        ],
        onEnterSets: { ch6_amir_vanished: true, ch6_briefing_done: true },
      },
    },
  },

  // ---- Acte II — pivot ----
  {
    id: "amir-last-message",
    characterId: "chercheur-junior-euclid",
    label: "Amir H. — Message non livré",
    unlockRequires: [{ type: "flag", key: "ch6_briefing_done", value: true }],
    initialDelaySeconds: 20,
    entryNodeId: "fragment",
    nodes: {
      fragment: {
        id: "fragment",
        characterId: "chercheur-junior-euclid",
        messages: [
          {
            id: "am1",
            sender: "system",
            text: "Un message partiellement corrompu apparaît, horodaté avant la mise à jour de l'organigramme.",
            delaySeconds: 2,
          },
          {
            id: "am2",
            sender: "character",
            text: "Si vous lisez ça — j'ai trouvé quelque chose sur le Projet ████. Je ne suis pas censé savoir que ce nom existe encore.",
            delaySeconds: 5,
            edited: true,
          },
          {
            id: "am3",
            sender: "character",
            text: "[MESSAGE PARTIELLEMENT SUPPRIMÉ]",
            delaySeconds: 3,
            deleted: true,
          },
        ],
        choices: [
          {
            id: "dig",
            label: "Essayer de récupérer le reste du message.",
            sagaChoice: { key: "ch6_silence_response", value: "dig_deeper" },
            characterEffects: [{ characterId: "chercheur-junior-euclid", trustDelta: 1, addNote: "tried_to_help_ch6" }],
            sets: { ch6_pivot_resolved: true, ch6_digging: true },
            nextNodeId: "dig_reply",
          },
          {
            id: "letgo",
            label: "Signaler l'anomalie et ne pas insister.",
            sagaChoice: { key: "ch6_silence_response", value: "let_it_go" },
            sets: { ch6_pivot_resolved: true },
            nextNodeId: "letgo_reply",
          },
          {
            id: "confront",
            label: "Demander directement des comptes au Directeur.",
            sagaChoice: { key: "ch6_silence_response", value: "confront_directeur" },
            characterEffects: [{ characterId: "directeur-site", trustDelta: -1 }],
            sets: { ch6_pivot_resolved: true, ch6_confronted: true },
            nextNodeId: "confront_reply",
          },
        ],
      },
      dig_reply: {
        id: "dig_reply",
        characterId: "rh-terminal",
        messages: [
          {
            id: "am4a",
            sender: "character",
            text: "Tentative de récupération enregistrée. Accédez au module Fichiers supprimés de votre terminal.",
            delaySeconds: 3,
          },
        ],
        autoNext: "aftermath_lead_in",
      },
      letgo_reply: {
        id: "letgo_reply",
        characterId: "rh-terminal",
        messages: [
          {
            id: "am4b",
            sender: "character",
            text: "Signalement enregistré, sans suite immédiate. Le dossier Hassan reste clos administrativement.",
            delaySeconds: 3,
          },
        ],
        autoNext: "aftermath_lead_in",
      },
      confront_reply: {
        id: "confront_reply",
        characterId: "directeur-site",
        messages: [
          {
            id: "am4c",
            sender: "character",
            text: "Hassan a été transféré. C'est tout ce que vous devez savoir, et déjà plus que la plupart.",
            delaySeconds: 5,
          },
          {
            id: "am4c2",
            sender: "character",
            text: "Insistez encore une fois sur ce sujet et c'est votre dossier qui sera « mis à jour ».",
            delaySeconds: 4,
          },
        ],
        autoNext: "aftermath_lead_in",
      },
      aftermath_lead_in: {
        id: "aftermath_lead_in",
        characterId: "rh-terminal",
        messages: [],
        onEnterSets: { ch6_aftermath_ready: true },
      },
    },
  },

  // ---- Acte III — conséquences ----
  {
    id: "ch6-dig-results",
    characterId: "cassie",
    label: "CASSIE — Fragment récupéré",
    unlockRequires: [
      { type: "flag", key: "ch6_digging", value: true },
      { type: "flag", key: "ch6_aftermath_ready", value: true },
    ],
    initialDelaySeconds: 30,
    entryNodeId: "recovered",
    nodes: {
      recovered: {
        id: "recovered",
        characterId: "cassie",
        messages: [
          {
            id: "d1",
            sender: "character",
            text: "Fragment récupéré à 40 %. Reste illisible : origine du Projet ████, date de gel officielle : antérieure à la fondation du Site-12.",
            delaySeconds: 4,
          },
          {
            id: "d2",
            sender: "character",
            text: "Je n'ai pas d'autorisation pour aller plus loin. Ni vous, techniquement.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch6_project_hint_found: true },
      },
    },
  },
  {
    id: "ch6-closure",
    characterId: "rh-terminal",
    label: "RH — Silence administratif",
    unlockRequires: [{ type: "flag", key: "ch6_aftermath_ready", value: true }],
    initialDelaySeconds: 50,
    entryNodeId: "closure",
    nodes: {
      closure: {
        id: "closure",
        characterId: "rh-terminal",
        messages: [
          { id: "c6-1", sender: "character", text: "DOSSIER HASSAN — Clos administrativement.", delaySeconds: 2 },
          {
            id: "c6-2",
            sender: "character",
            text: "Le Site continue. Il continue toujours.",
            delaySeconds: 3,
          },
          {
            id: "c6-3",
            sender: "character",
            text: "REDLAKES TERMINAL VI — Silence : terminé.\n\nVos choix sont archivés dans la Global Narrative Save.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch6_complete: true },
        completeChapter: true,
      },
    },
  },
];

export const CHAPTER_06_OFFLINE_EVENTS: ScheduledWorldEvent[] = [];
