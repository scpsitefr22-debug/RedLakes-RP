/**
 * Définitions courtes du jargon RP — affichées via <JargonTooltip term="..." />
 * à côté des termes dans le dashboard et REDLAKES CORE, pour les nouveaux
 * joueurs qui découvrent le site sans connaître le vocabulaire.
 */
export const glossary = {
  grade: "Ton rang ou poste au sein de ta faction (ex : Scientifique, Agent, Directeur). Il détermine tes accès et ton salaire.",
  faction: "L'organisation à laquelle appartient ton personnage (Fondation SCP, Police, AEGIS, Gouvernement...).",
  departement: "Le service précis dans lequel tu travailles au sein de ta faction (ex : Sécurité, Recherche, Maintenance).",
  equipe: "Un sous-groupe au sein d'un département (ex : une escouade FIM), avec ses propres membres.",
  rapport: "Un document RP que tu rédiges pour ta hiérarchie (incident, demande, mémo...) — ta faction le reçoit et peut y répondre.",
  clearance: "Ton niveau d'accès aux informations classifiées — plus il est élevé, plus tu peux consulter de contenu sensible.",
  core: "L'espace numérique RP de ton personnage une fois connecté — un peu comme le bureau virtuel de ton personnage.",
  personnage: "Ton identité RP — un compte peut avoir plusieurs personnages, mais un seul est actif à la fois.",
  reputation: "Une note globale (sur 100) qui reflète le comportement RP de ton personnage au fil du temps.",
  sanction: "Une mesure disciplinaire RP enregistrée sur le dossier de ton personnage (avertissement, mise à pied...).",
} as const;

export type GlossaryTerm = keyof typeof glossary;
