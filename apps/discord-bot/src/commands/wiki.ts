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

const SECTIONS: Record<string, { label: string; path: string; desc: string }> = {
  wiki: { label: "Wiki SCP", path: "/wiki", desc: "Fiches des anomalies confinees." },
  factions: { label: "Factions", path: "/factions", desc: "Fondation, AEGIS, Chaos, Main du Serpent..." },
  aegis: { label: "A.E.G.I.S.", path: "/factions/aegis", desc: "Autorite de controle supranationale." },
  site12: { label: "Site-12", path: "/departements/site-12", desc: "Organigramme complet." },
  carte: { label: "Carte", path: "/carte", desc: "Carte interactive de REDLAKES." },
  lore: { label: "Lore", path: "/lore", desc: "Univers, chronologie, personnages." },
};

export const wiki: Command = {
  data: new SlashCommandBuilder()
    .setName("wiki")
    .setDescription("Liens vers l'encyclopedie REDLAKES")
    .addStringOption((opt) =>
      opt
        .setName("section")
        .setDescription("Section a ouvrir")
        .addChoices(
          ...Object.entries(SECTIONS).map(([value, s]) => ({
            name: s.label,
            value,
          })),
        ),
    ),

  async execute(interaction) {
    const key = interaction.options.getString("section");

    if (key && SECTIONS[key]) {
      const s = SECTIONS[key];
      const embed = new EmbedBuilder()
        .setColor(COLORS.info)
        .setTitle(s.label)
        .setDescription(s.desc)
        .setFooter({ text: BRAND.footer });
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel(`Ouvrir ${s.label}`)
          .setStyle(ButtonStyle.Link)
          .setURL(`${config.siteUrl}${s.path}`),
      );
      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(COLORS.redlake)
      .setTitle("Encyclopedie REDLAKES")
      .setDescription(
        Object.values(SECTIONS)
          .map((s) => `**${s.label}** — ${s.desc}`)
          .join("\n"),
      )
      .setFooter({ text: BRAND.footer });
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Ouvrir le site")
        .setStyle(ButtonStyle.Link)
        .setURL(config.siteUrl),
    );
    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
