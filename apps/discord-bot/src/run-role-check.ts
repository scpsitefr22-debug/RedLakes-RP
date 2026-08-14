/**
 * Liste les rôles manquants sur Discord vs layout officiel Site-12.
 * Usage : npm run roles:check
 */
import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import {
  buildRoleCheckReport,
  formatRoleCheckReport,
} from "./lib/role-check-report.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  const guild = await client.guilds.fetch(config.guildId).then((g) => g.fetch());
  const report = await buildRoleCheckReport(guild);

  console.log("\n═══════════════════════════════════════════");
  console.log("  CHECK RÔLES DISCORD — REDLAKES Site-12");
  console.log("═══════════════════════════════════════════\n");
  console.log(formatRoleCheckReport(report).replace(/\*\*/g, ""));
  console.log("\n═══════════════════════════════════════════\n");

  await client.destroy();
  process.exit(0);
});

client.login(config.token).catch((e) => {
  console.error("Login failed:", e.message);
  process.exit(1);
});
