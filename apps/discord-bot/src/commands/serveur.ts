import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "./types.js";
import { config } from "../config.js";
import { COLORS, BRAND } from "../lib/theme.js";

interface McStatus {
  online: boolean;
  players?: { online: number; max: number };
  version?: string;
  motd?: { clean?: string[] };
}

async function fetchStatus(ip: string): Promise<McStatus> {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { online: false };
    return (await res.json()) as McStatus;
  } catch {
    return { online: false };
  }
}

export const serveur: Command = {
  data: new SlashCommandBuilder()
    .setName("serveur")
    .setDescription("Statut du serveur Minecraft REDLAKES et IP de connexion"),

  async execute(interaction) {
    await interaction.deferReply();

    if (!config.serverOpen) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.warning)
        .setTitle("Serveur en preparation")
        .setDescription(
          "Le serveur Minecraft n'est **pas encore ouvert**.\n" +
            "L'encyclopedie et les candidatures sont deja accessibles.",
        )
        .addFields({ name: "IP (a venir)", value: `\`${config.minecraftIp}\`` })
        .setFooter({ text: BRAND.footer });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Site")
          .setStyle(ButtonStyle.Link)
          .setURL(config.siteUrl),
        new ButtonBuilder()
          .setLabel("Candidater")
          .setStyle(ButtonStyle.Link)
          .setURL(`${config.siteUrl}/candidatures`),
      );
      await interaction.editReply({ embeds: [embed], components: [row] });
      return;
    }

    const status = await fetchStatus(config.minecraftIp);
    const embed = new EmbedBuilder()
      .setColor(status.online ? COLORS.success : COLORS.danger)
      .setTitle(status.online ? "Serveur en ligne" : "Serveur hors ligne")
      .addFields(
        { name: "IP", value: `\`${config.minecraftIp}\``, inline: true },
        {
          name: "Joueurs",
          value: status.players
            ? `${status.players.online} / ${status.players.max}`
            : "—",
          inline: true,
        },
        { name: "Version", value: status.version ?? "—", inline: true },
      )
      .setFooter({ text: BRAND.footer })
      .setTimestamp();

    if (status.motd?.clean?.length) {
      embed.setDescription(status.motd.clean.join("\n"));
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
