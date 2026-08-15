import type { DialogueNode } from "../../types/narrative.js";

/** Acte 1 — Bureau du Directeur (scène immersive, hors messagerie) */
export interface DirectorOfficeScene {
  id: string;
  characterId: string;
  entryNodeId: string;
  nodes: Record<string, DialogueNode>;
}

export const CHAPTER_01_DIRECTOR_OFFICE: DirectorOfficeScene = {
  id: "director-office-ch1",
  characterId: "directeur-site",
  entryNodeId: "arrival",
  nodes: {
    arrival: {
      id: "arrival",
      sceneStage: "ambient",
      messages: [
        {
          id: "a1",
          sender: "system",
          text: "Couloir administratif — aile nord. Fluorescents bourdonnants. L'odeur du café froid.",
          delaySeconds: 0,
        },
        {
          id: "a2",
          sender: "system",
          text: "Porte marquée DIRECTEUR DU SITE. Badge clearance 1 : accès accordé.",
          delaySeconds: 3,
        },
        {
          id: "a3",
          sender: "system",
          text: "Bureau spacieux. Écrans éteints. Vue sur les conduits. Le Directeur ne se lève pas — il attend déjà.",
          delaySeconds: 4,
        },
        {
          id: "a3b",
          sender: "system",
          text: "Sur le bureau : un dossier à votre nom. Cachet RH encore humide.",
          delaySeconds: 2,
        },
      ],
      autoNext: "director_intro",
    },
    director_intro: {
      id: "director_intro",
      characterId: "directeur-site",
      sceneStage: "dialogue",
      messages: [
        {
          id: "d1",
          sender: "character",
          text: "{player_name}. Asseyez-vous. Vous êtes le nouveau personnel dont on m'a parlé.",
          delaySeconds: 2,
        },
        {
          id: "d2",
          sender: "character",
          text: "Le Site-12 fonctionne. Les protocoles existent pour une raison. Ne les testez pas votre première semaine.",
          delaySeconds: 4,
        },
        {
          id: "d3",
          sender: "character",
          text: "Briefing collectif demain 08h00 — Salle de conférence B. Présence obligatoire. Votre terminal s'active en sortant.",
          delaySeconds: 3,
        },
        {
          id: "d3b",
          sender: "character",
          text: "Entre-temps, le Site vous testera. Pas avec des épreuves — avec du bruit. Apprenez à trier.",
          delaySeconds: 4,
        },
      ],
      choices: [
        {
          id: "confirm",
          label: "Confirmé. Je serai là.",
          characterEffects: [{ characterId: "directeur-site", trustDelta: 1 }],
          sagaChoice: { key: "ch1_briefing_response", value: "professional" },
          sets: { ch1_directeur_resolved: true, ch1_unlock_mtf_liaison: true },
          nextNodeId: "confirm_reply",
        },
        {
          id: "question",
          label: "De quoi s'agit-il exactement ?",
          characterEffects: [{ characterId: "directeur-site", trustDelta: 0 }],
          sagaChoice: { key: "ch1_briefing_response", value: "curious" },
          sets: { ch1_directeur_resolved: true, ch1_unlock_junior_researcher: true },
          nextNodeId: "curious_reply",
        },
        {
          id: "late",
          label: "Je ne suis pas sûr de pouvoir être là à 8h.",
          characterEffects: [{ characterId: "directeur-site", trustDelta: -1 }],
          sagaChoice: { key: "ch1_briefing_response", value: "reluctant" },
          sets: { ch1_directeur_resolved: true, ch1_unlock_classd_handler: true },
          nextNodeId: "cold_reply",
        },
      ],
    },
    confirm_reply: {
      id: "confirm_reply",
      characterId: "directeur-site",
      sceneStage: "dialogue",
      messages: [
        {
          id: "d4",
          sender: "character",
          text: "Bien. Le Conseil Oméga est informé. La FIM Nu-7 sera représentée au briefing — ne les fixez pas dans les yeux.",
          delaySeconds: 3,
        },
      ],
      autoNext: "dismissal",
    },
    curious_reply: {
      id: "curious_reply",
      characterId: "directeur-site",
      sceneStage: "dialogue",
      messages: [
        {
          id: "d5",
          sender: "character",
          text: "Vous saurez demain. Ce qui est classifié aujourd'hui le restera jusqu'à demain 08h00.",
          delaySeconds: 4,
        },
        {
          id: "d5b",
          sender: "character",
          text: "La curiosité n'est pas un défaut ici. C'est une responsabilité. Apprenez à la canaliser.",
          delaySeconds: 3,
        },
      ],
      autoNext: "dismissal",
    },
    cold_reply: {
      id: "cold_reply",
      characterId: "directeur-site",
      sceneStage: "dialogue",
      messages: [
        {
          id: "d6",
          sender: "character",
          text: "La présence n'est pas une suggestion. Ajustez votre emploi du temps.",
          delaySeconds: 3,
        },
        {
          id: "d6b",
          sender: "character",
          text: "Le superviseur Class-D sera informé de votre… flexibilité horaire.",
          delaySeconds: 4,
        },
      ],
      autoNext: "dismissal",
    },
    dismissal: {
      id: "dismissal",
      characterId: "directeur-site",
      sceneStage: "exit",
      messages: [
        {
          id: "d7",
          sender: "character",
          text: "Retournez à votre poste. Le personnel vous contactera sur le terminal. Ne répondez pas à tout le monde en même temps.",
          delaySeconds: 3,
        },
        {
          id: "d8",
          sender: "system",
          text: "Le Directeur se tourne vers un écran. La réunion est terminée.",
          delaySeconds: 2,
        },
      ],
    },
  },
};
