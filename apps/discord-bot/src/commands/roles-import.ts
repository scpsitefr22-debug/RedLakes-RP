import {
  PermissionFlagsBits,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "./types.js";
import { staffGuard } from "../lib/role-admin.js";
import {
  formatImportPreview,
  formatImportProgress,
  formatImportResult,
  importRolesFromText,
  looksLikeRoleList,
  describeRoleListParse,
  mergeModalParts,
  previewImportList,
} from "../lib/role-list-import.js";

const MAX_TEXT = 4000;

export const rolesImport: Command = {
  data: new SlashCommandBuilder()
    .setName("roles-import")
    .setDescription(
      "[Staff] Range les rôles existants sous tes catégories (rapide)",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addAttachmentOption((opt) =>
      opt
        .setName("fichier")
        .setDescription("Fichier .txt avec la liste")
        .setRequired(false),
    )
    .addStringOption((opt) =>
      opt
        .setName("liste")
        .setDescription("Liste collée (max 4000 caractères)")
        .setMaxLength(MAX_TEXT)
        .setRequired(false),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("creer")
        .setDescription("Créer via API (LENT — rate limit 10+ min/rôle). Défaut : non")
        .setRequired(false),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("organiser")
        .setDescription("Ranger sous les catégories (défaut : oui)")
        .setRequired(false),
    ),

  async execute(interaction) {
    if (!(await staffGuard(interaction))) return;
    if (!interaction.inCachedGuild()) return;

    const attachment = interaction.options.getAttachment("fichier");
    const liste = interaction.options.getString("liste");
    const create = interaction.options.getBoolean("creer") ?? false;
    const organize = interaction.options.getBoolean("organiser") ?? true;

    if (!attachment && !liste?.trim()) {
      await interaction.reply({
        content:
          "Colle ta liste dans **liste** ou joins un **fichier .txt**.\n\n" +
          "**Par défaut** : rangement seul (rapide). Crée les rôles à la main dans Discord.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      let text = liste?.trim() ?? "";

      if (attachment) {
        if (attachment.size > 512_000) {
          await interaction.editReply("Fichier trop volumineux (max 500 Ko).");
          return;
        }
        const res = await fetch(attachment.url);
        if (!res.ok) {
          await interaction.editReply("Impossible de lire le fichier joint.");
          return;
        }
        const fileText = await res.text();
        text = text ? `${text}\n${fileText}` : fileText;
      }

      if (!looksLikeRoleList(text)) {
        await interaction.editReply(
          `Aucun grade détecté (${describeRoleListParse(text)}).\n\n` +
            "Colle les noms avec emojis, une ligne par rôle.",
        );
        return;
      }

      await interaction.guild.roles.fetch();
      const { parsed, missing } = previewImportList(interaction.guild, text);
      await interaction.editReply(formatImportPreview(parsed, missing, create));

      const result = await importRolesFromText(interaction.guild, text, {
        create,
        organize,
        onProgress: async (p) => {
          if (create) {
            try {
              await interaction.editReply(formatImportProgress(p));
            } catch {
              /* ignore */
            }
          }
        },
      });

      await interaction.editReply(formatImportResult(result));
    } catch (err) {
      console.error("[roles-import] Erreur :", err);
      const msg =
        err instanceof Error ? err.message : "Erreur inconnue pendant l'import.";
      try {
        await interaction.editReply(`❌ Interrompu : ${msg}`);
      } catch {
        /* ignore */
      }
    }
  },
};
