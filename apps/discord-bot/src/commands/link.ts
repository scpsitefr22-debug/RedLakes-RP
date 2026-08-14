import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types.js";
import { api, ApiError } from "../lib/api.js";
import { config } from "../config.js";
import { COLORS, BRAND } from "../lib/theme.js";
import { applyMemberRoles, logToChannel } from "../lib/roles.js";

export const link: Command = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Lie ton compte Discord a ton compte Minecraft REDLAKES")
    .addStringOption((opt) =>
      opt
        .setName("code")
        .setDescription("Code genere sur le site (Tableau de bord)")
        .setRequired(true)
        .setMinLength(4)
        .setMaxLength(12),
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const code = interaction.options.getString("code", true).trim();

    try {
      const result = await api.linkDiscord({
        code,
        discordId: interaction.user.id,
        discordUsername: interaction.user.username,
      });

      // Synchronise pseudo + roles immediatement
      try {
        if (interaction.inCachedGuild()) {
          const profile = await api.getProfileByDiscord(interaction.user.id);
          await applyMemberRoles(interaction.member, profile);
        }
      } catch {
        /* la liaison a reussi, la sync de role est best-effort */
      }

      const embed = new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle("Compte lie")
        .setDescription(
          `Ton compte Discord est maintenant relie a **${result.minecraftUsername}**.\n` +
            "Ton grade in-game sera synchronise automatiquement ici.",
        )
        .setFooter({ text: BRAND.footer });

      await interaction.editReply({ embeds: [embed] });
      await logToChannel(
        interaction.client,
        `<@${interaction.user.id}> lie a **${result.minecraftUsername}**`,
      );
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Erreur inconnue lors de la liaison.";
      const embed = new EmbedBuilder()
        .setColor(COLORS.danger)
        .setTitle("Liaison impossible")
        .setDescription(
          `${message}\n\nGenere un nouveau code sur le site : ${config.siteUrl}/dashboard`,
        )
        .setFooter({ text: BRAND.footer });
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
