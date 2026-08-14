import {
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "./types.js";
import { staffGuard } from "../lib/role-admin.js";
import { postRolesHub } from "../lib/roles-hub-handlers.js";

/** Alias vers le hub — même panneau que /hub-roles */
export const rolesAdmin: Command = {
  data: new SlashCommandBuilder()
    .setName("roles-admin")
    .setDescription("[Staff] Ouvre le hub de gestion des rôles")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    if (!(await staffGuard(interaction))) return;
    await postRolesHub(interaction, { ephemeral: false });
  },
};
