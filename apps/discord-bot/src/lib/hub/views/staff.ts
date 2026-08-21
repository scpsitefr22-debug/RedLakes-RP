import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ModalSubmitInteraction,
} from "discord.js";
import { api, ApiError } from "../../api.js";
import { COLORS, BRAND } from "../../theme.js";
import { assertStaff } from "../../role-admin.js";
import {
  backButton,
  hubId,
  noticeView,
  refreshButton,
  siteButton,
  type NavInteraction,
  type View,
} from "../navigation.js";

export async function renderRapports(ownerId: string): Promise<View> {
  try {
    const reports = await api.listPendingReports();
    const embed = new EmbedBuilder()
      .setColor(COLORS.staff)
      .setTitle("📑 Rapports RP — en attente")
      .setDescription(
        reports.length ? `${reports.length} rapport(s) à traiter sur **/staff**.` : "Aucun rapport en attente.",
      )
      .setFooter({ text: BRAND.footer });
    for (const r of reports.slice(0, 5)) {
      const p = r.user.player;
      const rpName = p ? [p.rpFirstName, p.rpLastName].filter(Boolean).join(" ") : null;
      const agent = rpName ? `${rpName} (${r.user.minecraftUsername})` : (r.user.minecraftUsername ?? "Agent");
      embed.addFields({
        name: `${r.type} — ${r.subject.slice(0, 60)}`,
        value: `${agent}${p ? ` — ${p.grade}` : ""}`,
      });
    }
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      backButton(ownerId, "staff"),
      refreshButton(ownerId, "rapports"),
      siteButton(),
    );
    return { embeds: [embed], components: [row] };
  } catch (err) {
    return noticeView(
      ownerId,
      "📑 Rapports RP",
      err instanceof ApiError ? err.message : "Indisponible.",
      "staff",
    );
  }
}

export async function renderTransmissions(ownerId: string): Promise<View> {
  try {
    const items = await api.getTransmissions(5);
    const embed = new EmbedBuilder()
      .setColor(COLORS.staff)
      .setTitle("📡 Dernières transmissions")
      .setFooter({ text: BRAND.footer });
    if (!items.length) {
      embed.setDescription("Aucune transmission récente.");
    }
    for (const t of items) {
      embed.addFields({
        name: `${t.channelLabel} — Niv. ${t.clearance}`,
        value: `${t.title}\n${(t.excerpt ?? t.body).slice(0, 150)}`,
      });
    }
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      backButton(ownerId, "staff"),
      refreshButton(ownerId, "transmissions"),
      siteButton(),
    );
    return { embeds: [embed], components: [row] };
  } catch (err) {
    return noticeView(
      ownerId,
      "📡 Transmissions",
      err instanceof ApiError ? err.message : "Indisponible.",
      "staff",
    );
  }
}

export function buildPlayerSearchModal(ownerId: string): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(hubId(ownerId, "modal", "joueurs"))
    .setTitle("Rechercher un joueur")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("username")
          .setLabel("Pseudo Minecraft")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(32),
      ),
    );
}

export async function handlePlayerSearchModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const username = interaction.fields.getTextInputValue("username").trim();
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    const p = await api.getPlayer(username);
    const embed = new EmbedBuilder()
      .setColor(COLORS.staff)
      .setTitle(`📁 ${p.minecraftUsername ?? username}`)
      .addFields(
        { name: "Grade", value: p.grade, inline: true },
        { name: "Faction", value: p.faction, inline: true },
        { name: "Sanctions", value: String(p.sanctions), inline: true },
      )
      .setFooter({ text: BRAND.footer });
    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    const notFound = err instanceof ApiError && err.status === 404;
    await interaction.editReply(
      notFound
        ? `Joueur introuvable : **${username}**.`
        : err instanceof ApiError
          ? err.message
          : "Erreur.",
    );
  }
}

export async function handleRolesEntry(interaction: NavInteraction): Promise<void> {
  if (!interaction.inCachedGuild() || !assertStaff(interaction)) {
    await interaction.reply({
      content: "Permission **Gérer les rôles** requise.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.deferUpdate();
  const { buildHubEmbed, buildHubComponents } = await import("../../roles-hub-ui.js");
  const { getRoleStatus } = await import("../../role-admin.js");
  const status = await getRoleStatus(interaction.guild);
  await interaction.followUp({
    embeds: [buildHubEmbed(status)],
    components: buildHubComponents(),
    flags: MessageFlags.Ephemeral,
  });
}
