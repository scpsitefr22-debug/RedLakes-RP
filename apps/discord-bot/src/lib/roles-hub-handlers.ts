import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type ModalSubmitInteraction,
  type StringSelectMenuInteraction,
  type UserSelectMenuInteraction,
} from "discord.js";
import {
  createAllRoles,
  createCategories,
  createFactionRoles,
  createFoundationGrades,
  createHonoraryTitles,
  createMemberPingRoles,
  deleteRoles,
  forceOrganize,
  formatBatchResult,
  formatDeleteResult,
  getRoleStatus,
  giveRole,
  purgeEmptyDuplicates,
  removeRole,
  staffGuardInteraction,
} from "./role-admin.js";
import type { FactionGroupId } from "./discord-role-catalog.js";
import type { BranchId } from "./role-layout.js";
import {
  buildRolePickerPage,
  getRolesByIds,
  type RolePickerFilter,
} from "./role-picker.js";
import { COLORS, BRAND } from "./theme.js";
import {
  HUB_PREFIX,
  buildConfirmAllRow,
  buildConfirmDeleteRow,
  buildFactionSelectMenu,
  buildGiveRemoveRow,
  buildGradeSelectMenu,
  buildHubComponents,
  buildHubEmbed,
  buildImportModal,
  buildStatusEmbed,
  hubId,
} from "./roles-hub-ui.js";
import {
  formatImportPreview,
  formatImportProgress,
  formatImportResult,
  importRolesFromText,
  looksLikeRoleList,
  describeRoleListParse,
  mergeModalParts,
  previewImportList,
} from "./role-list-import.js";

function isHubInteraction(customId: string): boolean {
  return customId.startsWith(HUB_PREFIX);
}

/** Tokens de confirmation suppression (évite customId > 100 car.) */
const pendingDeletes = new Map<
  string,
  { userId: string; roleIds: string[]; expires: number }
>();

function prunePendingDeletes(): void {
  const now = Date.now();
  for (const [k, v] of pendingDeletes) {
    if (v.expires < now) pendingDeletes.delete(k);
  }
}

function stashDeleteRequest(userId: string, roleIds: string[]): string {
  prunePendingDeletes();
  const token = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  pendingDeletes.set(token, {
    userId,
    roleIds,
    expires: Date.now() + 5 * 60_000,
  });
  return token;
}

function takeDeleteRequest(
  token: string,
  userId: string,
): string[] | null {
  const entry = pendingDeletes.get(token);
  pendingDeletes.delete(token);
  if (!entry || entry.userId !== userId || entry.expires < Date.now()) {
    return null;
  }
  return entry.roleIds;
}

export function isRolesHubInteraction(customId: string): boolean {
  return isHubInteraction(customId);
}

async function replyEphemeral(
  interaction:
    | ButtonInteraction
    | StringSelectMenuInteraction
    | UserSelectMenuInteraction,
  content: string,
): Promise<void> {
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
  } else {
    await interaction.reply({ content, flags: MessageFlags.Ephemeral });
  }
}

async function runBatchAction(
  interaction: ButtonInteraction,
  label: string,
  run: () => Promise<string>,
): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const result = await run();
  await interaction.editReply(result);
}

export async function refreshHubMessage(
  interaction: ButtonInteraction,
): Promise<void> {
  if (!interaction.inCachedGuild()) return;
  const status = await getRoleStatus(interaction.guild);
  await interaction.update({
    embeds: [buildHubEmbed(status)],
    components: buildHubComponents(),
  });
}

