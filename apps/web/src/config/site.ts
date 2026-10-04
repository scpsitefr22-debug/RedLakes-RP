export const siteConfig = {
  serverOpen: false,
  serverIp: "play.redlakes.fr",
  openingMessage:
    "Le serveur Minecraft ouvre prochainement. L'encyclopédie est accessible dès maintenant.",
  discordInvite: "https://discord.gg/d5DqcZEJkn",
  discordLabel: "Discord REDLAKES",
  recruitmentOpen: true,
  /** Liaison Discord (mecanisme technique de connexion) — creation du compte REDLAKES et vecu joueur presentes comme "lier Discord d'abord", cf. /connexion et /bienvenue */
  discordOAuthEnabled: true,
  /** Accès technique dev-login — jamais affiché en production (l'API le refuse de toute façon) */
  devLoginEnabled: process.env.NODE_ENV !== "production",
};
