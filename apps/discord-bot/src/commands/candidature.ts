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

const TYPES = [
  { label: "Staff", value: "STAFF", desc: "Moderation, administration, support." },
  { label: "Redacteur Lore", value: "LORE", desc: "SCP, factions, chronologie." },
  { label: "Builder / Map", value: "BUILD", desc: "Site-12, ville, zones RP." },
  { label: "MTF", value: "MTF", desc: "Interventions et evenements." },
  { label: "Recherche", value: "RECHERCHE", desc: "Chercheurs, scientifiques." },
  { label: "Community / Admin", value: "ADMINISTRATION", desc: "Discord, communication." },
];

export const candidature: Command = {
  data: new SlashCommandBuilder()
    .setName("candidature")
    .setDescription("Postuler pour rejoindre l'equipe REDLAKES"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.redlake)
      .setTitle("Rejoindre l'equipe REDLAKES")
      .setDescription(
        "Le serveur est en preparation et **le recrutement est ouvert**. " +
          "Choisis un poste et postule sur le site :",
      )
      .addFields(
        TYPES.map((t) => ({
          name: t.label,
          value: t.desc,
          inline: true,
        })),
      )
      .setFooter({ text: BRAND.footer });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Postuler")
        .setStyle(ButtonStyle.Link)
        .setURL(`${config.siteUrl}/candidatures`),
      new ButtonBuilder()
        .setLabel("Discord")
        .setStyle(ButtonStyle.Link)
        .setURL(config.discordInvite),
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
