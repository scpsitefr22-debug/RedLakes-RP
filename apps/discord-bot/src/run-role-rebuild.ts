/**

 * Rebuild complet : supprime TOUS les roles RP puis les recree depuis le catalogue.

 * Usage : npm run roles:rebuild

 */

import "dotenv/config";

import { Client, GatewayIntentBits, type Guild } from "discord.js";

import { config } from "./config.js";

import { refreshRoleRegistry, logRegistrySummary } from "./lib/discord-role-registry.js";

import { wipeAllRpRoles } from "./lib/wipe-rp-roles.js";

import {

  getCanonicalGradeLabels,

  normalizeRoleLabel,

} from "./lib/rp-catalog.js";

import { refreshGradeCatalog } from "./lib/grade-catalog.js";

import {

  getBranchColor,

  getLayoutBranchForGrade,

} from "./lib/role-layout.js";

import { organizeGuildRpRoles } from "./lib/organize-rp-roles.js";

import { inferRpRoleStyle } from "./lib/role-style.js";



const API = "https://discord.com/api/v10";

const CREATE_DELAY_MS = 1500;

const POST_WIPE_COOLDOWN_MS = 30_000;



const client = new Client({ intents: [GatewayIntentBits.Guilds] });



async function sleep(ms: number): Promise<void> {

  await new Promise((r) => setTimeout(r, ms));

}



async function apiFetch(

  path: string,

  init?: RequestInit,

): Promise<Response> {

  for (let attempt = 0; attempt < 12; attempt++) {

    const res = await fetch(`${API}${path}`, {

      ...init,

      headers: {

        Authorization: `Bot ${config.token}`,

        "Content-Type": "application/json",

        ...(init?.headers ?? {}),

      },

    });



    if (res.status === 429) {

      const data = (await res.json()) as { retry_after?: number };

      const wait = Math.ceil((data.retry_after ?? 2) * 1000) + 300;

      console.log(`[roles] Rate limit — pause ${Math.round(wait / 1000)}s`);

      await sleep(wait);

      continue;

    }

    return res;

  }

  throw new Error(`Rate limit persistant sur ${path}`);

}



async function createAllRoles(guild: Guild): Promise<number> {

  const canonical = getCanonicalGradeLabels();

  const base = inferRpRoleStyle(guild);

  await guild.roles.fetch();

  const existing = new Set(

    [...guild.roles.cache.values()].map((r) => normalizeRoleLabel(r.name)),

  );



  let created = 0;

  let skipped = 0;



  for (const [norm, label] of canonical) {

    if (existing.has(norm)) {

      skipped += 1;

      continue;

    }



    const branch = getLayoutBranchForGrade(label);

    const color = getBranchColor(branch);

    const res = await apiFetch(`/guilds/${config.guildId}/roles`, {

      method: "POST",

      body: JSON.stringify({

        name: label.slice(0, 100),

        color,

        hoist: base.hoist,

        mentionable: base.mentionable,

        permissions: "0",

      }),

    });



    if (res.ok) {

      created += 1;

      existing.add(norm);

      console.log(`[roles] Cree (${created}/${canonical.size - skipped}) : ${label}`);

    } else {

      console.warn(`[roles] Echec "${label}" : ${(await res.text()).slice(0, 100)}`);

    }



    await sleep(CREATE_DELAY_MS);

  }



  console.log(`[roles] ${skipped} deja present(s), ${created} cree(s)`);

  return created;

}



async function verifyRoles(guild: Guild): Promise<number> {

  await guild.roles.fetch();

  const canonical = getCanonicalGradeLabels();

  let found = 0;

  for (const [norm] of canonical) {

    const hit = [...guild.roles.cache.values()].some(

      (r) => normalizeRoleLabel(r.name) === norm,

    );

    if (hit) found += 1;

  }

  return found;

}



client.once("ready", async () => {

  await refreshGradeCatalog();

  const guild = await client.guilds.fetch(config.guildId).then((g) => g.fetch());



  console.log("\n=== REBUILD ROLES RP REDLAKES ===\n");

  console.log(`Catalogue : ${getCanonicalGradeLabels().size} grades\n`);



  console.log("Etape 1/5 — Suppression de tous les roles RP...");

  const removed = await wipeAllRpRoles(guild);

  console.log(`  ${removed.length} role(s) supprime(s)`);

  console.log(`  Cooldown ${POST_WIPE_COOLDOWN_MS / 1000}s (rate limit Discord)...`);

  await sleep(POST_WIPE_COOLDOWN_MS);



  console.log("\nEtape 2/5 — Creation des roles manquants...");

  const prevCreate = config.roles.autoCreate;

  const prevOrganize = config.roles.autoOrganize;

  (config.roles as { autoCreate: boolean }).autoCreate = true;

  (config.roles as { autoOrganize: boolean }).autoOrganize = true;



  await createAllRoles(guild);



  console.log("\nEtape 3/5 — Verification...");

  let found = await verifyRoles(guild);

  console.log(`  ${found}/${getCanonicalGradeLabels().size} roles presents`);



  if (found < getCanonicalGradeLabels().size) {

    console.log("\nEtape 3b — Completer les manquants...");

    await createAllRoles(guild);

    found = await verifyRoles(guild);

    console.log(`  ${found}/${getCanonicalGradeLabels().size} roles presents`);

  }



  console.log("\nEtape 4/5 — Organisation hierarchique...");

  await guild.roles.fetch();

  const org = await organizeGuildRpRoles(guild, { force: true });

  console.log(`  ${org.positioned} role(s) positionne(s)`);



  console.log("\nEtape 5/5 — Registre final...");

  await refreshRoleRegistry(guild, { ensureMissing: false });

  logRegistrySummary();



  (config.roles as { autoCreate: boolean }).autoCreate = prevCreate;

  (config.roles as { autoOrganize: boolean }).autoOrganize = prevOrganize;



  if (found < getCanonicalGradeLabels().size) {

    console.warn(

      `\nATTENTION : ${getCanonicalGradeLabels().size - found} role(s) manquant(s). ` +

        "Relancez npm run roles:rebuild dans quelques minutes.\n",

    );

    await client.destroy();

    process.exit(1);

  }



  console.log("\nRebuild termine — 100% des roles en place.\n");

  await client.destroy();

  process.exit(0);

});



client.login(config.token);


