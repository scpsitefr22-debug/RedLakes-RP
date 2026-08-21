import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  type Client,
} from "discord.js";
import { config } from "../../../config.js";
import { COLORS, BRAND } from "../../theme.js";
import { fetchMinecraftStatus } from "../../minecraft-status.js";
import { buildCoreStatusEmbed } from "../../core-status-view.js";
import { backButton, backRow, hubId, refreshButton, siteButton, type View } from "../navigation.js";
import { CANDIDATURE_TYPES, SITE_LINKS } from "../constants.js";

export async function renderServeur(ownerId: string): Promise<View> {
  if (!config.serverOpen) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.warning)
      .setTitle("🖥️ Serveur en préparation")
      .setDescription(
        "Le serveur Minecraft n'est **pas encore ouvert**.\n" +
          "L'encyclopédie et les candidatures sont déjà accessibles.",
      )
      .addFields({ name: "IP (à venir)", value: `\`${config.minecraftIp}\`` })
      .setFooter({ text: BRAND.footer });
    return { embeds: [embed], components: [backRow(ownerId, "menu")] };
  }

  const status = await fetchMinecraftStatus(config.minecraftIp);
  const embed = new EmbedBuilder()
    .setColor(status.online ? COLORS.success : COLORS.danger)
    .setTitle(status.online ? "🖥️ Serveur en ligne" : "🖥️ Serveur hors ligne")
    .addFields(
      { name: "IP", value: `\`${config.minecraftIp}\``, inline: true },
      {
        name: "Joueurs",
        value: status.players ? `${status.players.online} / ${status.players.max}` : "—",
        inline: true,
      },
      { name: "Version", value: status.version ?? "—", inline: true },
    )
    .setFooter({ text: BRAND.footer });
  if (status.motd?.clean?.length) embed.setDescription(status.motd.clean.join("\n"));
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    backButton(ownerId, "menu"),
    refreshButton(ownerId, "serveur"),
    siteButton(),
  );
  return { embeds: [embed], components: [row] };
}

function buildSiteSelect(ownerId: string): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(hubId(ownerId, "sitesel"))
      .setPlaceholder("Ouvrir une page...")
      .addOptions(
        Object.entries(SITE_LINKS).map(([value, s]) => ({
          label: s.label,
          value,
          description: s.desc.slice(0, 100),
        })),
      ),
  );
}

export function renderSiteOverview(ownerId: string): View {
  const embed = new EmbedBuilder()
    .setColor(COLORS.redlake)
    .setTitle("📖 Site & Encyclopédie REDLAKES")
    .setDescription(Object.values(SITE_LINKS).map((s) => `**${s.label}** — ${s.desc}`).join("\n"))
    .setFooter({ text: BRAND.footer });
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setLabel("Ouvrir le site").setStyle(ButtonStyle.Link).setURL(config.siteUrl),
  );
  return { embeds: [embed], components: [buildSiteSelect(ownerId), row, backRow(ownerId, "menu")] };
}

export function renderSiteSection(ownerId: string, key: string): View {
  const s = SITE_LINKS[key];
  if (!s) return renderSiteOverview(ownerId);
  const embed = new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle(s.label)
    .setDescription(s.desc)
    .setFooter({ text: BRAND.footer });
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel(`Ouvrir ${s.label}`)
      .setStyle(ButtonStyle.Link)
      .setURL(`${config.siteUrl}${s.path}`),
  );
  return { embeds: [embed], components: [buildSiteSelect(ownerId), row, backRow(ownerId, "menu")] };
}

export function renderCandidater(ownerId: string): View {
  const embed = new EmbedBuilder()
    .setColor(COLORS.redlake)
    .setTitle("📜 Rejoindre l'équipe REDLAKES")
    .setDescription(
      "Le serveur est en préparation et **le recrutement est ouvert**. " +
        "Choisis un poste et postule sur le site :",
    )
    .addFields(CANDIDATURE_TYPES.map((t) => ({ name: t.label, value: t.desc, inline: true })))
    .setFooter({ text: BRAND.footer });
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setLabel("Postuler").setStyle(ButtonStyle.Link).setURL(`${config.siteUrl}/candidatures`),
    new ButtonBuilder().setLabel("Discord").setStyle(ButtonStyle.Link).setURL(config.discordInvite),
  );
  return { embeds: [embed], components: [row, backRow(ownerId, "menu")] };
}

export async function renderEtat(ownerId: string, client: Client): Promise<View> {
  const embed = await buildCoreStatusEmbed(client);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    backButton(ownerId, "menu"),
    refreshButton(ownerId, "etat"),
    siteButton(),
  );
  return { embeds: [embed], components: [row] };
}
