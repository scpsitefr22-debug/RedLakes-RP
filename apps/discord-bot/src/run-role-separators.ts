/**
 * Cree uniquement les roles-separateurs (categories) sur Discord.
 * Tu ajoutes les vrais grades manuellement en dessous de chaque separateur.
 * Usage : npm run roles:separators
 */
import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import { BRANCH_COLORS } from "./lib/role-layout.js";
import { isLayoutSeparatorName } from "./lib/role-layout.js";
import { DISCORD_ROLE_CATEGORIES } from "./lib/discord-role-catalog.js";
async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  const guild = await client.guilds.fetch(config.guildId).then((g) => g.fetch());
  await guild.roles.fetch();

  console.log("\n=== CATEGORIES DISCORD (separateurs) ===\n");

  let created = 0;
  let skipped = 0;

  for (const name of DISCORD_ROLE_CATEGORIES) {
    const exists = [...guild.roles.cache.values()].some(
      (r) => r.name === name || isLayoutSeparatorName(r.name) && r.name.includes(name.slice(0, 12)),
    );
    const exact = guild.roles.cache.find((r) => r.name === name);
    if (exact) {
      console.log(`  [skip] ${name}`);
      skipped += 1;
      continue;
    }

    try {
      await guild.roles.create({
        name: name.slice(0, 100),
        color: BRANCH_COLORS.separator,
        hoist: true,
        mentionable: false,
        permissions: 0n,
        reason: "Categorie roles RP REDLAKES",
      });
      console.log(`  [ok]   ${name}`);
      created += 1;
      await sleep(1500);
    } catch (err) {
      console.warn(`  [err]  ${name}`, err);
      await sleep(5000);
    }
  }

  console.log(`\n${created} cree(s), ${skipped} deja present(s).`);
  console.log("Ajoute tes grades manuellement sous chaque categorie.\n");
  await client.destroy();
  process.exit(0);
});

client.login(config.token);
