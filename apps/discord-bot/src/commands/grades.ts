import {
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "./types.js";
import { COLORS, BRAND } from "../lib/theme.js";
import {
  departments,
  omegaCouncil,
  findDepartment,
  TOTAL_WEEKLY_PAYROLL,
} from "../lib/site12.js";

export const grades: Command = {
  data: new SlashCommandBuilder()
    .setName("grades")
    .setDescription("Hierarchie et grades du Site-12")
    .addStringOption((opt) =>
      opt
        .setName("departement")
        .setDescription("Departement a detailler")
        .addChoices(
          { name: "Conseil Omega", value: "omega" },
          { name: "Securite", value: "securite" },
          { name: "Scientifique", value: "recherche" },
          { name: "Maintenance", value: "maintenance" },
          { name: "General", value: "general" },
        ),
    ),

  async execute(interaction) {
    const choice = interaction.options.getString("departement");

    if (!choice) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.redlake)
        .setTitle("Site-12 — Hierarchie")
        .setDescription(
          "Utilise `/grades departement:` pour le detail d'une branche.",
        )
        .addFields(
          {
            name: "Conseil Omega",
            value: omegaCouncil
              .map((o) => `${o.role} — ${o.pay.toLocaleString("fr-FR")} $`)
              .join("\n"),
          },
          {
            name: "Branches Omega",
            value: departments
              .map((d) => `**${d.omega}** ${d.director}`)
              .join("\n"),
          },
          {
            name: "Masse salariale / semaine",
            value: `${TOTAL_WEEKLY_PAYROLL.toLocaleString("fr-FR")} $`,
          },
        )
        .setFooter({ text: BRAND.footer });
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (choice === "omega") {
      const embed = new EmbedBuilder()
        .setColor(COLORS.redlakeGlow)
        .setTitle("Conseil Omega")
        .setDescription(
          omegaCouncil
            .map((o) => `**${o.role}** — ${o.pay.toLocaleString("fr-FR")} $/sem.`)
            .join("\n"),
        )
        .setFooter({ text: BRAND.footer });
      await interaction.reply({ embeds: [embed] });
      return;
    }

    const dept = findDepartment(choice);
    if (!dept) {
      await interaction.reply({
        content: "Departement inconnu.",
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(COLORS.redlake)
      .setTitle(`${dept.name} (${dept.omega})`)
      .setDescription(
        `**Directeur :** ${dept.director}\n**Utilites :** ${dept.utilities.join(", ")}`,
      )
      .setFooter({ text: `${BRAND.footer} — equipes/chambres personnalisables in-game` });

    if (dept.grades.length) {
      embed.addFields({
        name: "Grades (paye / quota)",
        value: dept.grades
          .map(
            (g) =>
              `${g.name} — ${g.pay.toLocaleString("fr-FR")} $ ×${g.quota}`,
          )
          .join("\n")
          .slice(0, 1024),
      });
    } else {
      embed.addFields({
        name: "Equipes",
        value:
          "Secretariat, Restauration, Nettoyage, Communication — noms d'equipes definis in-game.",
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
