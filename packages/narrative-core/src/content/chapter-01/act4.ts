import type { MessageThread } from "../../types/narrative.js";

/** Acte 4 — Briefing Salle B, branches saga, clôture */
export const CHAPTER_01_ACT4_THREADS: MessageThread[] = [
  {
    id: "briefing-rappel",
    characterId: "rh-terminal",
    label: "RH — Briefing 08h00",
    unlockRequires: [
      { type: "flag", key: "ch1_directeur_resolved", value: true },
      { type: "flag", key: "ch1_chen_resolved", value: true },
    ],
    initialDelaySeconds: 5,
    entryNodeId: "reminder",
    nodes: {
      reminder: {
        id: "reminder",
        characterId: "rh-terminal",
        messages: [
          {
            id: "br1",
            sender: "character",
            text: "RAPPEL SYSTÈME — Briefing obligatoire dans 15 minutes.",
            delaySeconds: 2,
          },
          {
            id: "br2",
            sender: "character",
            text: "Lieu : Salle de conférence B, aile administrative.\nAccréditation requise : niveau 1.",
            delaySeconds: 1,
          },
          {
            id: "br3",
            sender: "character",
            text: "Le Directeur du Site présidera. Présence enregistrée automatiquement.",
            delaySeconds: 1,
          },
        ],
        onEnterSets: { ch1_briefing_reminder_sent: true },
        autoNext: "ready",
      },
      ready: {
        id: "ready",
        characterId: "rh-terminal",
        messages: [
          {
            id: "br4",
            sender: "character",
            text: "Rendez-vous sur le fil « Salle B ». Le Directeur vous contactera en direct.",
          },
        ],
      },
    },
  },
  {
    id: "briefing-salle-b",
    characterId: "directeur-site",
    label: "Directeur — Salle B (live)",
    unlockRequires: [{ type: "flag", key: "ch1_briefing_reminder_sent", value: true }],
    entryNodeId: "briefing_open",
    nodes: {
      briefing_open: {
        id: "briefing_open",
        characterId: "directeur-site",
        messages: [
          {
            id: "bb1",
            sender: "character",
            text: "[TRANSMISSION SALLE B — 08h02]\n\n{player_name}. Vous êtes présent. Bien.",
            delaySeconds: 4,
          },
          {
            id: "bb2",
            sender: "character",
            text: "Treize agents en salle. Deux absents — leurs noms sont notés.",
            delaySeconds: 3,
          },
          {
            id: "bb3",
            sender: "character",
            text: "Brèche Keter-02, 15 juin. Quarante-sept minutes. Pertes Class-D documentées.\nAudit A.E.G.I.S. niveau 3 — en cours.",
            delaySeconds: 5,
          },
          {
            id: "bb4",
            sender: "character",
            text: "Vous n'êtes pas ici pour être des héros. Vous êtes ici pour que le Site continue de fonctionner.",
            delaySeconds: 4,
          },
        ],
        choices: [
          {
            id: "ask_duty",
            label: "[Lever la main] Quelle est notre responsabilité concrète ?",
            sagaChoice: { key: "ch1_briefing_conduct", value: "engaged" },
            characterEffects: [{ characterId: "directeur-site", trustDelta: 1 }],
            nextNodeId: "duty_reply",
          },
          {
            id: "ask_classd",
            label: "[Lever la main] Les pertes Class-D étaient-elles évitables ?",
            requires: [{ type: "saga_choice", key: "ch1_briefing_response", op: "neq", value: "reluctant" }],
            sagaChoice: { key: "ch1_briefing_conduct", value: "questioned" },
            characterEffects: [{ characterId: "directeur-site", trustDelta: -1 }],
            nextNodeId: "classd_reply",
          },
          {
            id: "silent",
            label: "[Rester silencieux]",
            sagaChoice: { key: "ch1_briefing_conduct", value: "silent" },
            nextNodeId: "silent_reply",
          },
        ],
      },
      duty_reply: {
        id: "duty_reply",
        characterId: "directeur-site",
        messages: [
          {
            id: "bb5",
            sender: "character",
            text: "Suivre les protocoles. Signaler les anomalies. Ne pas improviser.",
            delaySeconds: 3,
          },
          {
            id: "bb6",
            sender: "character",
            text: "Le Conseil Oméga n'accepte pas les initiatives non autorisées.",
            delaySeconds: 2,
          },
        ],
        autoNext: "briefing_branch",
      },
      classd_reply: {
        id: "classd_reply",
        characterId: "directeur-site",
        messages: [
          {
            id: "bb7",
            sender: "character",
            text: "Les pertes sont acceptables dans le cadre du protocole.",
            delaySeconds: 5,
          },
          {
            id: "bb8",
            sender: "character",
            text: "Cette réponse sera notée dans votre dossier. Et dans celui d'AEGIS.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch1_aegis_noted: true },
        autoNext: "briefing_branch",
      },
      silent_reply: {
        id: "silent_reply",
        characterId: "directeur-site",
        messages: [
          {
            id: "bb9",
            sender: "character",
            text: "Le silence est parfois la réponse la plus sûre. Le Site écoute quand même.",
            delaySeconds: 4,
          },
        ],
        autoNext: "briefing_branch",
      },
      briefing_branch: {
        id: "briefing_branch",
        characterId: "directeur-site",
        messages: [
          {
            id: "bb10",
            sender: "character",
            text: "Projet ████ — gelé jusqu'à nouvel ordre. Ne le mentionnez pas hors clearance 2.",
            delaySeconds: 4,
          },
        ],
        autoNext: "briefing_close",
      },
      briefing_close: {
        id: "briefing_close",
        characterId: "directeur-site",
        messages: [
          {
            id: "bb11",
            sender: "character",
            text: "Briefing terminé. Retournez à vos postes.\n\n[FIN TRANSMISSION SALLE B]",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch1_briefing_attended: true },
        autoNext: "aftermath",
      },
      aftermath: {
        id: "aftermath",
        characterId: "directeur-site",
        messages: [
          {
            id: "bb12",
            sender: "character",
            text: "Première semaine en cours. Ne nous décevez pas.",
            delaySeconds: 6,
          },
        ],
      },
    },
  },
  {
    id: "dr-chen-briefing",
    characterId: "dr-chen",
    label: "Dr. Chen — Après briefing",
    unlockRequires: [
      { type: "flag", key: "ch1_briefing_attended", value: true },
      { type: "saga_choice", key: "ch1_dr_chen_fate", value: "saved" },
    ],
    initialDelaySeconds: 8,
    entryNodeId: "chen_after",
    nodes: {
      chen_after: {
        id: "chen_after",
        characterId: "dr-chen",
        messages: [
          {
            id: "cba1",
            sender: "character",
            text: "Vous avez posé la bonne question en salle — ou vous êtes resté silencieux au bon moment.",
            delaySeconds: 5,
          },
          {
            id: "cba2",
            sender: "character",
            text: "Les logs Euclid-7 restent entre nous. Merci encore.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch1_branch_followup_seen: true },
      },
    },
  },
  {
    id: "securite-convocation",
    characterId: "rh-terminal",
    label: "Sécurité — Convocation",
    unlockRequires: [
      { type: "flag", key: "ch1_briefing_attended", value: true },
      { type: "saga_choice", key: "ch1_dr_chen_fate", value: "reported" },
    ],
    initialDelaySeconds: 8,
    entryNodeId: "convocation",
    nodes: {
      convocation: {
        id: "convocation",
        characterId: "rh-terminal",
        messages: [
          {
            id: "sc1",
            sender: "character",
            text: "AVIS SÉCURITÉ — Signalement interne reçu.",
            delaySeconds: 3,
          },
          {
            id: "sc2",
            sender: "character",
            text: "Entretien obligatoire avec le superviseur Euclid demain 14h00.\nObjet : protocole de remontée d'anomalie.",
            delaySeconds: 2,
          },
          {
            id: "sc3",
            sender: "character",
            text: "Dr. Mei Chen a été informée de votre déclaration.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch1_security_review: true, ch1_branch_followup_seen: true },
      },
    },
  },
  {
    id: "chen-ignored-fallout",
    characterId: "rh-terminal",
    label: "RH — Note interne",
    unlockRequires: [
      { type: "flag", key: "ch1_briefing_attended", value: true },
      { type: "saga_choice", key: "ch1_dr_chen_fate", value: "ignored" },
    ],
    initialDelaySeconds: 8,
    entryNodeId: "ignored_note",
    nodes: {
      ignored_note: {
        id: "ignored_note",
        characterId: "rh-terminal",
        messages: [
          {
            id: "ig1",
            sender: "character",
            text: "NOTE RH — Tentative de contact non traitée (Dr. Chen, M.).",
            delaySeconds: 2,
          },
          {
            id: "ig2",
            sender: "character",
            text: "Aucune remontée d'anomalie enregistrée de votre part. Profil d'intégration : passif.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch1_branch_followup_seen: true },
      },
    },
  },
  {
    id: "ch1-closure",
    characterId: "rh-terminal",
    label: "RH — Fin de période",
    unlockRequires: [
      { type: "flag", key: "ch1_briefing_attended", value: true },
      { type: "flag", key: "ch1_branch_followup_seen", value: true },
    ],
    initialDelaySeconds: 30,
    entryNodeId: "closure",
    nodes: {
      closure: {
        id: "closure",
        characterId: "rh-terminal",
        messages: [
          {
            id: "cl1",
            sender: "character",
            text: "FIN DE PÉRIODE D'INTÉGRATION — Semaine 1",
            delaySeconds: 2,
          },
          {
            id: "cl2",
            sender: "character",
            text: "Votre dossier a été mis à jour. Clearance maintenue : niveau 1.",
            delaySeconds: 2,
          },
        ],
        conditionalAutoNext: [
          {
            requires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", value: "saved" }],
            nodeId: "closure_epilogue",
          },
          {
            requires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", value: "reported" }],
            nodeId: "closure_epilogue_reported",
          },
          {
            requires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", value: "ignored" }],
            nodeId: "closure_epilogue_ignored",
          },
        ],
        autoNext: "closure_final",
      },
      closure_epilogue: {
        id: "closure_epilogue",
        characterId: "rh-terminal",
        messages: [
          {
            id: "cl-saved",
            sender: "character",
            text: "Note interne : relation de confiance établie avec le personnel recherche (Chen, M.).",
            delaySeconds: 2,
          },
        ],
        autoNext: "closure_final",
      },
      closure_epilogue_reported: {
        id: "closure_epilogue_reported",
        characterId: "rh-terminal",
        messages: [
          {
            id: "cl-reported",
            sender: "character",
            text: "Note interne : conformité protocolaire notée. Surveillance renforcée — secteur Euclid.",
            delaySeconds: 2,
          },
        ],
        autoNext: "closure_final",
      },
      closure_epilogue_ignored: {
        id: "closure_epilogue_ignored",
        characterId: "rh-terminal",
        messages: [
          {
            id: "cl-ignored",
            sender: "character",
            text: "Note interne : aucune initiative signalée. Profil passif enregistré.",
            delaySeconds: 2,
          },
        ],
        autoNext: "closure_final",
      },
      closure_final: {
        id: "closure_final",
        characterId: "rh-terminal",
        messages: [
          {
            id: "cl-end",
            sender: "character",
            text: "REDLAKES TERMINAL I — Intégration : terminée.\n\nLe Site continue. Vos décisions sont archivées.",
            delaySeconds: 3,
          },
          {
            id: "cl-end2",
            sender: "character",
            text: "REDLAKES TERMINAL II — Protocoles : débloqué dans le sélecteur de chapitres.",
            delaySeconds: 2,
          },
        ],
        onEnterSets: { ch1_complete: true },
        completeChapter: true,
      },
    },
  },
];
