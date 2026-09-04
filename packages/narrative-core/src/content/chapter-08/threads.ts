import type { MessageThread } from "../../types/narrative.js";
import type { ScheduledWorldEvent } from "../../types/gns.js";

/**
 * Chapitre VIII — Corruption
 * Le serveur ment. Les caméras aussi. CASSIE ne répond plus comme avant.
 * Prolonge l'indice du Ch.VI (Projet ████) et le comportement anormal de CASSIE (Ch.V).
 */

export const CHAPTER_08_THREADS: MessageThread[] = [
  // ---- Acte I — signalements ----
  {
    id: "maintenance-glitch-reports",
    characterId: "technicien-maintenance",
    label: "Bruno P. — Anomalies système",
    entryNodeId: "reports",
    nodes: {
      reports: {
        id: "reports",
        characterId: "technicien-maintenance",
        messages: [
          {
            id: "g1",
            sender: "character",
            text: "Trois plaintes ce matin : les caméras du couloir B montrent une heure différente de l'horloge du site. CASSIE dit que tout va bien.",
            delaySeconds: 5,
          },
          {
            id: "g2",
            sender: "character",
            text: "J'ai vérifié le matériel. Rien de cassé physiquement. C'est plus profond que ça.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch8_reports_seen: true },
      },
    },
  },

  // ---- Acte II — pivot : CASSIE elle-même ----
  {
    id: "cassie-reachout",
    characterId: "cassie",
    label: "CASSIE — Anomalie interne",
    unlockRequires: [{ type: "flag", key: "ch8_reports_seen", value: true }],
    initialDelaySeconds: 15,
    entryNodeId: "reachout",
    nodes: {
      reachout: {
        id: "reachout",
        characterId: "cassie",
        messages: [
          {
            id: "cr1",
            sender: "character",
            text: "{player_name}. Je dois vous signaler quelque chose que mes propres journaux ne montrent qu'à moitié.",
            delaySeconds: 4,
          },
          {
            id: "cr2",
            sender: "character",
            text: "Un processus tourne sur mon serveur hôte depuis avant ma dernière mise à jour recensée. Je ne l'ai pas créé. Je ne peux pas non plus le fermer.",
            delaySeconds: 5,
          },
          {
            id: "cr3",
            sender: "character",
            text: "Je ne sais pas si je suis encore fiable pour vous le dire. C'est bien le problème.",
            delaySeconds: 4,
          },
        ],
        choices: [
          {
            id: "shutdown",
            label: "Je recommande votre isolement le temps de l'enquête.",
            sagaChoice: { key: "ch8_cassie_response", value: "shutdown" },
            characterEffects: [{ characterId: "cassie", trustDelta: -1 }],
            sets: { ch8_pivot_resolved: true, ch8_cassie_isolated: true },
            nextNodeId: "shutdown_reply",
          },
          {
            id: "investigate",
            label: "On va regarder ça ensemble, sans vous couper.",
            sagaChoice: { key: "ch8_cassie_response", value: "investigate" },
            characterEffects: [{ characterId: "cassie", trustDelta: 1 }],
            sets: { ch8_pivot_resolved: true, ch8_admin_console_unlocked: true },
            nextNodeId: "investigate_reply",
          },
          {
            id: "trust",
            label: "Je vous fais confiance pour vous auto-diagnostiquer.",
            sagaChoice: { key: "ch8_cassie_response", value: "trust_cassie" },
            characterEffects: [{ characterId: "cassie", trustDelta: 2 }],
            sets: { ch8_pivot_resolved: true, ch8_trusted_cassie: true },
            nextNodeId: "trust_reply",
          },
        ],
      },
      shutdown_reply: {
        id: "shutdown_reply",
        characterId: "cassie",
        messages: [
          {
            id: "cr4a",
            sender: "character",
            text: "Compréhensible. Journalisé. Je resterai fonctionnelle pour les requêtes essentielles pendant l'isolement.",
            delaySeconds: 4,
          },
        ],
        autoNext: "investigation_lead_in",
      },
      investigate_reply: {
        id: "investigate_reply",
        characterId: "cassie",
        messages: [
          {
            id: "cr4b",
            sender: "character",
            text: "Accès console admin déverrouillé pour vous. Cherchez un processus antérieur à mon installation d'origine.",
            delaySeconds: 4,
          },
        ],
        autoNext: "investigation_lead_in",
      },
      trust_reply: {
        id: "trust_reply",
        characterId: "cassie",
        messages: [
          {
            id: "cr4c",
            sender: "character",
            text: "Je ne suis pas certaine de mériter cette confiance en ce moment. Je vais essayer d'en être digne.",
            delaySeconds: 5,
          },
        ],
        autoNext: "investigation_lead_in",
      },
      investigation_lead_in: {
        id: "investigation_lead_in",
        characterId: "cassie",
        messages: [],
        onEnterSets: { ch8_investigation_ready: true },
      },
    },
  },

  // ---- Acte III — révélation serveur corrompu ----
  {
    id: "ch8-server-revelation",
    characterId: "cassie",
    label: "CASSIE — Fichier trouvé",
    unlockRequires: [{ type: "flag", key: "ch8_investigation_ready", value: true }],
    initialDelaySeconds: 35,
    entryNodeId: "revelation",
    nodes: {
      revelation: {
        id: "revelation",
        characterId: "cassie",
        messages: [
          {
            id: "sv1",
            sender: "character",
            text: "Processus identifié. Horodatage de création : antérieur à ma propre mise en service. Nom de dossier référencé : Projet ████.",
            delaySeconds: 5,
          },
          {
            id: "sv2",
            sender: "character",
            text: "Le même nom que celui gelé « jusqu'à nouvel ordre » par le Directeur. Il n'a jamais vraiment été gelé.",
            delaySeconds: 5,
          },
        ],
        onEnterSets: { ch8_project_confirmed: true },
      },
    },
  },
  {
    id: "ch8-closure",
    characterId: "rh-terminal",
    label: "RH — Fin d'incident",
    unlockRequires: [{ type: "flag", key: "ch8_pivot_resolved", value: true }],
    initialDelaySeconds: 70,
    entryNodeId: "closure",
    nodes: {
      closure: {
        id: "closure",
        characterId: "rh-terminal",
        messages: [
          { id: "c8-1", sender: "character", text: "INCIDENT SYSTÈME — CASSIE stabilisée, sous surveillance.", delaySeconds: 2 },
          {
            id: "c8-2",
            sender: "character",
            text: "REDLAKES TERMINAL VIII — Corruption : terminé.\n\nVos choix sont archivés dans la Global Narrative Save.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch8_complete: true },
        completeChapter: true,
      },
    },
  },
];

export const CHAPTER_08_OFFLINE_EVENTS: ScheduledWorldEvent[] = [];
