/** Applique matching + nettoyage doublons bot (sans lancer le bot complet) */
import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import { refreshRoleRegistry, logRegistrySummary } from "./lib/discord-role-registry.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  const guild = await client.guilds.fetch(config.guildId).then((g) => g.fetch());
  console.log("\n=== FIX ROLES REDLAKES ===\n");
  await refreshRoleRegistry(guild);
  logRegistrySummary();
  console.log("\nTermine. Relance le bot normalement.\n");
  await client.destroy();
  process.exit(0);
});

client.login(config.token);
