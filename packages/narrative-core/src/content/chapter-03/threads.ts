import type { MessageThread } from "../../types/narrative.js";

/**
 * Chapitre III — Surface
 * Première mission hors Site-12. REDLAKES la nuit. Moretti observe la Fondation.
 * Reflète le sort de Dr. Chen choisi au Ch.I (promue / transférée / disparue des radars).
 */

export const CHAPTER_03_THREADS: MessageThread[] = [
  // ---- Acte I — briefing + écho Dr. Chen ----
  {
    id: "directeur-ch3-briefing",
    characterId: "directeur-site",
    label: "Directeur — Mission Surface",
    entryNodeId: "brief",
    nodes: {
      brief: {
        id: "brief",
        characterId: "directeur-site",
        messages: [
          {
            id: "d1",
            sender: "character",
            text: "{player_name}. Première sortie hors du Site. Liaison discrète en ville — REDLAKES a des yeux qui ne devraient pas être là.",
            delaySeconds: 5,
          },
          {
            id: "d2",
            sender: "character",
            text: "Contact terrain : Agent Parker, déjà sur place. Vous êtes en soutien, pas en tête. Ne l'oubliez pas.",
            delaySeconds: 4,
          },
        ],
        autoNext: "chen_status_router",
      },
      chen_status_router: {
        id: "chen_status_router",
        characterId: "directeur-site",
        messages: [],
        conditionalAutoNext: [
          {
            requires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", value: "saved" }],
            nodeId: "chen_promoted",
          },
          {
            requires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", value: "reported" }],
            nodeId: "chen_transferred",
          },
          {
            requires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", value: "ignored" }],
            nodeId: "chen_vanished",
          },
        ],
        autoNext: "chen_vanished",
      },
      chen_promoted: {
        id: "chen_promoted",
        characterId: "directeur-site",
        messages: [
          {
            id: "d3a",
            sender: "character",
            text: "Autre chose : Dr. Chen est promue Directrice adjointe, secteur Recherche. Son rapport Euclid-7 a pesé plus que prévu.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch3_chen_promoted: true },
        autoNext: "mission_start",
      },
      chen_transferred: {
        id: "chen_transferred",
        characterId: "directeur-site",
        messages: [
          {
            id: "d3b",
            sender: "character",
            text: "Dr. Chen a été transférée en surveillance renforcée, secteur Recherche annexe. Conséquence de votre signalement. Ce n'est pas une punition — officiellement.",
            delaySeconds: 4,
          },
        ],
        autoNext: "mission_start",
      },
      chen_vanished: {
        id: "chen_vanished",
        characterId: "directeur-site",
        messages: [
          {
            id: "d3c",
            sender: "character",
            text: "Dr. Chen n'apparaît plus dans les rapports d'activité récents. Personne ne semble s'en inquiéter. Vous non plus, apparemment.",
            delaySeconds: 4,
          },
        ],
        autoNext: "mission_start",
      },
      mission_start: {
        id: "mission_start",
        characterId: "directeur-site",
        messages: [
          {
            id: "d4",
            sender: "character",
            text: "Rendez-vous avec l'Agent Parker sur votre messagerie. Restez discret. Ce n'est pas le Site-12 ici — personne ne vous couvre.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch3_briefing_done: true },
      },
    },
  },

  // ---- Acte II — pivot : contact Moretti ----
  {
    id: "agent-parker-liaison",
    characterId: "agent-parker",
    label: "Agent Parker — Terrain",
    unlockRequires: [{ type: "flag", key: "ch3_briefing_done", value: true }],
    initialDelaySeconds: 5,
    entryNodeId: "contact",
    nodes: {
      contact: {
        id: "contact",
        characterId: "agent-parker",
        messages: [
          {
            id: "p1",
            sender: "character",
            text: "Parker. Vous êtes la « liaison discrète » ? On m'avait promis quelqu'un de plus discret.",
            delaySeconds: 5,
          },
          {
            id: "p2",
            sender: "character",
            text: "Zone industrielle, quartier sud. Famille Moretti y fait tourner deux entrepôts. On observe, on ne s'approche pas.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch3_parker_met: true },
      },
    },
  },
  {
    id: "moretti-contact",
    characterId: "chef-moretti",
    label: "Numéro inconnu",
    unlockRequires: [{ type: "flag", key: "ch3_parker_met", value: true }],
    initialDelaySeconds: 25,
    entryNodeId: "approach",
    nodes: {
      approach: {
        id: "approach",
        characterId: "chef-moretti",
        messages: [
          {
            id: "m1",
            sender: "character",
            text: "Ce numéro ne devrait pas avoir le vôtre. Et pourtant.",
            delaySeconds: 5,
          },
          {
            id: "m2",
            sender: "character",
            text: "Vincent Moretti. Je sais qui vous êtes, qui vous employez, et ce qu'il y a sous vos pieds au Site-12. Je propose un échange, pas une menace.",
            delaySeconds: 5,
          },
          {
            id: "m3",
            sender: "character",
            text: "J'ai un nom. Quelqu'un chez vous qui me vend des informations depuis six mois. En retour, j'aimerais que Parker regarde ailleurs, une nuit, la semaine prochaine.",
            delaySeconds: 5,
          },
        ],
        choices: [
          {
            id: "accept",
            label: "Donnez-moi le nom. On verra pour le reste.",
            sagaChoice: { key: "ch3_moretti_deal", value: "accepted" },
            characterEffects: [{ characterId: "chef-moretti", trustDelta: 2, addNote: "made_deal_ch3" }],
            sets: { ch3_moretti_deal_made: true, ch3_pivot_resolved: true },
            nextNodeId: "accept_reply",
          },
          {
            id: "refuse",
            label: "Je ne négocie pas avec vous. Trouvez un autre canal.",
            sagaChoice: { key: "ch3_moretti_deal", value: "refused" },
            characterEffects: [{ characterId: "chef-moretti", trustDelta: -1 }],
            sets: { ch3_pivot_resolved: true },
            nextNodeId: "refuse_reply",
          },
          {
            id: "report",
            label: "[Ne pas répondre] Signaler ce contact à la Fondation.",
            sagaChoice: { key: "ch3_moretti_deal", value: "reported" },
            characterEffects: [{ characterId: "chef-moretti", trustDelta: -2, addNote: "reported_moretti_ch3" }],
            sets: { ch3_moretti_reported: true, ch3_pivot_resolved: true },
            nextNodeId: "report_reply",
          },
        ],
      },
      accept_reply: {
        id: "accept_reply",
        characterId: "chef-moretti",
        messages: [
          {
            id: "m4a",
            sender: "character",
            text: "Intelligent. Le nom vous parviendra. Je tiens toujours parole — demandez à ceux qui la trahissent ce qu'il leur en coûte.",
            delaySeconds: 5,
          },
        ],
      },
      refuse_reply: {
        id: "refuse_reply",
        characterId: "chef-moretti",
        messages: [
          {
            id: "m4b",
            sender: "character",
            text: "Dommage. J'aurais préféré ne pas avoir à trouver un autre point d'entrée chez vous.",
            delaySeconds: 5,
          },
        ],
      },
      report_reply: {
        id: "report_reply",
        characterId: "chef-moretti",
        messages: [
          {
            id: "m4c",
            sender: "character",
            text: "Amnésiques, votre service ? Ce numéro n'a jamais existé. Bonne chance pour l'expliquer à votre Directeur.",
            delaySeconds: 4,
            deleted: true,
          },
        ],
      },
    },
  },

  // ---- Acte III — retombées ----
  {
    id: "securite-moretti-fallout",
    characterId: "rh-terminal",
    label: "Sécurité — Suivi",
    unlockRequires: [{ type: "flag", key: "ch3_moretti_reported", value: true }],
    initialDelaySeconds: 20,
    entryNodeId: "fallout",
    nodes: {
      fallout: {
        id: "fallout",
        characterId: "rh-terminal",
        messages: [
          {
            id: "sf1",
            sender: "character",
            text: "Contact externe signalé — dossier ouvert. Numéro non identifiable. Aucune trace de fuite interne confirmée à ce stade.",
            delaySeconds: 3,
          },
        ],
      },
    },
  },
  {
    id: "parker-debrief",
    characterId: "agent-parker",
    label: "Agent Parker — Debrief",
    unlockRequires: [{ type: "flag", key: "ch3_pivot_resolved", value: true }],
    initialDelaySeconds: 40,
    entryNodeId: "debrief",
    nodes: {
      debrief: {
        id: "debrief",
        characterId: "agent-parker",
        messages: [
          {
            id: "p3",
            sender: "character",
            text: "Rien de plus à observer cette nuit. On rentre. Vous avez fait quoi de votre côté, exactement ?",
            delaySeconds: 4,
          },
        ],
        choices: [
          {
            id: "tell",
            label: "Moretti m'a contacté directement.",
            requires: [{ type: "saga_choice", key: "ch3_moretti_deal", op: "exists" }],
            characterEffects: [{ characterId: "agent-parker", trustDelta: 1 }],
            nextNodeId: "tell_reply",
          },
          {
            id: "silent",
            label: "Rien à signaler.",
            nextNodeId: "silent_reply",
          },
        ],
      },
      tell_reply: {
        id: "tell_reply",
        characterId: "agent-parker",
        messages: [
          {
            id: "p4a",
            sender: "character",
            text: "Directement ? Il ne fait jamais ça sans raison. Ça va dans mon rapport, avec votre nom dessus.",
            delaySeconds: 4,
          },
        ],
        autoNext: "closure_lead_in",
      },
      silent_reply: {
        id: "silent_reply",
        characterId: "agent-parker",
        messages: [
          { id: "p4b", sender: "character", text: "Comme vous voulez. Direction Site-12.", delaySeconds: 3 },
        ],
        autoNext: "closure_lead_in",
      },
      closure_lead_in: {
        id: "closure_lead_in",
        characterId: "agent-parker",
        messages: [],
        onEnterSets: { ch3_mission_done: true },
      },
    },
  },
  {
    id: "ch3-closure",
    characterId: "rh-terminal",
    label: "RH — Fin de mission",
    unlockRequires: [{ type: "flag", key: "ch3_mission_done", value: true }],
    initialDelaySeconds: 15,
    entryNodeId: "closure",
    nodes: {
      closure: {
        id: "closure",
        characterId: "rh-terminal",
        messages: [
          { id: "c3-1", sender: "character", text: "MISSION SURFACE — Rapport clos.", delaySeconds: 2 },
          {
            id: "c3-2",
            sender: "character",
            text: "REDLAKES TERMINAL III — Surface : terminé.\n\nVos choix sont archivés dans la Global Narrative Save.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch3_complete: true },
        completeChapter: true,
      },
    },
  },
];

export const CHAPTER_03_OFFLINE_EVENTS = [
  {
    id: "ch3-moretti-watch",
    triggerAfterSeconds: 40,
    requiresFlags: ["ch3_moretti_deal_made"],
    effect: { type: "set_flag" as const, flag: "ch3_moretti_watching", value: true },
  },
];
