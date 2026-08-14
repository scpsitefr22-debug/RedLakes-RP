import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types.js";
import { api, ApiError } from "../lib/api.js";
import { COLORS, BRAND } from "../lib/theme.js";
import { removeManagedRoles, logToChannel } from "../lib/roles.js";

export const unlink: Command = {
  data: new SlashCommandBuilder()
    .setName("unlink")
    .setDescription("Delie ton compte Discord de ton compte Minecraft"),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const result = await api.unlinkDiscord(interaction.user.id);

      if (interaction.inCachedGuild()) {
        await removeManagedRoles(interaction.member).catch(() => undefined);
      }

      const embed = new EmbedBuilder()
        .setColor(COLORS.warning)
        .setTitle("Compte delie")
        .setDescription(
          `Ton Discord n'est plus relie a **${result.minecraftUsername ?? "ton compte"}**.`,
        )
        .setFooter({ text: BRAND.footer });
      await interaction.editReply({ embeds: [embed] });
      await logToChannel(
        interaction.client,
        `<@${interaction.user.id}> a delie son compte`,
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Erreur lors de la deliaison.";
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.danger)
            .setTitle("Impossible de delier")
            .setDescription(message)
            .setFooter({ text: BRAND.footer }),
        ],
      });
    }
  },
};
