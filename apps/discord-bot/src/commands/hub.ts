import { SlashCommandBuilder } from "discord.js";
import type { Command } from "./types.js";
import { postMainHub } from "../lib/hub/dispatch.js";

export const hub: Command = {
  data: new SlashCommandBuilder()
    .setName("hub")
    .setDescription("Hub REDLAKES — accede a tout ce que le bot sait faire, en un seul endroit"),

  async execute(interaction) {
    await postMainHub(interaction);
  },
};
