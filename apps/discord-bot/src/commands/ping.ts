import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types.js";
import { api } from "../lib/api.js";
import { COLORS, BRAND } from "../lib/theme.js";

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Verifie la latence du bot et la connexion a l'API"),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const apiOnline = await api.isOnline();
    const latency = Math.round(interaction.client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor(apiOnline ? COLORS.success : COLORS.warning)
      .setTitle("Etat du bot")
      .addFields(
        {
          name: "Latence Discord",
          value: latency >= 0 ? `${latency} ms` : "—",
          inline: true,
        },
        {
          name: "API REDLAKES",
          value: apiOnline ? "En ligne" : "Hors ligne",
          inline: true,
        },
      )
      .setFooter({ text: BRAND.footer });
    await interaction.editReply({ embeds: [embed] });
  },
};
