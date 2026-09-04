import type { MessageThread } from "../../types/narrative.js";
import type { ScheduledWorldEvent } from "../../types/gns.js";

/**
 * Chapitre IX — Héritage
 * Huit ans de choix convergent. Le Site se souvient — ou pas.
 * Chaque personnage majeur répond au choix qui lui a été associé plus tôt dans la saga.
 */

export const CHAPTER_09_THREADS: MessageThread[] = [
  // ---- Ouverture ----
  {
    id: "directeur-legacy",
    characterId: "directeur-site",
    label: "Directeur — Huit ans plus tard",
    entryNodeId: "open",
    nodes: {
      open: {
        id: "open",
        characterId: "directeur-site",
        messages: [
          {
            id: "o1",
            sender: "character",
            text: "{player_name}. Huit ans. Peu tiennent aussi longtemps au Site-12 sans devenir soit cyniques, soit dangereux.",
            delaySeconds: 5,
          },
        ],
        conditionalAutoNext: [
          {
            requires: [{ type: "saga_choice", key: "ch1_briefing_response", value: "professional" }],
            nodeId: "director_professional",
          },
          {
            requires: [{ type: "saga_choice", key: "ch1_briefing_response", value: "curious" }],
            nodeId: "director_curious",
          },
          {
            requires: [{ type: "saga_choice", key: "ch1_briefing_response", value: "reluctant" }],
            nodeId: "director_reluctant",
          },
        ],
        autoNext: "director_close",
      },
      director_professional: {
        id: "director_professional",
        characterId: "directeur-site",
        messages: [
          {
            id: "o2a",
            sender: "character",
            text: "Vous avez toujours fait ce qu'on vous demandait, exactement comme on vous le demandait. C'est rare. C'est précieux. C'est aussi, parfois, ce qui m'a inquiété.",
            delaySeconds: 5,
          },
        ],
        autoNext: "director_close",
      },
      director_curious: {
        id: "director_curious",
        characterId: "directeur-site",
        messages: [
          {
            id: "o2b",
            sender: "character",
            text: "Vous avez posé des questions pendant huit ans. La plupart des recrues arrêtent au bout d'un mois. Je ne sais toujours pas si je dois vous en remercier.",
            delaySeconds: 5,
          },
        ],
        autoNext: "director_close",
      },
      director_reluctant: {
        id: "director_reluctant",
        characterId: "directeur-site",
        messages: [
          {
            id: "o2c",
            sender: "character",
            text: "Vous avez commencé réticent. Vous êtes resté prudent. Au Site-12, la prudence tient plus longtemps que la loyauté aveugle.",
            delaySeconds: 5,
          },
        ],
        autoNext: "director_close",
      },
      director_close: {
        id: "director_close",
        characterId: "directeur-site",
        messages: [
          {
            id: "o3",
            sender: "character",
            text: "Le Conseil Oméga referme le dossier Projet ████ cette semaine. Officiellement. Vous savez ce que ça veut dire, ici.",
            delaySeconds: 5,
          },
        ],
        onEnterSets: { ch9_director_echo_done: true },
      },
    },
  },

  // ---- Écho Dr. Chen (payoff table OUTLINE.md) ----
  {
    id: "chen-legacy",
    characterId: "dr-chen",
    label: "Dr. Chen — Héritage",
    unlockRequires: [{ type: "flag", key: "ch9_director_echo_done", value: true }],
    initialDelaySeconds: 20,
    entryNodeId: "route",
    nodes: {
      route: {
        id: "route",
        characterId: "dr-chen",
        messages: [],
        conditionalAutoNext: [
          {
            requires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", value: "saved" }],
            nodeId: "chen_saved_legacy",
          },
          {
            requires: [{ type: "saga_choice", key: "ch1_dr_chen_fate", value: "reported" }],
            nodeId: "chen_reported_legacy",
          },
        ],
        autoNext: "chen_ignored_legacy",
      },
      chen_saved_legacy: {
        id: "chen_saved_legacy",
        characterId: "dr-chen",
        messages: [
          {
            id: "c9-1a",
            sender: "character",
            text: "Huit ans, {player_name}. Mon fils fait actuellement ses classes en sécurité générale, ici même. Il ne sait pas que c'est vous qui avez rendu ça possible. Je le lui dirai un jour.",
            delaySeconds: 6,
          },
          {
            id: "c9-1a2",
            sender: "character",
            text: "Directrice adjointe, protégée par une promesse tenue il y a huit ans. Ça vaut toutes les archives du monde.",
            delaySeconds: 5,
          },
        ],
        autoNext: "chen_echo_done",
      },
      chen_reported_legacy: {
        id: "chen_reported_legacy",
        characterId: "rh-terminal",
        messages: [
          {
            id: "c9-1b",
            sender: "character",
            text: "NOTE ARCHIVES — Dr. Mei Chen, transférée en 2027, aucune activité enregistrée depuis. Dossier clos, non consulté depuis six ans.",
            delaySeconds: 5,
          },
        ],
        autoNext: "chen_echo_done",
      },
      chen_ignored_legacy: {
        id: "chen_ignored_legacy",
        characterId: "rh-terminal",
        messages: [
          {
            id: "c9-1c",
            sender: "character",
            text: "NOTE ARCHIVES — Dr. Mei Chen, portée disparue en 2026, quelques semaines après votre intégration. Aucune enquête n'a abouti. Le dossier a été fermé faute d'éléments.",
            delaySeconds: 6,
          },
          {
            id: "c9-1c2",
            sender: "system",
            text: "Personne au Site-12 ne mentionne plus son nom.",
            delaySeconds: 3,
          },
        ],
        autoNext: "chen_echo_done",
      },
      chen_echo_done: {
        id: "chen_echo_done",
        characterId: "rh-terminal",
        messages: [],
        onEnterSets: { ch9_chen_echo_done: true },
      },
    },
  },

  // ---- Écho AEGIS ----
  {
    id: "aegis-legacy",
    characterId: "inspecteur-aegis",
    label: "Inspecteur [CENSURÉ] — Bilan",
    unlockRequires: [{ type: "flag", key: "ch9_chen_echo_done", value: true }],
    initialDelaySeconds: 15,
    entryNodeId: "route",
    nodes: {
      route: {
        id: "route",
        characterId: "inspecteur-aegis",
        messages: [],
        conditionalAutoNext: [
          {
            requires: [{ type: "saga_choice", key: "ch5_aegis_cooperation", value: "full_disclosure" }],
            nodeId: "aegis_full",
          },
          {
            requires: [{ type: "saga_choice", key: "ch5_aegis_cooperation", value: "foundation_line" }],
            nodeId: "aegis_line",
          },
          {
            requires: [{ type: "saga_choice", key: "ch5_aegis_cooperation", value: "selective" }],
            nodeId: "aegis_selective",
          },
        ],
        autoNext: "aegis_close",
      },
      aegis_full: {
        id: "aegis_full",
        characterId: "inspecteur-aegis",
        messages: [
          {
            id: "ae1a",
            sender: "character",
            text: "Vous avez été mon meilleur contact interne au Site-12 pendant huit ans. Ça vous a coûté des amitiés. Ça a évité au moins deux catastrophes. Je ne sais pas si c'était un bon échange pour vous.",
            delaySeconds: 6,
          },
        ],
        autoNext: "aegis_close",
      },
      aegis_line: {
        id: "aegis_line",
        characterId: "inspecteur-aegis",
        messages: [
          {
            id: "ae1b",
            sender: "character",
            text: "Vous n'avez jamais rien dit d'utile en huit ans. J'ai fini par arrêter de vous poser des questions. Votre Fondation a bien de la chance de vous compter parmi les siens.",
            delaySeconds: 6,
          },
        ],
        autoNext: "aegis_close",
      },
      aegis_selective: {
        id: "aegis_selective",
        characterId: "inspecteur-aegis",
        messages: [
          {
            id: "ae1c",
            sender: "character",
            text: "Toujours juste assez. Jamais trop. Je n'ai jamais réussi à savoir de quel côté vous étiez vraiment. C'est probablement pour ça que vous êtes encore là.",
            delaySeconds: 6,
          },
        ],
        autoNext: "aegis_close",
      },
      aegis_close: {
        id: "aegis_close",
        characterId: "inspecteur-aegis",
        messages: [],
        onEnterSets: { ch9_aegis_echo_done: true },
      },
    },
  },

  // ---- Écho Moretti ----
  {
    id: "moretti-legacy",
    characterId: "chef-moretti",
    label: "Vincent Moretti — Solde de tout compte",
    unlockRequires: [{ type: "flag", key: "ch9_aegis_echo_done", value: true }],
    initialDelaySeconds: 15,
    entryNodeId: "route",
    nodes: {
      route: {
        id: "route",
        characterId: "chef-moretti",
        messages: [],
        conditionalAutoNext: [
          {
            requires: [{ type: "saga_choice", key: "ch3_moretti_deal", value: "accepted" }],
            nodeId: "moretti_accepted",
          },
          {
            requires: [{ type: "saga_choice", key: "ch3_moretti_deal", value: "reported" }],
            nodeId: "moretti_reported",
          },
          {
            requires: [{ type: "saga_choice", key: "ch3_moretti_deal", value: "refused" }],
            nodeId: "moretti_refused",
          },
        ],
        autoNext: "moretti_close",
      },
      moretti_accepted: {
        id: "moretti_accepted",
        characterId: "chef-moretti",
        messages: [
          {
            id: "m9-1a",
            sender: "character",
            text: "Huit ans d'accord tacite. Ni vous ni moi n'avons jamais tout dit à nos supérieurs respectifs. C'est ce qu'on appelle, je crois, une relation de confiance.",
            delaySeconds: 6,
          },
        ],
        autoNext: "moretti_close",
      },
      moretti_reported: {
        id: "moretti_reported",
        characterId: "chef-moretti",
        messages: [
          {
            id: "m9-1b",
            sender: "character",
            text: "Ce numéro n'a plus jamais existé, comme promis. Mais j'ai retenu votre nom. On retient toujours le nom de ceux qui refusent poliment.",
            delaySeconds: 6,
          },
        ],
        autoNext: "moretti_close",
      },
      moretti_refused: {
        id: "moretti_refused",
        characterId: "chef-moretti",
        messages: [
          {
            id: "m9-1c",
            sender: "character",
            text: "Vous avez refusé, et pourtant nous n'avons jamais eu de vrai conflit. Un point pour votre Fondation. Un seul.",
            delaySeconds: 6,
          },
        ],
        autoNext: "moretti_close",
      },
      moretti_close: {
        id: "moretti_close",
        characterId: "chef-moretti",
        messages: [],
        onEnterSets: { ch9_moretti_echo_done: true },
      },
    },
  },

  // ---- Écho Initié Serpent ----
  {
    id: "serpent-legacy",
    characterId: "initie-serpent",
    label: "??? — Ce qui reste enterré",
    unlockRequires: [{ type: "flag", key: "ch9_moretti_echo_done", value: true }],
    initialDelaySeconds: 15,
    entryNodeId: "route",
    nodes: {
      route: {
        id: "route",
        characterId: "initie-serpent",
        messages: [],
        conditionalAutoNext: [
          {
            requires: [{ type: "saga_choice", key: "ch4_serpent_encounter", value: "seize" }],
            nodeId: "serpent_seize",
          },
          {
            requires: [{ type: "saga_choice", key: "ch4_serpent_encounter", value: "negotiate" }],
            nodeId: "serpent_negotiate",
          },
        ],
        autoNext: "serpent_retreat",
      },
      serpent_seize: {
        id: "serpent_seize",
        characterId: "initie-serpent",
        messages: [
          {
            id: "s9-1a",
            sender: "character",
            text: "L'objet que vous avez pris dort encore dans vos coffres, clearance 3, inutile à quiconque. Nous avons attendu huit ans de plus. Nous savons attendre.",
            delaySeconds: 6,
          },
        ],
        autoNext: "serpent_close",
      },
      serpent_negotiate: {
        id: "serpent_negotiate",
        characterId: "initie-serpent",
        messages: [
          {
            id: "s9-1b",
            sender: "character",
            text: "Vous avez laissé l'objet où il devait rester. Peu des vôtres comprennent que certaines choses ne sont pas faites pour être possédées.",
            delaySeconds: 6,
          },
        ],
        autoNext: "serpent_close",
      },
      serpent_retreat: {
        id: "serpent_retreat",
        characterId: "initie-serpent",
        messages: [
          {
            id: "s9-1c",
            sender: "character",
            text: "Vous avez reculé, il y a huit ans. Nous n'avons plus eu de raison de nous reparler. C'est peut-être la meilleure issue possible.",
            delaySeconds: 6,
          },
        ],
        autoNext: "serpent_close",
      },
      serpent_close: {
        id: "serpent_close",
        characterId: "initie-serpent",
        messages: [],
        onEnterSets: { ch9_serpent_echo_done: true },
      },
    },
  },

  // ---- Choix final ----
  {
    id: "ch9-legacy-choice",
    characterId: "directeur-site",
    label: "Directeur — Dernier rapport",
    unlockRequires: [{ type: "flag", key: "ch9_serpent_echo_done", value: true }],
    initialDelaySeconds: 20,
    entryNodeId: "final_choice",
    nodes: {
      final_choice: {
        id: "final_choice",
        characterId: "directeur-site",
        messages: [
          {
            id: "fc1",
            sender: "character",
            text: "Huit ans de dossier. Un dernier rapport, et le vôtre est officiellement clos — quelle que soit votre décision.",
            delaySeconds: 5,
          },
          {
            id: "fc2",
            sender: "character",
            text: "Le Projet ████, l'audit AEGIS, Keter-02, tout ce que vous savez : que faites-vous de huit ans de silences accumulés ?",
            delaySeconds: 5,
          },
        ],
        choices: [
          {
            id: "reveal",
            label: "Je transmets tout à A.E.G.I.S., sans filtre.",
            sagaChoice: { key: "ch9_legacy_choice", value: "reveal_everything" },
            sets: { ch9_pivot_resolved: true, ch9_revealed: true },
            nextNodeId: "reveal_reply",
          },
          {
            id: "protect",
            label: "Je protège le Site. Le silence a un prix, je le paierai.",
            sagaChoice: { key: "ch9_legacy_choice", value: "protect_the_site" },
            sets: { ch9_pivot_resolved: true, ch9_protected: true },
            nextNodeId: "protect_reply",
          },
          {
            id: "leave",
            label: "Je demande ma réaffectation. Huit ans, ça suffit.",
            sagaChoice: { key: "ch9_legacy_choice", value: "walk_away" },
            sets: { ch9_pivot_resolved: true, ch9_left: true },
            nextNodeId: "leave_reply",
          },
        ],
      },
      reveal_reply: {
        id: "reveal_reply",
        characterId: "directeur-site",
        messages: [
          {
            id: "fc3a",
            sender: "character",
            text: "Alors ce n'est plus mon rapport à écrire. C'est le vôtre, désormais. J'espère que vous êtes prêt pour ce que ça va coûter — à vous, pas à moi.",
            delaySeconds: 5,
          },
        ],
        autoNext: "epilogue_lead_in",
      },
      protect_reply: {
        id: "protect_reply",
        characterId: "directeur-site",
        messages: [
          {
            id: "fc3b",
            sender: "character",
            text: "Bienvenue au club de ceux qui portent le Site sur leurs épaules sans le dire à personne. Ce n'est pas un compliment. C'est une reconnaissance.",
            delaySeconds: 5,
          },
        ],
        autoNext: "epilogue_lead_in",
      },
      leave_reply: {
        id: "leave_reply",
        characterId: "directeur-site",
        messages: [
          {
            id: "fc3c",
            sender: "character",
            text: "Réaffectation accordée. Le Site continuera sans vous — il continue toujours. Mais il se souviendra que vous êtes parti en ayant tout vu, et sans rien dire.",
            delaySeconds: 5,
          },
        ],
        autoNext: "epilogue_lead_in",
      },
      epilogue_lead_in: {
        id: "epilogue_lead_in",
        characterId: "directeur-site",
        messages: [],
        onEnterSets: { ch9_epilogue_ready: true },
      },
    },
  },
  {
    id: "ch9-closure",
    characterId: "rh-terminal",
    label: "RH — Clôture de dossier",
    unlockRequires: [{ type: "flag", key: "ch9_epilogue_ready", value: true }],
    initialDelaySeconds: 15,
    entryNodeId: "closure",
    nodes: {
      closure: {
        id: "closure",
        characterId: "rh-terminal",
        messages: [
          {
            id: "c9-1",
            sender: "character",
            text: "DOSSIER {employee_id} — Huit ans de service au Site-12. Clos.",
            delaySeconds: 3,
          },
          {
            id: "c9-2",
            sender: "character",
            text: "REDLAKES TERMINAL IX — Héritage : terminé.\n\nConsultez les Archives héritées pour la synthèse complète de votre saga.",
            delaySeconds: 3,
          },
          {
            id: "c9-3",
            sender: "character",
            text: "Fin de la saga — v1. Le Site continue. Merci d'y avoir été, un temps, quelqu'un.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch9_complete: true },
        completeChapter: true,
      },
    },
  },
];

export const CHAPTER_09_OFFLINE_EVENTS: ScheduledWorldEvent[] = [];
