import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  Partials,
  ActivityType,
  type GuildMember,
} from "discord.js";
import { config } from "./config.js";
import { commandMap } from "./commands/index.js";
import {
  refreshRoleRegistry,
  logRegistrySummary,
} from "./lib/discord-role-registry.js";
import { setupGuildChannels } from "./lib/guild-setup.js";
import { refreshGradeCatalog } from "./lib/grade-catalog.js";
import { handleMemberJoin } from "./events/welcome.js";
import { handleMemberRoleChange, backfillStaffRoles } from "./events/member-roles.js";
import {
  handleMessageTransmission,
  handleMemberJoinTransmission,
  handleMemberLeaveTransmission,
} from "./events/transmissions.js";
import {
  handleMainHubComponent,
  handleMainHubModalSubmit,
  isMainHubInteraction,
} from "./lib/hub/dispatch.js";

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
];
// Intent privilégié : uniquement si activé dans le Developer Portal (sinon login refusé)
if (config.transmissions.enableMessageContent) {
  intents.push(GatewayIntentBits.MessageContent);
}

const client = new Client({
  intents,
  partials: [Partials.GuildMember, Partials.Message, Partials.Channel],
});

client.once(Events.ClientReady, async (c) => {
  console.log(`Bot connecte : ${c.user.tag}`);

  await refreshGradeCatalog();

  const guild = await c.guilds.fetch(config.guildId).catch(() => null);
  if (guild) {
    try {
      await setupGuildChannels(guild);
    } catch (err) {
      console.warn("[setup] Echec auto-setup salons :", err);
    }
    try {
      // Scan uniquement au démarrage — pas de création/rangement (évite conflit avec le panneau import du hub)
      await refreshRoleRegistry(guild, {
        ensureMissing: false,
        organize: false,
      });
      logRegistrySummary();
    } catch (err) {
      console.warn("[roles] Echec scan roles RP :", err);
    }
    try {
      await backfillStaffRoles(guild);
    } catch (err) {
      console.warn("[sync] Echec backfill staff :", err);
    }
  } else {
    console.warn(
      `[setup] Serveur ${config.guildId} introuvable dans le cache — auto-setup ignore.`,
    );
  }

  c.user.setPresence({
    activities: [
      {
        name: config.serverOpen ? config.minecraftIp : "ouverture prochaine",
        type: ActivityType.Watching,
      },
    ],
    status: "online",
  });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = commandMap.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`Erreur commande /${interaction.commandName} :`, err);
      const payload = {
        content: "Une erreur est survenue lors de l'execution de la commande.",
        flags: MessageFlags.Ephemeral as const,
      };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: payload.content }).catch(() => undefined);
      } else {
        await interaction.reply(payload).catch(() => undefined);
      }
    }
    return;
  }

  try {
    if (interaction.isButton()) {
      if (isMainHubInteraction(interaction.customId)) {
        await handleMainHubComponent(interaction);
        return;
      }
      const { handleRolesHubButton, isRolesHubInteraction } = await import(
        "./lib/roles-hub-handlers.js"
      );
      if (isRolesHubInteraction(interaction.customId)) {
        await handleRolesHubButton(interaction);
      }
      return;
    }

    if (interaction.isStringSelectMenu()) {
      if (isMainHubInteraction(interaction.customId)) {
        await handleMainHubComponent(interaction);
        return;
      }
      const { handleRolesHubSelect, isRolesHubInteraction } = await import(
        "./lib/roles-hub-handlers.js"
      );
      if (isRolesHubInteraction(interaction.customId)) {
        await handleRolesHubSelect(interaction);
      }
      return;
    }

    if (interaction.isUserSelectMenu()) {
      const { handleRolesHubUserSelect, isRolesHubInteraction } = await import(
        "./lib/roles-hub-handlers.js"
      );
      if (isRolesHubInteraction(interaction.customId)) {
        await handleRolesHubUserSelect(interaction);
      }
      return;
    }

    if (interaction.isRoleSelectMenu()) {
      const { isRolesHubInteraction } = await import("./lib/roles-hub-handlers.js");
      if (isRolesHubInteraction(interaction.customId)) {
        /* liste paginée StringSelect — menu natif ignoré */
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      if (isMainHubInteraction(interaction.customId)) {
        await handleMainHubModalSubmit(interaction);
        return;
      }
      const { handleRolesHubModal, isRolesHubInteraction } = await import(
        "./lib/roles-hub-handlers.js"
      );
      if (isRolesHubInteraction(interaction.customId)) {
        await handleRolesHubModal(interaction);
      }
    }
  } catch (err) {
    console.error("[hub-roles] Erreur interaction :", err);
    const payload = {
      content: "Une erreur est survenue.",
      flags: MessageFlags.Ephemeral as const,
    };
    if (interaction.isRepliable()) {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: payload.content }).catch(() => undefined);
      } else {
        await interaction.reply(payload).catch(() => undefined);
      }
    }
  }
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const guild = newMember.guild;
  const fresh =
    newMember.partial
      ? await guild.members.fetch(newMember.id).catch(() => null)
      : newMember;
  const old =
    oldMember.partial && guild
      ? await guild.members.fetch(oldMember.id).catch(() => oldMember)
      : oldMember;
  if (!fresh || !("roles" in fresh)) return;

  handleMemberRoleChange(old as GuildMember, fresh).catch((err) =>
    console.warn("[GuildMemberUpdate:roles]", err),
  );
});

client.on(Events.GuildMemberAdd, (member) => {
  handleMemberJoin(member).catch((err) =>
    console.warn("[GuildMemberAdd]", err),
  );
  handleMemberJoinTransmission(member).catch((err) =>
    console.warn("[GuildMemberAdd:transmission]", err),
  );
});

client.on(Events.GuildMemberRemove, (member) => {
  handleMemberLeaveTransmission(member).catch((err) =>
    console.warn("[GuildMemberRemove:transmission]", err),
  );
});

client.on(Events.MessageCreate, (message) => {
  handleMessageTransmission(message).catch((err) =>
    console.warn("[MessageCreate:transmission]", err),
  );
});

process.on("unhandledRejection", (reason) => {
  console.error("Promesse rejetee non geree :", reason);
});

client.login(config.token).catch((err) => {
  console.error(
    "Connexion impossible. Verifie DISCORD_BOT_TOKEN dans apps/discord-bot/.env\n",
    err,
  );
  process.exit(1);
});
