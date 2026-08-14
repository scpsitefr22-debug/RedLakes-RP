import {
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "./types.js";
import { staffGuard } from "../lib/role-admin.js";
import { postRolesHub } from "../lib/roles-hub-handlers.js";

export const hubRoles: Command = {
  data: new SlashCommandBuilder()
    .setName("hub-roles")
    .setDescription("[Staff] Panneau interactif pour gérer les rôles (style Draftbot)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addBooleanOption((opt) =>
      opt
        .setName("prive")
        .setDescription("Visible uniquement par toi (défaut : panneau public dans le salon)")
        .setRequired(false),
    ),

  async execute(interaction) {
    if (!(await staffGuard(interaction))) return;
    const prive = interaction.options.getBoolean("prive") ?? false;
    await postRolesHub(interaction, { ephemeral: prive });
  },
};
