/** Règles RP REDLAKES — grades, titres, illégal */

export const redlakesRpRules = {
  noLevelSystem:
    "Pas de système de niveaux automatique. Les promotions se méritent par la qualité du RP global, validées par le staff.",
  honoraryTitles:
    "Elite et Prestige sont des titres honorifiques cumulables — le joueur reste Sergent, Caporal ou Soldat. Ce ne sont pas des grades supérieurs.",
  illegalOrgs:
    "Côté illégal : rôles Discord **globaux** (Gang Member, Mafia Don, MC President, Cartel Boss…). Les joueurs fondent leur organisation en RP sans créer de rôle par nom. Le staff attribue le grade adapté + le ping 📢 Réunion CRIME pour les convocations.",
  orgTypes: [
    "Gang de rue (Gang Member / Gang Boss)",
    "Mafia / Famille (Mafia Associate / Mafia Don)",
    "Motorcycle Club (MC Member / MC President)",
    "Cartel (Cartel Runner / Cartel Boss)",
    "Criminel indépendant",
  ],
} as const;

/** Titres honorifiques Site-12 (rôles Discord cosmétiques) */
export const honoraryTitles = [
  {
    emoji: "🏅",
    name: "Elite",
    description:
      "Titre mérité par l'excellence RP. Cumulable avec Sergent, Caporal ou Soldat — ne remplace pas le grade.",
  },
  {
    emoji: "⭐",
    name: "Prestige",
    description:
      "Titre de distinction. Le joueur conserve son grade de base (Caporal, Soldat…).",
  },
] as const;

/** Grades de base sécurité (sans Elite/Prestige dans le nom) */
export const isHonoraryGradeName = (name: string): boolean =>
  /\b(elite|prestige)\b/i.test(name) && !/\bgarde\b/i.test(name);
