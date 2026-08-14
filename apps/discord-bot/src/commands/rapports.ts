import {
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "./types.js";
import { api, ApiError } from "../lib/api.js";
import { COLORS } from "../lib/theme.js";

const TYPE_LABELS: Record<string, string> = {
  INCIDENT: "Incident",
  AUTHORIZATION: "Autorisation",
  MEMO: "Mémo",
  EQUIPMENT: "Matériel",
};

export const rapports: Command = {
  data: new SlashCommandBuilder()
    .setName("rapports")
    .setDescription("[Staff] Rapports RP en attente sur l'intranet Site-12")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const reports = await api.listPendingReports();

      if (reports.length === 0) {
        await interaction.editReply("Aucun rapport RP en attente sur l'intranet.");
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(COLORS.redlake)
        .setTitle("Rapports RP — en attente")
        .setDescription(
          `${reports.length} rapport(s) à traiter sur **/staff** du site.`,
        );

      for (const r of reports.slice(0, 5)) {
        const p = r.user.player;
        const rpName = p
          ? [p.rpFirstName, p.rpLastName].filter(Boolean).join(" ")
          : null;
        const agent = rpName
          ? `${rpName} (${r.user.minecraftUsername})`
          : (r.user.minecraftUsername ?? "Agent");

        embed.addFields({
          name: `${TYPE_LABELS[r.type] ?? r.type} — ${r.subject.slice(0, 60)}`,
          value: [
            `**Agent :** ${agent}`,
            p ? `**Grade :** ${p.grade}` : "",
            `**Extrait :** ${r.content.slice(0, 200)}${r.content.length > 200 ? "…" : ""}`,
          ]
            .filter(Boolean)
            .join("\n"),
        });
      }

      if (reports.length > 5) {
        embed.setFooter({ text: `+ ${reports.length - 5} autre(s) rapport(s)` });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Impossible de récupérer les rapports.";
      await interaction.editReply(`Erreur : ${msg}`);
    }
  },
};
