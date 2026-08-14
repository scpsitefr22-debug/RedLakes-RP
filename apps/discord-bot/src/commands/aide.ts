import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types.js";
import { COLORS, BRAND } from "../lib/theme.js";
import { config } from "../config.js";

export const aide: Command = {
  data: new SlashCommandBuilder()
    .setName("aide")
    .setDescription("Liste des commandes du bot REDLAKES"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.redlake)
      .setTitle("Bot REDLAKES — Commandes")
      .setDescription("Le bot officiel du serveur SCP-RP REDLAKES.")
      .addFields(
        {
          name: "/link `code`",
          value: `Lie ton compte (code genere sur ${config.siteUrl}/dashboard).`,
        },
        { name: "/unlink", value: "Delie ton compte Discord." },
        { name: "/profil [membre]", value: "Affiche un dossier personnel." },
        {
          name: "/identite `prenom` `nom`",
          value: "Enregistre ton prénom/nom RP et met à jour ton pseudo Discord.",
        },
        { name: "/serveur", value: "Statut du serveur Minecraft + IP." },
        { name: "/grades [departement]", value: "Hierarchie du Site-12." },
        { name: "/wiki [section]", value: "Liens vers l'encyclopedie." },
        { name: "/candidature", value: "Postuler pour rejoindre l'equipe." },
        { name: "/ping", value: "Verifie que le bot et l'API repondent." },
        {
          name: "/sync-roles",
          value: "Synchronise grade + pseudo Discord depuis le site/Minecraft.",
        },
        {
          name: "/roles-organize",
          value: "[Staff] Range les rôles Site-12 (╰┈➤ + grades en dessous).",
        },
        {
          name: "/roles-check",
          value: "[Staff] Liste les rôles manquants sur le serveur.",
        },
        {
          name: "/rapports",
          value: "[Staff] Rapports RP en attente (intranet Site-12).",
        },
        {
          name: "/roles-import",
          value:
            "[Staff] Colle une liste de rôles (ou fichier .txt) — le bot crée et range sous tes catégories.",
        },
        {
          name: "/hub-roles",
          value:
            "[Staff] Panneau interactif rôles (boutons, menus) — style Draftbot.",
        },
        {
          name: "/roles-admin",
          value: "[Staff] Alias du hub rôles (même panneau).",
        },
        {
          name: "/roles-scan",
          value: "[Staff] Re-scanne les roles RP et le mapping catalogue.",
        },
      )
      .setFooter({ text: BRAND.footer });
    await interaction.reply({ embeds: [embed] });
  },
};
