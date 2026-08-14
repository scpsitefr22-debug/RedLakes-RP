import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types.js";
import { api, ApiError } from "../lib/api.js";
import { applyMemberRoles } from "../lib/roles.js";
import { formatRpNickname } from "../lib/format-rp-nickname.js";

export const identite: Command = {
  data: new SlashCommandBuilder()
    .setName("identite")
    .setDescription("Définir ton prénom et nom RP (pseudo Discord mis à jour)")
    .addStringOption((opt) =>
      opt
        .setName("prenom")
        .setDescription("Prénom RP (ex. Jean)")
        .setRequired(true)
        .setMaxLength(32),
    )
    .addStringOption((opt) =>
      opt
        .setName("nom")
        .setDescription("Nom RP (ex. Dupont)")
        .setRequired(true)
        .setMaxLength(32),
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const prenom = interaction.options.getString("prenom", true).trim();
    const nom = interaction.options.getString("nom", true).trim();

    try {
      const result = await api.updateRpIdentity({
        discordId: interaction.user.id,
        rpFirstName: prenom,
        rpLastName: nom,
      });

      if (interaction.inCachedGuild()) {
        const profile = await api.getProfileByDiscord(interaction.user.id);
        await applyMemberRoles(interaction.member, profile).catch(() => undefined);

        await interaction.editReply(
          `✅ **Identité RP enregistrée**\n` +
            `👤 ${prenom} ${nom}\n` +
            `💬 Pseudo Discord : **${formatRpNickname(profile)}**\n` +
            (result.discordSynced
              ? "🔄 Discord synchronisé."
              : "⚠️ Lie ton compte avec `/link` pour synchroniser."),
        );
      } else {
        await interaction.editReply(
          `✅ Identité enregistrée : **${prenom} ${nom}**`,
        );
      }
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 404
          ? "Compte non lié. Génère un code sur le site (`/dashboard`) puis `/link`."
          : err instanceof ApiError
            ? err.message
            : "Erreur lors de l'enregistrement.";
      await interaction.editReply(`❌ ${msg}`);
    }
  },
};
