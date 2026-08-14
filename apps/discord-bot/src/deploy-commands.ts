import { REST, Routes, PermissionFlagsBits } from "discord.js";
import { config } from "./config.js";
import { commands } from "./commands/index.js";

/** Permissions necessaires pour le bot REDLAKES */
const INVITE_PERMISSIONS =
  PermissionFlagsBits.ManageRoles |
  PermissionFlagsBits.ManageNicknames |
  PermissionFlagsBits.SendMessages |
  PermissionFlagsBits.EmbedLinks |
  PermissionFlagsBits.ReadMessageHistory;

function inviteUrl(clientId: string): string {
  return (
    `https://discord.com/api/oauth2/authorize?client_id=${clientId}` +
    `&permissions=${INVITE_PERMISSIONS.toString()}` +
    `&scope=bot%20applications.commands`
  );
}

async function preflight(rest: REST): Promise<void> {
  console.log("Verification de la configuration...\n");

  // 1. Application liee au token
  let app: { id: string; name?: string };
  try {
    app = (await rest.get(Routes.oauth2CurrentApplication())) as {
      id: string;
      name?: string;
    };
  } catch {
    console.error("ERREUR : token invalide ou expire.");
    console.error("Regenere le token : Developer Portal > Bot > Reset Token\n");
    process.exit(1);
  }

  console.log(`Application du token : ${app.name ?? "?"} (${app.id})`);

  if (app.id !== config.clientId) {
    console.error("\nERREUR : DISCORD_CLIENT_ID ne correspond pas au token !");
    console.error(`  .env contient     : ${config.clientId}`);
    console.error(`  Token appartient a : ${app.id}`);
    console.error("\nCorrige DISCORD_CLIENT_ID dans apps/discord-bot/.env\n");
    process.exit(1);
  }

  // 2. Bot present sur le serveur ?
  try {
    const guild = (await rest.get(Routes.guild(config.guildId))) as {
      id: string;
      name: string;
    };
    console.log(`Serveur trouve     : ${guild.name} (${guild.id})`);
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    console.error("\nERREUR : le bot n'a pas acces au serveur configure.");
    console.error(`  DISCORD_GUILD_ID : ${config.guildId}`);
    if (code === 50001) {
      console.error("  Cause probable   : le bot n'est pas invite sur ce serveur.");
    } else if (code === 10004) {
      console.error("  Cause probable   : ID de serveur invalide.");
    }
    console.error("\nSolution :");
    console.error("  1. Ouvre ce lien et choisis TON serveur REDLAKES :");
    console.error(`\n     ${inviteUrl(config.clientId)}\n`);
    console.error("  2. Verifie que les scopes bot + applications.commands sont coches");
    console.error("  3. Relance Lancer-Bot-Discord.bat\n");
    process.exit(1);
  }

  console.log("");
}

async function deploy(): Promise<void> {
  const body = commands.map((c) => c.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(config.token);

  await preflight(rest);

  console.log(`Deploiement de ${body.length} commandes sur le serveur ${config.guildId}...`);
  try {
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body },
    );
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 50001) {
      console.error("\nERREUR Missing Access lors du deploiement des commandes.");
      console.error("Reinvite le bot avec applications.commands :");
      console.error(`\n  ${inviteUrl(config.clientId)}\n`);
      process.exit(1);
    }
    throw err;
  }

  console.log(
    "Commandes enregistrees :",
    commands.map((c) => `/${c.data.name}`).join(", "),
  );
  console.log("\nTeste sur Discord : /aide\n");
}

deploy().catch((err) => {
  console.error("Echec du deploiement :", err);
  process.exit(1);
});
