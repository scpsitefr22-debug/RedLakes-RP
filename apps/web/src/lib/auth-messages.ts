import { siteConfig } from "@/config/site";

export const authErrorMessages: Record<string, { title: string; body: string }> = {
  discord_not_member: {
    title: "Serveur Discord requis",
    body:
      "Votre compte Discord n'est pas membre du serveur REDLAKES. " +
      "Rejoignez le Discord puis reessayez la connexion.",
  },
  discord_not_linked: {
    title: "Dossier non rattache",
    body:
      "Votre identite Discord n'est pas liee a un dossier Site-12. " +
      "Connectez-vous sur le serveur Minecraft, puis utilisez /link sur Discord " +
      "avec le code genere depuis votre tableau de bord (apres une premiere connexion technique).",
  },
  discord_not_configured: {
    title: "Protocole Discord inactif",
    body:
      "L'authentification Discord n'est pas configuree sur l'API. " +
      "Renseignez DISCORD_CLIENT_ID et DISCORD_CLIENT_SECRET dans apps/api/.env.",
  },
  discord_oauth_denied: {
    title: "Acces refuse",
    body: "Vous avez annule l'autorisation Discord. La Fondation n'a pas pu verifier votre identite.",
  },
  discord_oauth_failed: {
    title: "Echec de verification",
    body:
      "La liaison avec Discord a echoue. Reessayez ou contactez le personnel technique.",
  },
  oauth_not_configured: {
    title: "Microsoft OAuth inactif",
    body: "La connexion Minecraft n'est pas encore configuree sur ce terminal.",
  },
};

export function isDiscordLoginEnabled(): boolean {
  return siteConfig.discordOAuthEnabled;
}
