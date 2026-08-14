import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types.js";
import { api, ApiError, type GradeInfo } from "../lib/api.js";
import { COLORS, BRAND } from "../lib/theme.js";

const BRANCH_LABELS: Record<string, string> = {
  omega: "Conseil Omega",
  direction: "Direction",
  securite: "Securite",
  scientifique: "Scientifique",
  maintenance: "Maintenance",
  general: "General",
  classes: "Personnel detenu",
};

const BRANCH_CHOICES = [
  { name: "Conseil Omega", value: "omega" },
  { name: "Securite", value: "securite" },
  { name: "Scientifique", value: "scientifique" },
  { name: "Maintenance", value: "maintenance" },
  { name: "General", value: "general" },
];

function formatGradeLine(g: GradeInfo): string {
  const pay = g.pay != null ? `${g.pay.toLocaleString("fr-FR")} $` : "—";
  const quota = g.quota != null ? `×${g.quota}` : "";
  return `${g.name} — ${pay} ${quota}`.trim();
}

export const grades: Command = {
  data: new SlashCommandBuilder()
    .setName("grades")
    .setDescription("Hierarchie et grades du Site-12 (source : site REDLAKES)")
    .addStringOption((opt) =>
      opt
        .setName("branche")
        .setDescription("Branche a detailler")
        .addChoices(...BRANCH_CHOICES),
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const choice = interaction.options.getString("branche");

    let catalog: GradeInfo[];
    try {
      catalog = await api.getGrades();
    } catch (err) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.danger)
        .setTitle("Erreur")
        .setDescription(
          err instanceof ApiError
            ? err.message
            : "Catalogue de grades indisponible.",
        )
        .setFooter({ text: BRAND.footer });
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (!choice) {
      const omega = catalog
        .filter((g) => g.branch === "omega")
        .sort((a, b) => b.clearance - a.clearance || (b.pay ?? 0) - (a.pay ?? 0));
      const totalPayroll = catalog.reduce((sum, g) => sum + (g.pay ?? 0), 0);
      const branchCounts = BRANCH_CHOICES.map(
        (b) => `**${b.name}** — ${catalog.filter((g) => g.branch === b.value).length} grades`,
      ).join("\n");

      const embed = new EmbedBuilder()
        .setColor(COLORS.redlake)
        .setTitle("Site-12 — Hierarchie")
        .setDescription("Utilise `/grades branche:` pour le detail d'une branche.")
        .addFields(
          {
            name: "Conseil Omega",
            value: omega.map(formatGradeLine).join("\n") || "—",
          },
          { name: "Branches", value: branchCounts },
          {
            name: "Masse salariale de reference / semaine",
            value: `${totalPayroll.toLocaleString("fr-FR")} $`,
          },
        )
        .setFooter({ text: `${BRAND.footer} — ${catalog.length} grades references` });
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const branchGrades = catalog
      .filter((g) => g.branch === choice)
      .sort((a, b) => b.clearance - a.clearance || (b.pay ?? 0) - (a.pay ?? 0));

    if (branchGrades.length === 0) {
      await interaction.editReply({
        content: "Aucun grade reference pour cette branche.",
      });
      return;
    }

    const department = branchGrades.find((g) => g.departmentRef)?.departmentRef;

    const embed = new EmbedBuilder()
      .setColor(COLORS.redlakeGlow)
      .setTitle(BRANCH_LABELS[choice] ?? choice)
      .setDescription(
        department ? `**Departement :** ${department.name}` : null,
      )
      .addFields({
        name: `Grades (paye / quota) — ${branchGrades.length}`,
        value: branchGrades.map(formatGradeLine).join("\n").slice(0, 1024),
      })
      .setFooter({ text: `${BRAND.footer} — equipes/chambres personnalisables in-game` });

    await interaction.editReply({ embeds: [embed] });
  },
};
