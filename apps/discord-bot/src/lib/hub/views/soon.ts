import { EmbedBuilder } from "discord.js";
import { COLORS, BRAND } from "../../theme.js";
import { backRow, type BackTarget, type View } from "../navigation.js";
import { SOON_LABELS, SOON_REASON } from "../constants.js";

export function renderSoon(ownerId: string, key: string, backTo: BackTarget): View {
  const label = SOON_LABELS[key] ?? key;
  const reason = SOON_REASON[key] ?? "Fonctionnalité pas encore branchée.";
  const embed = new EmbedBuilder()
    .setColor(COLORS.warning)
    .setTitle(`🚧 ${label}`)
    .setDescription(`Pas encore disponible.\n\n${reason}`)
    .setFooter({ text: BRAND.footer });
  return { embeds: [embed], components: [backRow(ownerId, backTo)] };
}
