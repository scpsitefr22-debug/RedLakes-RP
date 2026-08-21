import { MessageFlags, type ButtonInteraction } from "discord.js";
import { api, ApiError } from "./api.js";
import { applyMemberRoles } from "./roles.js";

const PROFIL_RESYNC_PREFIX = "rl:profil:resync:";

export function isProfilInteraction(customId: string): boolean {
  return customId.startsWith(PROFIL_RESYNC_PREFIX);
}

export function profilResyncCustomId(discordId: string): string {
  return `${PROFIL_RESYNC_PREFIX}${discordId}`;
}

/** Bouton "Resynchroniser" sur /profil — reservé au proprietaire du profil affiche */
export async function handleProfilResyncButton(
  interaction: ButtonInteraction,
): Promise<void> {
  const targetId = interaction.customId.slice(PROFIL_RESYNC_PREFIX.length);

  if (interaction.user.id !== targetId) {
    await interaction.reply({
      content: "Tu ne peux resynchroniser que ton propre profil.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Cette action n'est disponible que sur le serveur.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const profile = await api.getProfileByDiscord(interaction.user.id);
    const result = await applyMemberRoles(interaction.member, profile);
    const warnings = [result.roleApplyError, result.nicknameError]
      .filter((w): w is string => Boolean(w))
      .map((w) => `⚠️ ${w}`)
      .join("\n");

    await interaction.editReply(
      `🔄 Resynchronisé : **${profile.grade}**${warnings ? `\n${warnings}` : ""}`,
    );
  } catch (err) {
    await interaction.editReply(
      err instanceof ApiError
        ? err.message
        : "Resynchronisation impossible.",
    );
  }
}
