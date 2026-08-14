import {
  PermissionFlagsBits,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "./types.js";
import { staffGuard } from "../lib/role-admin.js";
import { refreshRoleRegistry } from "../lib/discord-role-registry.js";
import { getServerRoleLayoutEntries } from "../lib/discord-server-layout.js";
import { organizeRolesFromUserList } from "../lib/role-organize-catalog.js";
import {
  describeRoleListParse,
  looksLikeRoleList,
  normalizeRoleListText,
  parseRoleListText,
  summarizeParsedList,
} from "../lib/role-list-parser.js";
import { enrichParsedEntries } from "../lib/role-list-import.js";

const MAX_TEXT = 4000;

function formatNewSeparators(names: string[]): string {
  if (!names.length) return "";
  return (
    `\n🆕 **${names.length}** catégorie(s) créée(s) : ` +
    names.slice(0, 5).join(", ") +
    (names.length > 5 ? ` (+${names.length - 5})` : "")
  );
}

function formatNotFoundGrades(notFound: string[]): string {
  const grades = notFound.filter(
    (n) => !n.startsWith("╰") && !n.startsWith("━") && !n.startsWith("【"),
  );
  if (!grades.length) return "";
  return (
    `\n\n⚠️ **${grades.length}** grade(s) pas encore sur le serveur — crée-les à la main :\n` +
    grades.slice(0, 6).map((n) => `• ${n}`).join("\n") +
    (grades.length > 6 ? `\n… et ${grades.length - 6} autre(s)` : "")
  );
}

export const rolesOrganize: Command = {
  data: new SlashCommandBuilder()
    .setName("roles-organize")
    .setDescription(
      "[Staff] Enregistre et range les rôles Site-12 (format ╰┈➤ Branche + grades)",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption((opt) =>
      opt
        .setName("liste")
        .setDescription("Liste personnalisée (sinon = mise en page officielle Site-12)")
        .setMaxLength(MAX_TEXT)
        .setRequired(false),
    )
    .addAttachmentOption((opt) =>
      opt
        .setName("fichier")
        .setDescription("Fichier .txt (sinon = mise en page officielle)")
        .setRequired(false),
    ),

  async execute(interaction) {
    if (!(await staffGuard(interaction))) return;
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const liste = interaction.options.getString("liste");
      const attachment = interaction.options.getAttachment("fichier");

      let text = liste?.trim() ?? "";
      let modeLabel = "**mise en page officielle Site-12**";

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
        modeLabel = "**ta liste**";
      }

      let parsed;
      if (text) {
        if (!looksLikeRoleList(text)) {
          await interaction.editReply(
            `Aucun rôle détecté (${describeRoleListParse(text)}).`,
          );
          return;
        }
        parsed = enrichParsedEntries(
          parseRoleListText(normalizeRoleListText(text)),
        );
        modeLabel = "**ta liste**";
      } else {
        parsed = getServerRoleLayoutEntries();
      }

      const summary = summarizeParsedList(parsed);

      await interaction.editReply(
        `⏳ Rangement ${modeLabel}…\n` +
          `📁 **${summary.separators}** branche(s) ╰┈➤ · **${summary.grades}** grade(s)\n` +
          `🛡️ Staff / Membre / Joueur non touchés`,
      );

      const result = await organizeRolesFromUserList(interaction.guild, parsed);

      await refreshRoleRegistry(interaction.guild, {
        ensureMissing: false,
        organize: false,
      });

      await interaction.editReply(
        `✅ **Rôles enregistrés et rangés** ${modeLabel}\n` +
          `🔧 **${result.positioned}** rôles repositionnés\n` +
          `📁 **${result.separatorsCreated}** catégories ╰┈➤ / ━━━ en place\n` +
          `🎨 **${result.colorsUpdated}** couleurs ajustées\n` +
          `📋 Registre bot mis à jour (mapping grades)\n` +
          `🛡️ Staff / Membre / Joueur **non touchés**` +
          formatNewSeparators(result.newSeparators) +
          formatNotFoundGrades(result.notFound) +
          `\n\nChaque **╰┈➤ Branche** a ses grades **juste en dessous**, comme sur tes screens.`,
      );
    } catch (err) {
      console.error("[roles-organize] Erreur :", err);
      await interaction.editReply(
        "❌ Échec. Vérifie que le rôle **Redlake** est au-dessus des grades RP.",
      );
    }
  },
};
