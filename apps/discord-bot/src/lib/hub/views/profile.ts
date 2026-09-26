import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type Guild,
  type ModalSubmitInteraction,
} from "discord.js";
import { api, ApiError } from "../../api.js";
import { applyMemberRoles } from "../../roles.js";
import { buildProfilCard, refreshDossier } from "../../dossier-channel.js";
import {
  backButton,
  hubId,
  noticeView,
  refreshButton,
  resyncButton,
  siteButton,
  type View,
} from "../navigation.js";

const CARD_FILENAME = "profil-card.png";

export async function renderProfil(ownerId: string, guild: Guild | null): Promise<View> {
  try {
    const p = await api.getProfileByDiscord(ownerId);
    const { embed, cardPng } = await buildProfilCard(p);

    const files: AttachmentBuilder[] = [];
    if (cardPng) files.push(new AttachmentBuilder(cardPng, { name: CARD_FILENAME }));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      backButton(ownerId, "menu"),
      resyncButton(ownerId),
      refreshButton(ownerId, "profil"),
      siteButton(),
    );

    if (guild) refreshDossier(guild, ownerId, p).catch(() => undefined);

    return { embeds: [embed], components: [row], files };
  } catch (err) {
    const notLinked = err instanceof ApiError && err.status === 404;
    return noticeView(
      ownerId,
      notLinked ? "Compte non lié" : "Erreur",
      notLinked
        ? "Pas encore de compte Minecraft lié. Utilise **🔗 Lier mon compte** dans le menu principal."
        : err instanceof ApiError
          ? err.message
          : "Erreur inconnue.",
    );
  }
}

export function buildIdentiteModal(ownerId: string): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(hubId(ownerId, "modal", "identite"))
    .setTitle("Identité RP")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("prenom")
          .setLabel("Prénom RP")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(32),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("nom")
          .setLabel("Nom RP")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(32),
      ),
    );
}

export async function handleIdentiteModalSubmit(
  interaction: ModalSubmitInteraction,
  ownerId: string,
): Promise<void> {
  const prenom = interaction.fields.getTextInputValue("prenom").trim();
  const nom = interaction.fields.getTextInputValue("nom").trim();
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    await api.updateRpIdentity({ discordId: ownerId, rpFirstName: prenom, rpLastName: nom });
    if (interaction.inCachedGuild()) {
      const profile = await api.getProfileByDiscord(ownerId);
      await applyMemberRoles(interaction.member, profile).catch(() => undefined);
    }
    await interaction.editReply(
      `✅ Identité enregistrée : **${prenom} ${nom}**.\nRouvre \`/hub\` → **Mon profil** pour voir la mise à jour.`,
    );
  } catch (err) {
    await interaction.editReply(
      err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement.",
    );
  }
}
