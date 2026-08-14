import type { MessageThread } from "../../types/narrative.js";

/** Acte 3 — monde vivant, exploration, conséquences différées */
export const CHAPTER_01_ACT3_THREADS: MessageThread[] = [
  {
    id: "rh-exploration-nudge",
    characterId: "superviseur-rh",
    label: "RH — Consignes",
    unlockRequires: [
      { type: "flag", key: "ch1_chen_resolved", value: true },
      { type: "flag", key: "ch1_briefing_reminder_sent", op: "neq", value: true },
    ],
    initialDelaySeconds: 20,
    entryNodeId: "nudge",
    nodes: {
      nudge: {
        id: "nudge",
        characterId: "superviseur-rh",
        messages: [
          {
            id: "en1",
            sender: "character",
            text: "Petit rappel, {player_name} : votre terminal n'est pas qu'une messagerie.",
            delaySeconds: 3,
          },
          {
            id: "en2",
            sender: "character",
            text: "Consultez la Base SCP, le journal incidents, CASSIE. Le briefing arrive — profitez de ce calme relatif.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch1_exploration_nudge_seen: true },
      },
    },
  },
  {
    id: "site-rumor",
    characterId: "rh-terminal",
    label: "RH — Rumeur interne",
    unlockRequires: [{ type: "flag", key: "ch1_site_rumor_spread", value: true }],
    entryNodeId: "rumor",
    nodes: {
      rumor: {
        id: "rumor",
        characterId: "rh-terminal",
        messages: [
          {
            id: "sr1",
            sender: "character",
            text: "ALERTE RUMEUR — Circulation non autorisée détectée sur le réseau interne.",
            delaySeconds: 2,
          },
          {
            id: "sr2",
            sender: "character",
            text: "Un inspecteur AEGIS aurait été aperçu dans l'aile administrative. Aucune confirmation officielle.",
            delaySeconds: 3,
          },
          {
            id: "sr3",
            sender: "character",
            text: "Document interne : NOTE_RUMEUR_INTERNE.txt — consultez la Base SCP.",
            delaySeconds: 2,
            attachment: {
              type: "document",
              label: "NOTE_RUMEUR_INTERNE.txt",
              id: "doc-site-rumor",
            },
          },
        ],
        onEnterSets: { ch1_rumor_thread_seen: true },
      },
    },
  },
  {
    id: "chen-followup-ping",
    characterId: "dr-chen",
    label: "Dr. Chen — Suivi",
    unlockRequires: [{ type: "flag", key: "ch1_chen_followup_ping", value: true }],
    initialDelaySeconds: 2,
    entryNodeId: "ping",
    nodes: {
      ping: {
        id: "ping",
        characterId: "dr-chen",
        messages: [
          {
            id: "cf1",
            sender: "character",
            text: "Toujours là ? Les logs bougent encore. Quelqu'un les consulte depuis l'extérieur du labo.",
            delaySeconds: 3,
          },
          {
            id: "cf2",
            sender: "character",
            text: "Ne répondez pas si vous êtes en salle commune. Écrivez quand vous êtes seul.",
            delaySeconds: 2,
          },
        ],
        onEnterSets: { ch1_chen_followup_done: true },
      },
    },
  },
  {
    id: "archiviste-rumor",
    characterId: "archiviste-c2",
    label: "Mme Fontaine — Archives",
    unlockRequires: [{ type: "flag", key: "ch1_rumor_thread_seen", value: true }],
    initialDelaySeconds: 8,
    entryNodeId: "intro",
    nodes: {
      intro: {
        id: "intro",
        characterId: "archiviste-c2",
        messages: [
          {
            id: "af1",
            sender: "character",
            text: "Recrue {player_name}. La rumeur AEGIS circule — je la classe déjà dans trois dossiers contradictoires.",
            delaySeconds: 3,
          },
          {
            id: "af2",
            sender: "character",
            text: "Si vous trouvez une copie papier, ne la scannez pas. Passez par moi.",
            delaySeconds: 2,
          },
        ],
        choices: [
          {
            id: "ack",
            label: "Compris. Je vous préviendrai.",
            characterEffects: [{ characterId: "archiviste-c2", trustDelta: 1 }],
            nextNodeId: "ack_reply",
          },
          {
            id: "dismiss",
            label: "Ce n'est pas mon service.",
            nextNodeId: "dismiss_reply",
          },
        ],
      },
      ack_reply: {
        id: "ack_reply",
        characterId: "archiviste-c2",
        messages: [
          {
            id: "af3",
            sender: "character",
            text: "Bien. Les archives retiennent ceux qui savent garder la tête froide.",
            delaySeconds: 2,
          },
        ],
      },
      dismiss_reply: {
        id: "dismiss_reply",
        characterId: "archiviste-c2",
        messages: [
          {
            id: "af4",
            sender: "character",
            text: "Comme vous voulez. Le Site archivera votre indifférence aussi.",
            delaySeconds: 2,
          },
        ],
      },
    },
  },
];
