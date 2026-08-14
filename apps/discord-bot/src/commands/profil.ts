import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types.js";
import { api, ApiError } from "../lib/api.js";
import { config } from "../config.js";
import { COLORS, BRAND, mcBody } from "../lib/theme.js";
import { applyMemberRoles } from "../lib/roles.js";
import { formatRpNickname } from "../lib/format-rp-nickname.js";

function formatPlaytime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export const profil: Command = {
  data: new SlashCommandBuilder()
    .setName("profil")
    .setDescription("Affiche le profil REDLAKES (le tien ou celui d'un membre)")
    .addUserOption((opt) =>
      opt
        .setName("membre")
        .setDescription("Membre dont afficher le profil (par defaut : toi)"),
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const target = interaction.options.getUser("membre") ?? interaction.user;

    try {
      const p = await api.getProfileByDiscord(target.id);

      if (
        target.id === interaction.user.id &&
        interaction.inCachedGuild()
      ) {
        await applyMemberRoles(interaction.member, p).catch(() => undefined);
      }

      const seniority = new Date(p.seniority).toLocaleDateString("fr-FR");
      const department = p.gradeInfo?.departmentRef?.name;
      const salary = p.gradeInfo?.pay;

      const embed = new EmbedBuilder()
        .setColor(COLORS.redlake)
        .setTitle(`Dossier personnel — ${p.minecraftUsername ?? "Inconnu"}`)
        .setThumbnail(p.minecraftUsername ? mcBody(p.minecraftUsername) : null)
        .addFields(
          { name: "Grade", value: p.grade, inline: true },
          { name: "Faction", value: p.faction, inline: true },
          ...(department ? [{ name: "Departement", value: department, inline: true }] : []),
          ...(salary != null
            ? [{ name: "Salaire", value: `${salary.toLocaleString("fr-FR")} $/sem.`, inline: true }]
            : []),
          {
            name: "Identité RP",
            value:
              [p.rpFirstName, p.rpLastName].filter(Boolean).join(" ") || "—",
            inline: true,
          },
          {
            name: "Pseudo Discord",
            value: formatRpNickname(p),
            inline: false,
          },
          {
            name: "Equipe",
            value: p.teamName ?? "—",
            inline: true,
          },
          {
            name: "Habilitation",
            value: `Niveau ${p.clearance}`,
            inline: true,
          },
          {
            name: "Reputation",
            value: `${p.reputation}/100`,
            inline: true,
          },
          { name: "Sanctions", value: String(p.sanctions), inline: true },
          {
            name: "Temps de jeu",
            value: formatPlaytime(p.playtime),
            inline: true,
          },
          { name: "Anciennete", value: seniority, inline: true },
          {
            name: "Medailles",
            value: p.medals.length ? p.medals.join(", ") : "Aucune",
            inline: true,
          },
        )
        .setFooter({ text: BRAND.footer })
        .setTimestamp(new Date(p.roleUpdatedAt));

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      const notLinked = err instanceof ApiError && err.status === 404;
      const embed = new EmbedBuilder()
        .setColor(notLinked ? COLORS.warning : COLORS.danger)
        .setTitle(notLinked ? "Compte non lie" : "Erreur")
        .setDescription(
          notLinked
            ? `${target.id === interaction.user.id ? "Tu n'as" : "Ce membre n'a"} pas encore lie de compte Minecraft.\n` +
                `Utilise \`/link\` avec un code genere sur ${config.siteUrl}/dashboard`
            : err instanceof ApiError
              ? err.message
              : "Erreur inconnue.",
        )
        .setFooter({ text: BRAND.footer });
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
