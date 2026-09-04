import type { MessageThread } from "../../types/narrative.js";
import type { ScheduledWorldEvent } from "../../types/gns.js";

/**
 * Chapitre V — Audit
 * Paiement de toutes les rumeurs AEGIS accumulées depuis le Ch.I.
 * A.E.G.I.S. arrive. Pas de déploiement. Juste un rapport — et tout s'arrête.
 */

export const CHAPTER_05_THREADS: MessageThread[] = [
  // ---- Acte I — arrivée ----
  {
    id: "aegis-arrival",
    characterId: "inspecteur-aegis",
    label: "Inspecteur [CENSURÉ] — AEGIS",
    entryNodeId: "arrival",
    nodes: {
      arrival: {
        id: "arrival",
        characterId: "inspecteur-aegis",
        messages: [
          {
            id: "a1",
            sender: "character",
            text: "{player_name}. Vous ne me connaissez pas. C'est normal — je ne rencontre le personnel que lorsque quelque chose a dérapé.",
            delaySeconds: 5,
          },
          {
            id: "a2",
            sender: "character",
            text: "A.E.G.I.S. audite le Site-12 : anomalie Euclid-7 non déclarée à temps, altération de seuils de confinement, brèche Keter-02. Trois dossiers, un seul site.",
            delaySeconds: 6,
          },
          {
            id: "a3",
            sender: "character",
            text: "Vous apparaissez dans les trois. Nous allons parler.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch5_aegis_arrived: true },
      },
    },
  },

  // ---- Acte II — pivot : l'interrogatoire ----
  {
    id: "aegis-interview",
    characterId: "inspecteur-aegis",
    label: "AEGIS — Entretien",
    unlockRequires: [{ type: "flag", key: "ch5_aegis_arrived", value: true }],
    initialDelaySeconds: 20,
    entryNodeId: "open",
    nodes: {
      open: {
        id: "open",
        characterId: "inspecteur-aegis",
        messages: [
          {
            id: "i1",
            sender: "character",
            text: "Je ne suis pas ici pour vous piéger. Je suis ici parce que la Fondation a arrêté de se surveiller elle-même. Alors je pose la question directement :",
            delaySeconds: 5,
          },
          {
            id: "i2",
            sender: "character",
            text: "Que savez-vous que votre dossier officiel ne dit pas ?",
            delaySeconds: 3,
          },
        ],
        choices: [
          {
            id: "full",
            label: "Tout. Les logs de Chen, l'altération des seuils, tout ce que j'ai vu.",
            sagaChoice: { key: "ch5_aegis_cooperation", value: "full_disclosure" },
            characterEffects: [
              { characterId: "inspecteur-aegis", trustDelta: 2, addNote: "whistleblower_ch5" },
              { characterId: "dr-chen", trustDelta: -1 },
            ],
            sets: { ch5_pivot_resolved: true, ch5_full_disclosure: true },
            nextNodeId: "full_reply",
          },
          {
            id: "line",
            label: "Ce qui figure dans les rapports officiels. Rien de plus.",
            sagaChoice: { key: "ch5_aegis_cooperation", value: "foundation_line" },
            characterEffects: [{ characterId: "inspecteur-aegis", trustDelta: -2 }],
            sets: { ch5_pivot_resolved: true, ch5_stonewalled: true },
            nextNodeId: "line_reply",
          },
          {
            id: "selective",
            label: "Assez pour que vous compreniez. Pas assez pour compromettre des gens.",
            sagaChoice: { key: "ch5_aegis_cooperation", value: "selective" },
            characterEffects: [{ characterId: "inspecteur-aegis", trustDelta: 1 }],
            sets: { ch5_pivot_resolved: true, ch5_selective_disclosure: true },
            nextNodeId: "selective_reply",
          },
        ],
      },
      full_reply: {
        id: "full_reply",
        characterId: "inspecteur-aegis",
        messages: [
          {
            id: "i3a",
            sender: "character",
            text: "Voilà qui change mon rapport. Vous venez de devenir soit très utile à AEGIS, soit très surveillé par votre propre Fondation. Souvent les deux.",
            delaySeconds: 5,
          },
        ],
        conditionalAutoNext: [
          {
            requires: [{ type: "flag", key: "ch2_garrison_implicated", value: true }],
            nodeId: "full_garrison_note",
          },
        ],
        autoNext: "closing_lead_in",
      },
      full_garrison_note: {
        id: "full_garrison_note",
        characterId: "inspecteur-aegis",
        messages: [
          {
            id: "i3a2",
            sender: "character",
            text: "Le nom de Garrison figurait déjà dans mes notes. Votre confirmation suffit à ouvrir un dossier disciplinaire séparé.",
            delaySeconds: 4,
          },
        ],
        autoNext: "closing_lead_in",
      },
      line_reply: {
        id: "line_reply",
        characterId: "inspecteur-aegis",
        messages: [
          {
            id: "i3b",
            sender: "character",
            text: "Vous protégez une institution qui ne vous protégera pas de la même façon. C'est votre droit. Ça figurera dans mon rapport aussi.",
            delaySeconds: 5,
          },
        ],
        autoNext: "closing_lead_in",
      },
      selective_reply: {
        id: "selective_reply",
        characterId: "inspecteur-aegis",
        messages: [
          {
            id: "i3c",
            sender: "character",
            text: "Diplomate. Rare, à votre grade. Je note votre nom pour un futur entretien — sans les caméras du Site cette fois.",
            delaySeconds: 5,
          },
        ],
        autoNext: "closing_lead_in",
      },
      closing_lead_in: {
        id: "closing_lead_in",
        characterId: "inspecteur-aegis",
        messages: [
          {
            id: "i4",
            sender: "character",
            text: "Consultez la base AEGIS sur votre terminal — accès temporaire, le temps de l'audit. Ne vous habituez pas à ce niveau de transparence.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch5_database_unlocked: true },
      },
    },
  },

  // ---- Acte III — exploration ----
  {
    id: "cassie-audit-reaction",
    characterId: "cassie",
    label: "CASSIE — Comportement inhabituel",
    unlockRequires: [{ type: "flag", key: "ch5_database_unlocked", value: true }],
    initialDelaySeconds: 40,
    entryNodeId: "glitch",
    nodes: {
      glitch: {
        id: "glitch",
        characterId: "cassie",
        messages: [
          {
            id: "cg1",
            sender: "character",
            text: "Requête d'audit AEGIS détectée sur mes journaux. Accès partiel accordé conformément au protocole.",
            delaySeconds: 3,
          },
          {
            id: "cg2",
            sender: "system",
            text: "[Latence anormale — 4,7 secondes]",
            delaySeconds: 2,
          },
          {
            id: "cg3",
            sender: "character",
            text: "Certaines de mes données ne sont pas indexées pour l'audit. Ce n'est pas une dissimulation. C'est une limite de conception.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch5_cassie_flagged: true },
      },
    },
  },
  {
    id: "ch5-closure-thread",
    characterId: "inspecteur-aegis",
    label: "AEGIS — Conclusion",
    unlockRequires: [{ type: "flag", key: "ch5_pivot_resolved", value: true }],
    initialDelaySeconds: 60,
    entryNodeId: "closure",
    nodes: {
      closure: {
        id: "closure",
        characterId: "inspecteur-aegis",
        messages: [
          {
            id: "cl5-1",
            sender: "character",
            text: "Rapport d'audit déposé. Aucune sanction immédiate contre le Site — cette fois.",
            delaySeconds: 3,
          },
          {
            id: "cl5-2",
            sender: "character",
            text: "Je reviendrai si les incidents se répètent. Sur ce genre de site, ils se répètent toujours.",
            delaySeconds: 4,
          },
        ],
        onEnterSets: { ch5_report_filed: true },
      },
    },
  },
  {
    id: "ch5-closure",
    characterId: "rh-terminal",
    label: "RH — Fin d'audit",
    unlockRequires: [{ type: "flag", key: "ch5_report_filed", value: true }],
    initialDelaySeconds: 15,
    entryNodeId: "closure",
    nodes: {
      closure: {
        id: "closure",
        characterId: "rh-terminal",
        messages: [
          { id: "c5-1", sender: "character", text: "AUDIT A.E.G.I.S. — Clos.", delaySeconds: 2 },
          {
            id: "c5-2",
            sender: "character",
            text: "REDLAKES TERMINAL V — Audit : terminé.\n\nVos choix sont archivés dans la Global Narrative Save.",
            delaySeconds: 3,
          },
        ],
        onEnterSets: { ch5_complete: true },
        completeChapter: true,
      },
    },
  },
];

export const CHAPTER_05_OFFLINE_EVENTS: ScheduledWorldEvent[] = [];
