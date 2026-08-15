import type { MessageThread } from "../../types/narrative.js";

const OFFICE_LEFT = [{ type: "flag" as const, key: "ch1_left_director_office", value: true }];

/** Acte 2 — Contacts messagerie après le bureau du Directeur */
export const CHAPTER_01_ACT2_THREADS: MessageThread[] = [
  {
    id: "rh-onboarding",
    characterId: "superviseur-rh",
    label: "RH — Intégration",
    entryNodeId: "start",
    unlockRequires: OFFICE_LEFT,
    initialDelaySeconds: 3,
    nodes: {
      start: {
        id: "start",
        characterId: "superviseur-rh",
        messages: [
          {
            id: "m1",
            sender: "character",
            text: "Bonjour {player_name}. Sophie Duval, superviseur RH. Pas un bot cette fois — promis.",
            delaySeconds: 2,
          },
          {
            id: "m2",
            sender: "character",
            text: "Votre terminal sécurisé est activé. Dossier : {employee_id} — Grade : {player_role} — Clearance 1.",
            delaySeconds: 3,
          },
          {
            id: "m3",
            sender: "character",
            text: "Accès limité aux secteurs Safe et Euclid. Si quelqu'un vous demande de « faire un tour » dans les couloirs Keter, dites non. Et venez me voir.",
            delaySeconds: 2,
          },
        ],
        autoNext: "ack",
      },
      ack: {
        id: "ack",
        characterId: "superviseur-rh",
        messages: [
          {
            id: "m4",
            sender: "character",
            text: "Rappel officiel : toute communication externe est surveillée. Bonne première journée. Je suis joignable ici.",
          },
        ],
      },
    },
  },
  {
    id: "agent-securite-perimetre",
    characterId: "agent-securite-perimetre",
    label: "Sécurité — Périmètre",
    entryNodeId: "intro",
    unlockRequires: OFFICE_LEFT,
    initialDelaySeconds: 2,
    nodes: {
      intro: {
        id: "intro",
        characterId: "agent-securite-perimetre",
        messages: [
          {
            id: "as1",
            sender: "character",
            text: "Levasseur, sécurité périmètre. Vous venez de sortir du bureau du Directeur ?",
            delaySeconds: 4,
          },
          {
            id: "as2",
            sender: "character",
            text: "Conseil : gardez votre badge visible. Les couloirs Euclid ne pardonnent pas les oublis.",
            delaySeconds: 3,
          },
        ],
        choices: [
          {
            id: "thanks",
            label: "Merci pour l'info.",
            nextNodeId: "thanks_reply",
          },
          {
            id: "ask",
            label: "Qu'est-ce qui s'est passé la semaine dernière ?",
            nextNodeId: "rumor_reply",
          },
        ],
      },
      thanks_reply: {
        id: "thanks_reply",
        characterId: "agent-securite-perimetre",
        messages: [
          { id: "as3", sender: "character", text: "De rien. On se recroise aux checkpoints.", delaySeconds: 2 },
        ],
      },
      rumor_reply: {
        id: "rumor_reply",
        characterId: "agent-securite-perimetre",
        messages: [
          {
            id: "as4",
            sender: "character",
            text: "Brèche partielle Keter-02. Quarante-sept minutes. Vous entendrez parler du briefing demain.",
            delaySeconds: 4,
          },
          {
            id: "as5",
            sender: "character",
            text: "Ne répétez pas ça dans l'open space. Les murs ont des oreilles. Et des caméras.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch1_security_rumor_heard: true },
      },
    },
  },
  {
    id: "liaison-mtf-junior",
    characterId: "liaison-mtf-junior",
    label: "FIM Nu-7 — Liaison",
    entryNodeId: "intro",
    unlockRequires: [
      ...OFFICE_LEFT,
      { type: "flag", key: "ch1_unlock_mtf_liaison", value: true },
    ],
    initialDelaySeconds: 3,
    nodes: {
      intro: {
        id: "intro",
        characterId: "liaison-mtf-junior",
        messages: [
          {
            id: "mtf1",
            sender: "character",
            text: "Reyes, liaison FIM Nu-7. Le Directeur m'a dit que vous étiez… fiable.",
            delaySeconds: 5,
          },
          {
            id: "mtf2",
            sender: "character",
            text: "Pas le Commandant Vance — je suis junior. Mais si Nu-7 déploie, vous verrez mon nom sur les convocations.",
            delaySeconds: 4,
          },
          {
            id: "mtf3",
            sender: "character",
            text: "Briefing demain. Soyez à l'heure. Nu-7 n'attend personne.",
            delaySeconds: 2,
          },
        ],
      },
    },
  },
  {
    id: "chercheur-junior-euclid",
    characterId: "chercheur-junior-euclid",
    label: "Amir H. — Recherche",
    entryNodeId: "intro",
    unlockRequires: [
      ...OFFICE_LEFT,
      { type: "flag", key: "ch1_unlock_junior_researcher", value: true },
    ],
    initialDelaySeconds: 3,
    nodes: {
      intro: {
        id: "intro",
        characterId: "chercheur-junior-euclid",
        messages: [
          {
            id: "jr1",
            sender: "character",
            text: "Salut {player_name} ! Amir Hassan, recherche Euclid. On m'a dit que vous posiez des questions au Directeur.",
            delaySeconds: 6,
          },
          {
            id: "jr2",
            sender: "character",
            text: "C'est rare ici. La plupart des recrues font oui monsieur et disparaissent dans la paperasse.",
            delaySeconds: 4,
          },
        ],
        choices: [
          {
            id: "friendly",
            label: "Je préfère comprendre avant d'obéir.",
            characterEffects: [{ characterId: "chercheur-junior-euclid", trustDelta: 1 }],
            nextNodeId: "friendly_reply",
          },
          {
            id: "cautious",
            label: "Je fais attention à ce que je dis.",
            nextNodeId: "cautious_reply",
          },
        ],
      },
      friendly_reply: {
        id: "friendly_reply",
        characterId: "chercheur-junior-euclid",
        messages: [
          {
            id: "jr3",
            sender: "character",
            text: "Respect. Si vous voulez un café un de ces jours — cantine aile nord, 14h. Les chercheurs y parlent trop fort.",
            delaySeconds: 3,
          },
        ],
      },
      cautious_reply: {
        id: "cautious_reply",
        characterId: "chercheur-junior-euclid",
        messages: [
          {
            id: "jr4",
            sender: "character",
            text: "Sage. Moi aussi. On se reparle quand vous serez moins surveillé. 😅",
            delaySeconds: 3,
          },
        ],
      },
    },
  },
  {
    id: "technicien-maintenance",
    characterId: "technicien-maintenance",
    label: "Maintenance — Bruno P.",
    entryNodeId: "gossip",
    unlockRequires: OFFICE_LEFT,
    initialDelaySeconds: 4,
    nodes: {
      gossip: {
        id: "gossip",
        characterId: "technicien-maintenance",
        messages: [
          {
            id: "tm1",
            sender: "character",
            text: "Bruno Perrin, maintenance. J'ai réparé la clim du bureau du Directeur trois fois ce mois-ci.",
            delaySeconds: 7,
          },
          {
            id: "tm2",
            sender: "character",
            text: "Entre nous : quelqu'un a vu un type en costume gris dans l'aile admin la semaine dernière. Pas un badge Fondation.",
            delaySeconds: 5,
          },
          {
            id: "tm3",
            sender: "character",
            text: "On dit que c'est AEGIS. Moi je dis : vérifiez vos conduits avant de paniquer.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch1_maintenance_gossip_heard: true },
      },
    },
  },
  {
    id: "responsable-class-d",
    characterId: "responsable-class-d",
    label: "Class-D — Supervision",
    entryNodeId: "intro",
    unlockRequires: [
      ...OFFICE_LEFT,
      { type: "flag", key: "ch1_unlock_classd_handler", value: true },
    ],
    initialDelaySeconds: 4,
    nodes: {
      intro: {
        id: "intro",
        characterId: "responsable-class-d",
        messages: [
          {
            id: "cd1",
            sender: "character",
            text: "Lieutenant Garrison. Supervision Class-D. Le Directeur m'a mentionné votre… ponctualité flexible.",
            delaySeconds: 6,
          },
          {
            id: "cd2",
            sender: "character",
            text: "Briefing 08h00. Pas une suggestion. Les chambres Class-D ne se gèrent pas en retard.",
            delaySeconds: 4,
          },
        ],
        choices: [
          {
            id: "apologize",
            label: "Compris. Je serai là.",
            characterEffects: [{ characterId: "responsable-class-d", trustDelta: 1 }],
            nextNodeId: "accept",
          },
          {
            id: "deflect",
            label: "C'était une blague. J'ai mal choisi mes mots.",
            nextNodeId: "skeptical",
          },
        ],
      },
      accept: {
        id: "accept",
        characterId: "responsable-class-d",
        messages: [
          { id: "cd3", sender: "character", text: "On verra demain matin.", delaySeconds: 3 },
        ],
      },
      skeptical: {
        id: "skeptical",
        characterId: "responsable-class-d",
        messages: [
          {
            id: "cd4",
            sender: "character",
            text: "Le Directeur n'a pas le sens de l'humour. Notez ça.",
            delaySeconds: 4,
          },
        ],
      },
    },
  },
  {
    id: "infirmier-site",
    characterId: "infirmier-site",
    label: "Infirmerie — Dr. Alvarez",
    entryNodeId: "checkin",
    unlockRequires: OFFICE_LEFT,
    initialDelaySeconds: 5,
    nodes: {
      checkin: {
        id: "checkin",
        characterId: "infirmier-site",
        messages: [
          {
            id: "inf1",
            sender: "character",
            text: "Dr. Alvarez, infirmerie site. Visite médicale obligatoire dans les 48h — créneau auto-assigné.",
            delaySeconds: 5,
          },
          {
            id: "inf2",
            sender: "character",
            text: "Première semaine = fatigue + stress. Buvez de l'eau. Évitez le café du sous-sol.",
            delaySeconds: 3,
          },
        ],
      },
    },
  },
  {
    id: "archiviste-c2",
    characterId: "archiviste-c2",
    label: "Archives — Mme Fontaine",
    entryNodeId: "intro",
    unlockRequires: OFFICE_LEFT,
    initialDelaySeconds: 5,
    nodes: {
      intro: {
        id: "intro",
        characterId: "archiviste-c2",
        messages: [
          {
            id: "ar1",
            sender: "character",
            text: "Fontaine, archives clearance 2. Votre dossier vient d'être numérisé.",
            delaySeconds: 6,
          },
          {
            id: "ar2",
            sender: "character",
            text: "Rappel : la Base SCP sur votre terminal ne contient que ce que votre clearance autorise. Ne cherchez pas les trous.",
            delaySeconds: 4,
          },
        ],
        choices: [
          {
            id: "ok",
            label: "Compris.",
            nextNodeId: "ok_reply",
          },
          {
            id: "holes",
            label: "Et si je trouve un trou par accident ?",
            requires: [{ type: "saga_choice", key: "ch1_briefing_response", value: "curious" }],
            nextNodeId: "holes_reply",
          },
        ],
      },
      ok_reply: {
        id: "ok_reply",
        characterId: "archiviste-c2",
        messages: [
          { id: "ar3", sender: "character", text: "Parfait. Bonne journée.", delaySeconds: 2 },
        ],
      },
      holes_reply: {
        id: "holes_reply",
        characterId: "archiviste-c2",
        messages: [
          {
            id: "ar4",
            sender: "character",
            text: "Vous signalez. Immédiatement. Les curieux sans clearance finissent dans des rapports AEGIS.",
            delaySeconds: 4,
          },
        ],
      },
    },
  },
];
