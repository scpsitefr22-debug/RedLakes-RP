import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type ButtonInteraction,
  type StringSelectMenuInteraction,
} from "discord.js";
import { config } from "../../config.js";
import { COLORS, BRAND } from "../theme.js";
import { HUB_PREFIX } from "./constants.js";

export type NavInteraction = ButtonInteraction | StringSelectMenuInteraction;
export type View = {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<any>[];
  files?: AttachmentBuilder[];
};
export type BackTarget = "menu" | "staff" | "allfactions" | "alldepartments" | "organisation";

export function hubId(ownerId: string, ...parts: string[]): string {
  return `${HUB_PREFIX}${ownerId}:${parts.join(":")}`;
}

export function isMainHubInteraction(customId: string): boolean {
  return customId.startsWith(HUB_PREFIX);
}

export function siteButton(): ButtonBuilder {
  return new ButtonBuilder()
    .setLabel("🌐 Site REDLAKES")
    .setStyle(ButtonStyle.Link)
    .setURL(config.siteUrl);
}

const BACK_LABELS: Record<BackTarget, string> = {
  menu: "⬅ Menu principal",
  staff: "⬅ Espace Staff",
  allfactions: "⬅ Toutes les factions",
  alldepartments: "⬅ Tous les départements",
  organisation: "⬅ Organisation",
};

export function backButton(ownerId: string, to: BackTarget): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(hubId(ownerId, "goto", to))
    .setLabel(BACK_LABELS[to])
    .setStyle(ButtonStyle.Secondary);
}

export function resyncButton(ownerId: string): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(hubId(ownerId, "resync"))
    .setLabel("🔄 Resynchroniser")
    .setStyle(ButtonStyle.Primary);
}

/** Recharge la page courante avec des donnees fraiches (utile pour les pages a donnee vivante) */
export function refreshButton(ownerId: string, page: string): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(hubId(ownerId, "refresh", page))
    .setLabel("🔄 Actualiser")
    .setStyle(ButtonStyle.Secondary);
}

export function closeButton(ownerId: string): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(hubId(ownerId, "close"))
    .setLabel("❌ Fermer")
    .setStyle(ButtonStyle.Danger);
}

export function backRow(ownerId: string, to: BackTarget): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(backButton(ownerId, to), siteButton());
}

/**
 * Convertit une View en payload editReply/reply — efface toujours les
 * anciennes pieces jointes (Discord les conserve sinon quand on change de
 * page sans image, ex. apres avoir vu "Mon profil").
 */
export function viewPayload(view: View): {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<any>[];
  files: AttachmentBuilder[];
  attachments: never[];
} {
  return {
    embeds: view.embeds,
    components: view.components,
    files: view.files ?? [],
    attachments: [],
  };
}

export function noticeView(
  ownerId: string,
  title: string,
  description: string,
  backTo: BackTarget = "menu",
): View {
  const embed = new EmbedBuilder()
    .setColor(COLORS.redlake)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: BRAND.footer });
  return { embeds: [embed], components: [backRow(ownerId, backTo)] };
}