export async function handleRolesHubButton(
  interaction: ButtonInteraction,
): Promise<void> {
  if (!isHubInteraction(interaction.customId)) return;
  if (!(await staffGuardInteraction(interaction))) return;
  if (!interaction.inCachedGuild()) return;

  const guild = interaction.guild;
  const action = interaction.customId.slice(HUB_PREFIX.length).split(":");

  switch (action[0]) {
    case "btn": {
      const btn = action[1];
      if (btn === "categories") {
        await runBatchAction(interaction, "Catégories", async () => {
          const r = await createCategories(guild);
          return formatBatchResult("Catégories", r);
        });
        return;
      }
      if (btn === "grades") {
        await interaction.reply({
          content: "**Grades Site-12** — choisis une branche :",
          components: [buildGradeSelectMenu()],
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (btn === "titres") {
        await runBatchAction(interaction, "Titres", async () => {
          const r = await createHonoraryTitles(guild);
          return formatBatchResult("Titres honorifiques", r);
        });
        return;
      }
      if (btn === "factions") {
        await interaction.reply({
          content: "**Factions** — laquelle créer ?",
          components: [buildFactionSelectMenu()],
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (btn === "org") {
        await runBatchAction(interaction, "Crime global", async () => {
          const r = await createFactionRoles(guild, "illegal");
          return (
            formatBatchResult("Crime organisé (global)", r) +
            "\n\n💡 Pas de rôle par org — les joueurs fondent leur lore en RP."
          );
        });
        return;
      }
      if (btn === "statut") {
        const status = await getRoleStatus(guild);
        await interaction.reply({
          embeds: [buildStatusEmbed(status)],
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (btn === "organiser") {
        await runBatchAction(interaction, "Organiser", async () =>
          forceOrganize(guild),
        );
        return;
      }
      if (btn === "refresh") {
        await refreshHubMessage(interaction);
        return;
      }
      if (btn === "delete") {
        await guild.roles.fetch();
        const picker = buildRolePickerPage(guild, "delete", 0);
        await interaction.reply({
          content:
            "🗑️ **Supprimer des rôles**\n\n" +
            "Liste complète basée sur le **bot** (pas ton compte staff).\n" +
            "⛔ Protégés : Staff, Membre, Joueur, Civil, @everyone.\n\n" +
            picker.content,
          components: picker.components,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (btn === "del-nav" || btn === "assign-nav") {
        const page = Number.parseInt(action[2] ?? "0", 10) || 0;
        const filter = (action[3] || "all") as RolePickerFilter;
        const userId = action[4] || undefined;

        await guild.roles.fetch();
        const picker = buildRolePickerPage(
          guild,
          btn === "del-nav" ? "delete" : "assign",
          page,
          { filter, userId },
        );

        await interaction.update({
          content:
            (btn === "del-nav"
              ? "🗑️ **Supprimer des rôles**\n\n"
              : `👤 **Attribuer un rôle**\n\n`) + picker.content,
          components: picker.components,
        });
        return;
      }
      if (btn === "del-filter") {
        const filter = (action[2] || "all") as RolePickerFilter;
        const page = Number.parseInt(action[3] ?? "0", 10) || 0;

        await guild.roles.fetch();
        const picker = buildRolePickerPage(guild, "delete", page, { filter });

        await interaction.update({
          content: "🗑️ **Supprimer des rôles**\n\n" + picker.content,
          components: picker.components,
        });
        return;
      }
      if (btn === "dupes") {
        await runBatchAction(interaction, "Doublons", async () =>
          purgeEmptyDuplicates(guild),
        );
        return;
      }
      if (btn === "membres") {
        await runBatchAction(interaction, "Membres ping", async () => {
          const r = await createMemberPingRoles(guild);
          return (
            formatBatchResult("Rôles ping & réunions", r) +
            "\n\n💡 **Membre ·** = factions Site-12 / hostiles · **Réunion** = civil & crime."
          );
        });
        return;
      }
      if (btn === "confirm-del") {
        const token = action[2];
        if (!token) return;

        const roleIds = takeDeleteRequest(token, interaction.user.id);
        if (!roleIds?.length) {
          await replyEphemeral(
            interaction,
            "Confirmation expirée — recommence via **Supprimer rôles**.",
          );
          return;
        }

        await interaction.deferUpdate();
        await interaction.editReply({
          content: `⏳ Suppression de **${roleIds.length}** rôle(s)…`,
          components: [],
        });

        const result = await deleteRoles(guild, roleIds);
        await interaction.editReply({
          content: formatDeleteResult(result),
          components: [],
        });
        return;
      }
      if (btn === "import") {
        await interaction.showModal(buildImportModal());
        return;
      }
      if (btn === "tout") {
        await interaction.reply({
          content:
            "⚠️ **Installation complète**\n\n" +
            "Crée catégories + grades + titres + factions puis réorganise tout.\n" +
            "Cela peut prendre **plusieurs minutes** (limites Discord).\n\n" +
            "Confirmer ?",
          components: [buildConfirmAllRow()],
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (btn === "confirm-tout") {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await interaction.editReply("⏳ Installation en cours… patience.");

        const all = await createAllRoles(guild, async (label, p) => {
          if (p.done % 8 !== 0 && p.done !== p.total) return;
          try {
            await interaction.editReply(
              `⏳ **${label}** — ${p.done}/${p.total}\n` +
                `✅ ${p.created.length} · ⏭️ ${p.skipped.length}`,
            );
          } catch {
            /* ignore */
          }
        });

        const embed = new EmbedBuilder()
          .setColor(COLORS.success)
          .setTitle("✅ Installation terminée")
          .setDescription(
            [
              formatBatchResult("Catégories", all.categories),
              formatBatchResult("Grades", all.grades),
              formatBatchResult("Titres", all.titres),
              formatBatchResult("Factions", all.factions),
              formatBatchResult("Membres ping", all.membres),
            ].join("\n"),
          )
          .setFooter({ text: BRAND.footer });

        await interaction.editReply({ content: null, embeds: [embed] });
        return;
      }
      if (btn === "cancel") {
        await interaction.update({
          content: "Annulé.",
          components: [],
        });
        return;
      }
      if (btn === "give" || btn === "remove") {
        const userId = action[2];
        const roleId = action[3];
        if (!userId || !roleId) return;

        const member = await guild.members.fetch(userId).catch(() => null);
        const role = guild.roles.cache.get(roleId);
        if (!member || !role) {
          await replyEphemeral(interaction, "Membre ou rôle introuvable.");
          return;
        }

        const msg =
          btn === "give"
            ? await giveRole(member, role)
            : await removeRole(member, role);
        await replyEphemeral(interaction, msg);
        return;
      }
      break;
    }
  }
}

export async function handleRolesHubSelect(
  interaction: StringSelectMenuInteraction,
): Promise<void> {
  if (!isHubInteraction(interaction.customId)) return;
  if (!(await staffGuardInteraction(interaction))) return;
  if (!interaction.inCachedGuild()) return;

  const guild = interaction.guild;
  const parts = interaction.customId.slice(HUB_PREFIX.length).split(":");
  const kind = parts[0];

  if (kind === "sel" && parts[1] === "del-pick") {
    const roleIds = interaction.values;
    if (!roleIds.length) return;

    const roles = getRolesByIds(guild, roleIds);
    const names = roles.map((r) => `• ${r.name}`).slice(0, 15);
    const extra =
      roles.length > 15 ? `\n… et **${roles.length - 15}** autre(s)` : "";
    const withMembers = roles.filter((r) => r.members.size > 0);
    const memberWarn = withMembers.length
      ? `\n\n⚠️ **${withMembers.length}** rôle(s) encore attribué(s) à des membres.`
      : "";

    const token = stashDeleteRequest(interaction.user.id, roleIds);

    await interaction.update({
      content:
        `🗑️ Supprimer **${roles.length}** rôle(s) ?\n\n` +
        names.join("\n") +
        extra +
        memberWarn +
        "\n\n**Action irréversible.**",
      components: [buildConfirmDeleteRow(token)],
    });
    return;
  }

  if (kind === "sel" && parts[1] === "assign-pick") {
    const userId = parts[2];
    const roleId = interaction.values[0];
    if (!userId || !roleId) return;

    const member = await guild.members.fetch(userId).catch(() => null);
    const role = guild.roles.cache.get(roleId);
    if (!member || !role) {
      await interaction.update({
        content: "Membre ou rôle introuvable.",
        components: [],
      });
      return;
    }

    await interaction.update({
      content:
        `👤 ${member}\n🎭 **${role.name}**\n\nAttribuer ou retirer ce rôle ?`,
      components: [buildGiveRemoveRow(userId, roleId)],
    });
    return;
  }

  if (kind === "sel" && parts[1] === "grades") {
    const branch = interaction.values[0] as BranchId | "all";
    await interaction.deferUpdate();
    await interaction.editReply({ content: "⏳ Création des grades…", components: [] });

    const r = await createFoundationGrades(guild, {
      branch: branch === "all" ? undefined : branch,
    });
    const label =
      branch === "all" ? "Grades Site-12" : `Grades (${branch})`;
    await interaction.editReply({
      content: formatBatchResult(label, r),
      components: [],
    });
    return;
  }

  if (kind === "sel" && parts[1] === "factions") {
    const faction = interaction.values[0] as FactionGroupId | "all";
    await interaction.deferUpdate();
    await interaction.editReply({ content: "⏳ Création des rôles faction…", components: [] });

    const r = await createFactionRoles(
      guild,
      faction === "all" ? undefined : faction,
    );
    const label = faction === "all" ? "Toutes les factions" : `Faction ${faction}`;
    await interaction.editReply({
      content: formatBatchResult(label, r),
      components: [],
    });
    return;
  }
}

export async function handleRolesHubUserSelect(
  interaction: UserSelectMenuInteraction,
): Promise<void> {
  if (!isHubInteraction(interaction.customId)) return;
  if (!(await staffGuardInteraction(interaction))) return;
  if (!interaction.inCachedGuild()) return;

  const userId = interaction.values[0];
  if (!userId) return;

  const member = await interaction.guild.members.fetch(userId).catch(() => null);
  if (!member) {
    await interaction.reply({
      content: "Joueur introuvable.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.guild.roles.fetch();
  const picker = buildRolePickerPage(interaction.guild, "assign", 0, {
    userId,
  });

  await interaction.reply({
    content:
      `👤 **${member.displayName}** — choisis un rôle :\n\n` + picker.content,
    components: picker.components,
    flags: MessageFlags.Ephemeral,
  });
}

export async function handleRolesHubRoleSelect(): Promise<void> {
  /* Menu natif Discord désactivé — liste paginée via StringSelect */
}

export async function handleRolesHubModal(
  interaction: ModalSubmitInteraction,
): Promise<void> {
  if (!isHubInteraction(interaction.customId)) return;
  if (!(await staffGuardInteraction(interaction))) return;
  if (!interaction.inCachedGuild()) return;

  const parts = interaction.customId.slice(HUB_PREFIX.length).split(":");
  if (parts[0] !== "modal" || parts[1] !== "import") return;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const text = mergeModalParts({
      part1: interaction.fields.getTextInputValue("part1"),
      part2: interaction.fields.getTextInputValue("part2"),
      part3: interaction.fields.getTextInputValue("part3"),
      part4: interaction.fields.getTextInputValue("part4"),
    });

    if (!looksLikeRoleList(text)) {
      await interaction.editReply(
        `Aucun grade détecté (${describeRoleListParse(text)}).\n\n` +
          "Colle les noms avec emojis — ou utilise **/hub-roles** → **Coller liste**.",
      );
      return;
    }

    await interaction.guild.roles.fetch();
    const { parsed, missing } = previewImportList(interaction.guild, text);
    await interaction.editReply(formatImportPreview(parsed, missing, false));

    const result = await importRolesFromText(interaction.guild, text, {
      create: false,
      onProgress: async (p) => {
        try {
          await interaction.editReply(formatImportProgress(p));
        } catch {
          /* ignore */
        }
      },
    });
    await interaction.editReply(formatImportResult(result));
  } catch (err) {
    console.error("[roles-import:modal] Erreur :", err);
    const msg =
      err instanceof Error ? err.message : "Erreur inconnue pendant l'import.";
    try {
      await interaction.editReply(`❌ Import interrompu : ${msg}`);
    } catch {
      /* ignore */
    }
  }
}

export async function postRolesHub(
  interaction: ChatInputCommandInteraction,
  options?: { ephemeral?: boolean },
): Promise<void> {
  if (!interaction.inCachedGuild()) return;
  const guild = interaction.guild;
  const status = await getRoleStatus(guild);
  if (options?.ephemeral) {
    await interaction.reply({
      embeds: [buildHubEmbed(status)],
      components: buildHubComponents(),
      flags: MessageFlags.Ephemeral,
    });
  } else {
    await interaction.reply({
      embeds: [buildHubEmbed(status)],
      components: buildHubComponents(),
    });
  }
}
