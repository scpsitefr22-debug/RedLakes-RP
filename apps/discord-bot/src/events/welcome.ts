import {
  EmbedBuilder,
  TextChannel,
  type GuildMember,
} from "discord.js";
import { config } from "../config.js";
import { COLORS, BRAND } from "../lib/theme.js";

export async function handleMemberJoin(member: GuildMember): Promise<void> {
  if (!config.channels.welcome) return;

  try {
    const channel = await member.client.channels.fetch(config.channels.welcome);
    if (!(channel instanceof TextChannel)) return;

    const embed = new EmbedBuilder()
      .setColor(COLORS.redlake)
      .setTitle(`Bienvenue sur ${BRAND.name}`)
      .setDescription(
        `Bienvenue <@${member.id}> au ${BRAND.site12}.\n\n` +
          "Pour lier ton compte Minecraft et synchroniser ton grade :\n" +
          "1. Va sur le tableau de bord du site et genere un code\n" +
          "2. Reviens ici et tape `/link <code>`\n\n" +
          "Utilise `/aide` pour voir toutes les commandes.",
      )
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "Site", value: config.siteUrl, inline: true },
        {
          name: "Serveur",
          value: config.serverOpen
            ? `\`${config.minecraftIp}\``
            : "Ouverture prochaine",
          inline: true,
        },
      )
      .setFooter({ text: BRAND.footer });

    await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
  } catch (err) {
    console.warn("[welcome] envoi impossible :", err);
  }
}
