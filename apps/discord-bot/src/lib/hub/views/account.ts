import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ModalSubmitInteraction,
} from "discord.js";
import { api, ApiError } from "../../api.js";
import { config } from "../../../config.js";
import { COLORS, BRAND } from "../../theme.js";
import { applyMemberRoles, removeManagedRoles, logToChannel } from "../../roles.js";
import {
  backButton,
  backRow,
  hubId,
  viewPayload,
  type NavInteraction,
  type View,
} from "../navigation.js";
import { renderProfil } from "./profile.js";

export function buildLinkModal(ownerId: string): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(hubId(ownerId, "modal", "link"))
    .setTitle("Lier mon compte")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("code")
          .setLabel("Code généré sur le site (Tableau de bord)")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMinLength(4)
          .setMaxLength(12),
      ),
    );
}

export async function handleLinkModalSubmit(
  interaction: ModalSubmitInteraction,
  ownerId: string,
): Promise<void> {
  const code = interaction.fields.getTextInputValue("code").trim();
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    const result = await api.linkDiscord({
      code,
      discordId: ownerId,
      discordUsername: interaction.user.username,
    });
    if (interaction.inCachedGuild()) {
      const profile = await api.getProfileByDiscord(ownerId);
      await applyMemberRoles(interaction.member, profile).catch(() => undefined);
    }
    await interaction.editReply(
      `✅ Compte lié à **${result.minecraftUsername}**.\nTon grade in-game sera synchronisé automatiquement. ` +
        `Rouvre \`/hub\` → **Mon profil** pour voir la mise à jour.`,
    );
    await logToChannel(interaction.client, `<@${ownerId}> lié à **${result.minecraftUsername}** (via /hub)`);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Erreur inconnue lors de la liaison.";
    await interaction.editReply(
      `❌ ${message}\n\nGénère un nouveau code sur le site : ${config.siteUrl}/dashboard`,
    );
  }
}

export function renderUnlinkConfirm(ownerId: string): View {
  const embed = new EmbedBuilder()
    .setColor(COLORS.warning)
    .setTitle("🔓 Délier mon compte")
    .setDescription(
      "Ton compte Discord sera délié du compte Minecraft. " +
        "Tu peux relier ton compte à tout moment avec un nouveau code.\n\n**Confirmer la déliaison ?**",
    )
    .setFooter({ text: BRAND.footer });
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(hubId(ownerId, "unlinkconfirm"))
      .setLabel("Oui, délier")
      .setStyle(ButtonStyle.Danger),
    backButton(ownerId, "menu"),
  );
  return { embeds: [embed], components: [row] };
}

export async function handleUnlinkConfirm(interaction: NavInteraction, ownerId: string): Promise<void> {
  await interaction.deferUpdate();
  try {
    const result = await api.unlinkDiscord(ownerId);
    if (interaction.inCachedGuild()) {
      await removeManagedRoles(interaction.member).catch(() => undefined);
    }
    await logToChannel(interaction.client, `<@${ownerId}> a délié son compte (via /hub)`);
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle("Compte délié")
      .setDescription(`Ton Discord n'est plus relié à **${result.minecraftUsername ?? "ton compte"}**.`)
      .setFooter({ text: BRAND.footer });
    await interaction.editReply({ embeds: [embed], components: [backRow(ownerId, "menu")] });
  } catch (err) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.danger)
      .setTitle("Impossible de délier")
      .setDescription(err instanceof ApiError ? err.message : "Erreur lors de la déliaison.")
      .setFooter({ text: BRAND.footer });
    await interaction.editReply({ embeds: [embed], components: [backRow(ownerId, "menu")] });
  }
}

export async function handleResync(interaction: NavInteraction, ownerId: string): Promise<void> {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Disponible uniquement sur le serveur.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.deferUpdate();
  try {
    const profile = await api.getProfileByDiscord(ownerId);
    await applyMemberRoles(interaction.member, profile);
  } catch {
    /* la resync des roles est best-effort, le message de profil montrera l'etat reel */
  }
  const view = await renderProfil(ownerId, interaction.guild);
  await interaction.editReply(viewPayload(view));
}
