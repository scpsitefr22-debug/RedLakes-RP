/**
 * Reprend la création des rôles manquants + organisation hiérarchique.
 * Ne supprime rien — complète ce que tu as déjà créé à la main.
 * Usage : npm run roles:resume
 */
import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import { createAllRoles } from "./lib/role-admin.js";
import {
  logRegistrySummary,
  refreshRoleRegistry,
} from "./lib/discord-role-registry.js";
import { DISCORD_GRADE_SECTIONS } from "./lib/discord-role-catalog.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  const guild = await client.guilds.fetch(config.guildId).then((g) => g.fetch());
  await guild.roles.fetch();

  const catalogTotal = DISCORD_GRADE_SECTIONS.reduce(
    (n, s) => n + s.roles.length,
    0,
  );

  console.log("\n=== REPRISE ROLES REDLAKES ===\n");
  console.log(`Catalogue : ${catalogTotal} grades + pings/reunions`);
  console.log("Mode : compléter les manquants + ranger la hiérarchie\n");

  const prevCreate = config.roles.autoCreate;
  const prevOrganize = config.roles.autoOrganize;
  const prevDedupe = config.roles.removeDuplicates;
  (config.roles as { autoCreate: boolean }).autoCreate = true;
  (config.roles as { autoOrganize: boolean }).autoOrganize = true;
  (config.roles as { removeDuplicates: boolean }).removeDuplicates = true;

  const result = await createAllRoles(guild, async (label, p) => {
    if (p.done % 5 === 0 || p.done === p.total) {
      console.log(
        `  [${label}] ${p.done}/${p.total} — créés:${p.created.length} déjà là:${p.skipped.length}`,
      );
    }
  });

  await refreshRoleRegistry(guild);
  logRegistrySummary();

  (config.roles as { autoCreate: boolean }).autoCreate = prevCreate;
  (config.roles as { autoOrganize: boolean }).autoOrganize = prevOrganize;
  (config.roles as { removeDuplicates: boolean }).removeDuplicates = prevDedupe;

  const created =
    result.categories.created.length +
    result.grades.created.length +
    result.titres.created.length +
    result.factions.created.length +
    result.membres.created.length;

  console.log("\n--- Bilan ---");
  console.log(`  Créés     : ${created}`);
  console.log(`  Ignorés   : ${result.grades.skipped.length} grades (déjà présents)`);
  if (result.grades.errors.length) {
    console.log(`  Erreurs   : ${result.grades.errors.join(", ")}`);
  }
  console.log("\nTerminé. Relance le bot (`npm run dev` dans apps/discord-bot).\n");

  await client.destroy();
  process.exit(result.grades.errors.length ? 1 : 0);
});

client.login(config.token);
