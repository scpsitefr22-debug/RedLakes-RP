import {
  PermissionFlagsBits,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "./types.js";
import { staffGuard } from "../lib/role-admin.js";
import {
  buildRoleCheckReport,
  formatRoleCheckReport,
} from "../lib/role-check-report.js";

export const rolesCheck: Command = {
  data: new SlashCommandBuilder()
    .setName("roles-check")
    .setDescription(
      "[Staff] Liste les rôles manquants sur le serveur vs catalogue Site-12",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    if (!(await staffGuard(interaction))) return;
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const report = await buildRoleCheckReport(interaction.guild);
      await interaction.editReply(formatRoleCheckReport(report));
    } catch (err) {
      console.error("[roles-check]", err);
      await interaction.editReply("❌ Impossible de scanner les rôles.");
    }
  },
};
