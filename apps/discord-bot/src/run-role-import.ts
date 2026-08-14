/**
 * Import rôles depuis un fichier .txt — ne redémarre pas avec tsx watch.
 * Usage : npm run roles:import -- chemin/vers/liste.txt
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import {
  formatImportResult,
  importRolesFromText,
  looksLikeRoleList,
} from "./lib/role-list-import.js";
import { summarizeParsedList, parseRoleListText, normalizeRoleListText } from "./lib/role-list-parser.js";

const file = process.argv[2];
if (!file) {
  console.error("Usage : npm run roles:import -- <fichier.txt>");
  process.exit(1);
}

const text = readFileSync(resolve(file), "utf8");
if (!looksLikeRoleList(text)) {
  console.error("Fichier invalide — aucun grade détecté.");
  process.exit(1);
}

const summary = summarizeParsedList(parseRoleListText(normalizeRoleListText(text)));
console.log(`\n=== IMPORT ROLES (${summary.grades} grades) ===\n`);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  const guild = await client.guilds.fetch(config.guildId).then((g) => g.fetch());

  const result = await importRolesFromText(guild, text, {
    create: process.argv.includes("--create"),
    onProgress: (p) => {
      if (p.phase === "rate-limit") {
        console.log(`[pause Discord ~${Math.ceil((p.rateLimitSec ?? 60) / 60)} min]`);
        return;
      }
      if (p.done % 5 === 0 || p.done === p.total) {
        console.log(
          `[${p.done}/${p.total}] créés:${p.created} skip:${p.skipped} err:${p.errors}`,
        );
      }
    },
  });

  console.log("\n" + formatImportResult(result).replace(/\*\*/g, ""));
  await client.destroy();
  process.exit(result.errors.length ? 1 : 0);
});

client.login(config.token);
