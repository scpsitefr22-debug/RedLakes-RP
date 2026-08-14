import { REST, Routes } from "discord.js";
import { config } from "./config.js";

function inviteUrl(): string {
  // ViewChannel + SendMessages + EmbedLinks + ReadMessageHistory + ManageRoles
  // + ManageNicknames + ManageChannels + UseApplicationCommands
  const perms = "402653312";
  return `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=${perms}&scope=bot%20applications.commands`;
}

/**
 * Affiche le lien d'invitation et verifie token / serveur / client ID.
 * Usage : npm run verify
 */
async function verify(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(config.token);

  console.log("\n=== Diagnostic bot REDLAKES ===\n");
  console.log("DISCORD_CLIENT_ID :", config.clientId);
  console.log("DISCORD_GUILD_ID  :", config.guildId);
  console.log("API               :", config.apiBaseUrl);
  console.log("Auto-setup salons :", config.setup.autoSetup ? `oui (${config.setup.mode})` : "non");
  console.log("Creation roles RP :", config.roles.autoCreate ? "oui" : "non");
  console.log("Rangement hierarchie :", config.roles.autoOrganize ? "oui" : "non");
  console.log(
    "Transmissions     :",
    Object.keys(config.transmissions.channelMap).length,
    "salon(s) mappe(s)",
  );
  console.log("");

  try {
    const app = (await rest.get(Routes.oauth2CurrentApplication())) as {
      id: string;
      name: string;
    };
    console.log("Token OK — application :", app.name, `(${app.id})`);
    if (app.id !== config.clientId) {
      console.log("\n!! DISCORD_CLIENT_ID incorrect dans .env");
      console.log("   Mets :", app.id);
    }
  } catch (err) {
    console.log("!! Token invalide — regenere-le sur le Developer Portal");
    console.log("   Detail :", err instanceof Error ? err.message : err);
    process.exit(1);
  }

  try {
    const guild = (await rest.get(Routes.guild(config.guildId))) as {
      name: string;
    };
    console.log("Serveur OK           :", guild.name);
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: unknown }).code)
        : "inconnu";
    console.log("\n!! Serveur inaccessible (code", code + ")");
    console.log("   Causes frequentes : bot pas invite, mauvais GUILD_ID, ou token regenere.");
    console.log("\nInvite le bot avec ce lien :\n");
    console.log(inviteUrl());
    console.log("");
    process.exit(1);
  }

  console.log("\nConfiguration OK. Lance : npm run deploy\n");
}

verify().catch((err) => {
  console.error("Erreur verify :", err);
  process.exit(1);
});
