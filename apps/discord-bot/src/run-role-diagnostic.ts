/**
 * Diagnostic : roles Discord reels vs matching RP
 * Usage: npx tsx src/run-role-diagnostic.ts
 */
import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import { refreshRoleRegistry } from "./lib/discord-role-registry.js";
import { matchExistingRolesToGrades } from "./lib/role-matcher.js";
import { isStaffOrBaseRole } from "./lib/rp-catalog.js";
import { isLayoutSeparatorName } from "./lib/role-layout.js";
import { organizeGuildRpRoles } from "./lib/organize-rp-roles.js";
import { refreshGradeCatalog } from "./lib/grade-catalog.js";

const token = process.env.DISCORD_BOT_TOKEN!;
const guildId = process.env.DISCORD_GUILD_ID!;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  await refreshGradeCatalog();
  const guild = await client.guilds.fetch(guildId);
  const full = await guild.fetch();
  await full.roles.fetch();

  const me = full.members.me;
  console.log("\n=== DIAGNOSTIC ROLES REDLAKES ===\n");
  console.log("Bot:", me?.user.tag);
  console.log("ManageRoles:", me?.permissions.has("ManageRoles") ? "OUI" : "NON");
  console.log("Role bot le plus haut:", me?.roles.highest.name, "pos", me?.roles.highest.position);
  console.log("autoOrganize:", config.roles.autoOrganize);
  console.log("autoCreate:", config.roles.autoCreate);

  const all = [...full.roles.cache.values()]
    .filter((r) => r.id !== full.id && !r.managed)
    .sort((a, b) => b.position - a.position);

  console.log("\n--- Roles serveur (hors @everyone/bots) ---");
  for (const r of all.slice(0, 40)) {
    const staff = isStaffOrBaseRole(r.name);
    const sep = isLayoutSeparatorName(r.name);
    console.log(`  [${r.position}] ${r.name}${staff ? " [STAFF-SKIP]" : ""}${sep ? " [SEP]" : ""}`);
  }
  if (all.length > 40) console.log(`  ... +${all.length - 40} autres`);

  const eligible = all.filter(
    (r) => !isStaffOrBaseRole(r.name) && !isLayoutSeparatorName(r.name),
  );

  const matches = matchExistingRolesToGrades(eligible.map((r) => ({ id: r.id, name: r.name })));
  console.log(`\n--- Matching fuzzy : ${matches.length} role(s) ---`);
  for (const m of matches.slice(0, 30)) {
    console.log(`  ${m.score}%  "${m.roleName}" -> ${m.gradeLabel}`);
  }

  await refreshRoleRegistry(full, { ensureMissing: false });
  const org = await organizeGuildRpRoles(full);
  console.log("\n--- Organisation ---");
  console.log("  Positionnes:", org.positioned);
  console.log("  Couleurs:", org.colorsUpdated);

  const unmached = eligible.filter(
    (r) => !matches.some((m) => m.roleId === r.id),
  );
  console.log(`\n--- Non matches (${unmached.length}) ---`);
  for (const r of unmached) console.log(`  "${r.name}"`);

  await client.destroy();
  process.exit(0);
});

client.login(token).catch((e) => {
  console.error("Login failed:", e.message);
  process.exit(1);
});
