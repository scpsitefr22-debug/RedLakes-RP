import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import { setupGuildChannels } from "./lib/guild-setup.js";

/**
 * Lance uniquement l'auto-setup des salons (sans rester connecte).
 * Usage : npm run setup:guild
 */
async function main(): Promise<void> {
  if (!config.setup.autoSetup) {
    console.log("DISCORD_AUTO_SETUP=false — rien a faire.");
    return;
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  await new Promise<void>((resolve, reject) => {
    client.once(Events.ClientReady, () => resolve());
    client.login(config.token).catch(reject);
  });

  const guild = await client.guilds.fetch(config.guildId);
  console.log(`\nServeur : ${guild.name}\n`);
  await setupGuildChannels(guild);

  await client.destroy();
  console.log("\nSetup termine.\n");
}

main().catch((err) => {
  console.error("Echec setup :", err);
  process.exit(1);
});
