import type { MessageThread } from "../../types/narrative.js";
import { CHAPTER_01_ACT4_THREADS } from "./act4.js";
import { CHAPTER_01_ACT3_THREADS } from "./act3.js";
import { CHAPTER_01_ACT2_THREADS } from "./act2-threads.js";

const OFFICE_LEFT = [{ type: "flag" as const, key: "ch1_left_director_office", value: true }];

export const CHAPTER_01_THREADS: MessageThread[] = [
  ...CHAPTER_01_ACT2_THREADS,
  {
    id: "dr-chen-anomaly",
    characterId: "dr-chen",
    label: "Dr. Chen — Anomalie",
    entryNodeId: "distress",
    unlockRequires: OFFICE_LEFT,
    initialDelaySeconds: 12,
    nodes: {
      distress: {
        id: "distress",
        characterId: "dr-chen",
        messages: [
          {
            id: "c1",
            sender: "character",
            text: "{player_name}. Nouveau personnel, c'est ça ? Parfait. Vous n'avez pas encore appris à faire semblant.",
            delaySeconds: 6,
          },
          {
            id: "c2",
            sender: "character",
            text: "Secteur Euclid-7. Les lectures ne collent plus au protocole depuis trois jours. Personne au comité ne veut ouvrir le dossier.",
            delaySeconds: 5,
          },
          {
            id: "c3",
            sender: "character",
            text: "Je peux vous transférer les logs bruts. Mais si vous les remontez au Directeur sans m'en parler… je deviens le problème.",
            delaySeconds: 4,
          },
        ],
        choices: [
          {
            id: "help",
            label: "Envoyez les logs. Je vous couvre.",
            sagaChoice: { key: "ch1_dr_chen_fate", value: "saved" },
            characterEffects: [
              {
                characterId: "dr-chen",
                trustDelta: 2,
                addNote: "saved_in_ch1",
                addPromise: "protect_chen_logs",
              },
            ],
            sets: { ch1_chen_logs_received: true, ch1_chen_resolved: true },
            nextNodeId: "help_reply",
          },
          {
            id: "report",
            label: "Je dois passer par les canaux officiels.",
            sagaChoice: { key: "ch1_dr_chen_fate", value: "reported" },
            characterEffects: [{ characterId: "dr-chen", trustDelta: -2, addNote: "betrayed_chen_ch1" }],
            sets: { ch1_chen_resolved: true },
            nextNodeId: "report_reply",
          },
          {
            id: "ignore",
            label: "Ce n'est pas mon secteur. Bonne chance.",
            sagaChoice: { key: "ch1_dr_chen_fate", value: "ignored" },
            characterEffects: [{ characterId: "dr-chen", trustDelta: -1, addNote: "ignored_chen_ch1" }],
            sets: { ch1_chen_resolved: true },
            nextNodeId: "ignore_reply",
          },
        ],
      },
      help_reply: {
        id: "help_reply",
        characterId: "dr-chen",
        messages: [
          {
            id: "c4",
            sender: "character",
            text: "Merci. Fichier transmis — ne l'ouvrez pas sur un réseau partagé.",
            delaySeconds: 3,
            attachment: { type: "document", label: "LOG_EUCLID-7_██.pdf", id: "doc-euclid7-logs" },
          },
          {
            id: "c5",
            sender: "character",
            text: "Si je disparais de l'organigramme, ces logs existent quand même. C'est tout ce que je demande.",
            delaySeconds: 5,
          },
        ],
      },
      report_reply: {
        id: "report_reply",
        characterId: "dr-chen",
        messages: [
          {
            id: "c6",
            sender: "character",
            text: "…Comme prévu. Le protocole avant les gens.",
            delaySeconds: 8,
          },
          {
            id: "c6b",
            sender: "character",
            text: "Message reçu. Ne me recontactez pas pour ça.",
            delaySeconds: 4,
          },
        ],
      },
      ignore_reply: {
        id: "ignore_reply",
        characterId: "dr-chen",
        messages: [
          {
            id: "c7-sys",
            sender: "system",
            text: "Dr. Chen a supprimé un message.",
            delaySeconds: 1,
          },
          {
            id: "c7",
            sender: "character",
            text: "D'accord. Oubliez cette conversation.",
            delaySeconds: 2,
            deleted: true,
          },
        ],
      },
      saga_remember: {
        id: "saga_remember",
        characterId: "dr-chen",
        requires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", value: "saved" }],
        messages: [
          {
            id: "c-mem",
            sender: "character",
            text: "Vous m'avez couvert la première semaine. Je protège encore ceux qui ont tenu parole.",
            delaySeconds: 2,
          },
        ],
      },
    },
  },
  {
    id: "cassie-welcome",
    characterId: "cassie",
    label: "CASSIE",
    entryNodeId: "boot",
    unlockRequires: OFFICE_LEFT,
    initialDelaySeconds: 8,
    nodes: {
      boot: {
        id: "boot",
        characterId: "cassie",
        messages: [
          {
            id: "ca1",
            sender: "character",
            text: "CASSIE en ligne. Système d'assistance Site-12 — clearance 1.",
            delaySeconds: 2,
          },
          {
            id: "ca2",
            sender: "character",
            text: "Je peux vous orienter : incidents récents, localisation personnel, documents autorisés.",
            delaySeconds: 2,
          },
        ],
        choices: [
          {
            id: "incidents",
            label: "Quels incidents récents ?",
            sets: { cassie_queried_incidents: true },
            nextNodeId: "incidents_reply",
          },
          {
            id: "personnel",
            label: "Où trouver le Dr. Chen ?",
            nextNodeId: "chen_location",
          },
          {
            id: "protocol",
            label: "Que faire si je vois une anomalie ?",
            nextNodeId: "protocol_reply",
          },
        ],
      },
      incidents_reply: {
        id: "incidents_reply",
        characterId: "cassie",
        messages: [
          {
            id: "ca3",
            sender: "character",
            text: "Dernier incident documenté : brèche partielle Secteur Keter-02, 15 juin 2026. Durée : 47 minutes.",
            delaySeconds: 2,
          },
          {
            id: "ca4",
            sender: "character",
            text: "Audit A.E.G.I.S. niveau 3 — en cours. Accès restreint clearance 2+.",
            delaySeconds: 3,
          },
        ],
      },
      chen_location: {
        id: "chen_location",
        characterId: "cassie",
        messages: [
          {
            id: "ca5",
            sender: "character",
            text: "Dr. Mei Chen — Laboratoire Euclid-7, aile nord. Statut : actif. Dernière connexion : récente.",
            delaySeconds: 2,
          },
        ],
      },
      protocol_reply: {
        id: "protocol_reply",
        characterId: "cassie",
        messages: [
          {
            id: "ca6",
            sender: "character",
            text: "1. Ne pas intervenir seul. 2. Signaler via canal sécurisé. 3. Ne pas alerter le personnel non autorisé.",
            delaySeconds: 2,
          },
          {
            id: "ca7",
            sender: "character",
            text: "Les initiatives non documentées sont notées dans votre dossier.",
            delaySeconds: 2,
          },
        ],
      },
    },
  },
];

export const CHAPTER_01_ALL_THREADS = [
  ...CHAPTER_01_THREADS,
  ...CHAPTER_01_ACT3_THREADS,
  ...CHAPTER_01_ACT4_THREADS,
];

export const CHAPTER_01_OFFLINE_EVENTS = [
  {
    id: "ch1-site-rumor",
    triggerAfterSeconds: 90,
    effect: { type: "set_flag" as const, flag: "ch1_site_rumor_spread", value: true },
  },
  {
    id: "ch1-chen-followup",
    triggerAfterSeconds: 120,
    requiresFlags: ["ch1_chen_logs_received"],
    excludesFlags: ["ch1_chen_followup_done"],
    effect: { type: "set_flag" as const, flag: "ch1_chen_followup_ping", value: true },
  },
  {
    id: "ch1-briefing-nudge",
    triggerAfterSeconds: 150,
    requiresFlags: ["ch1_chen_resolved", "ch1_directeur_resolved"],
    excludesFlags: ["ch1_briefing_reminder_sent"],
    effect: { type: "set_flag" as const, flag: "ch1_briefing_nudge", value: true },
  },
];
