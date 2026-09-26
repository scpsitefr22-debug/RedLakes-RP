import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  type Guild,
} from "discord.js";
import type { PlayerProfile } from "./api.js";
import { COLORS, BRAND } from "./theme.js";
import { formatRpNickname } from "./format-rp-nickname.js";
import { generateRpCardPng } from "./rp-card.js";
import { siteButton } from "./hub/navigation.js";

const CARD_FILENAME = "profil-card.png";

const CATEGORY_NAME = "📁 DOSSIERS PERSONNEL";
const TOPIC_PREFIX = "RL-PROFILE:";

function slugifyChannelName(rpName: string | null, discordUsername: string): string {
  const base = rpName ? `${rpName}-${discordUsername}` : discordUsername;
  const slug = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return slug || "agent";
}

async function findOrCreateCategory(guild: Guild) {
  const existing = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && c.name === CATEGORY_NAME,
  );
  if (existing) return existing;
  return guild.channels.create({ name: CATEGORY_NAME, type: ChannelType.GuildCategory });
}

/** Roles avec permission staff (meme convention que assertStaff) — visibilite du dossier */
function staffRoleIds(guild: Guild): string[] {
  return guild.roles.cache
    .filter(
      (r) =>
        r.permissions.has(PermissionFlagsBits.ManageRoles) ||
        r.permissions.has(PermissionFlagsBits.ManageGuild),
    )
    .map((r) => r.id);
}

async function findExistingChannel(guild: Guild, discordId: string) {
  return guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && c.topic?.startsWith(`${TOPIC_PREFIX}${discordId}`),
  );
}

export interface DossierPayload {
  embeds: EmbedBuilder[];
  files?: AttachmentBuilder[];
  components?: ActionRowBuilder<ButtonBuilder>[];
}

/**
 * Cree (si besoin) et met a jour le salon dossier personnel d'un joueur —
 * edite le dernier message du bot plutot que d'en reposter un nouveau.
 * Best-effort : ne doit jamais faire echouer l'affichage du profil dans le hub.
 */
export async function upsertDossierChannel(
  guild: Guild,
  discordId: string,
  rpName: string | null,
  payload: DossierPayload,
): Promise<void> {
  try {
    const member = await guild.members.fetch(discordId).catch(() => null);
    if (!member) return;

    const name = slugifyChannelName(rpName, member.user.username);
    let channel = await findExistingChannel(guild, discordId);

    if (!channel) {
      const category = await findOrCreateCategory(guild);
      const staffIds = staffRoleIds(guild);
      channel = await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        parent: category.id,
        topic: `${TOPIC_PREFIX}${discordId} — Dossier personnel, gere automatiquement par /hub. Ne pas modifier ce topic.`,
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          {
            id: discordId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
          },
          ...staffIds.map((id) => ({
            id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
          })),
        ],
      });
    } else if (channel.name !== name) {
      await channel.setName(name).catch(() => undefined);
    }

    if (!channel.isTextBased()) return;

    const recent = await channel.messages.fetch({ limit: 10 }).catch(() => null);
    const lastBotMessage = recent?.find((m) => m.author.id === guild.client.user?.id);

    if (lastBotMessage) {
      await lastBotMessage.edit(payload);
    } else {
      await channel.send(payload);
    }
  } catch (err) {
    console.warn("[dossier-channel] Synchronisation echouee :", err);
  }
}

/** Construit l'embed + la carte RP d'un profil — partage entre /hub (Mon profil) et le dossier auto. */
export async function buildProfilCard(
  p: PlayerProfile,
): Promise<{ embed: EmbedBuilder; cardPng: Buffer | null; rpName: string | null }> {
  const rpName = [p.rpFirstName, p.rpLastName].filter(Boolean).join(" ") || null;

  const cardPng = await generateRpCardPng({
    minecraftUsername: p.minecraftUsername,
    rpName,
    grade: p.grade,
    factionName: p.faction,
    factionColor: p.factionInfo?.color ?? null,
    departmentName: p.gradeInfo?.departmentRef?.name ?? null,
    teamName: p.teamName,
  });

  const embed = new EmbedBuilder()
    .setColor(COLORS.redlake)
    .setTitle(`📁 Dossier personnel — ${p.minecraftUsername ?? "Inconnu"}`)
    .addFields(
      ...(p.gradeInfo?.pay != null
        ? [{ name: "Salaire", value: `${p.gradeInfo.pay.toLocaleString("fr-FR")} $/sem.`, inline: true }]
        : []),
      { name: "Sanctions", value: String(p.sanctions), inline: true },
      { name: "Pseudo Discord", value: formatRpNickname(p) },
    )
    .setFooter({ text: BRAND.footer });

  if (cardPng) embed.setImage(`attachment://${CARD_FILENAME}`);

  return { embed, cardPng, rpName };
}

/**
 * Rafraichit le salon dossier d'un joueur a partir de son profil deja recupere —
 * a appeler a chaque fois que son grade/identite change reellement (pas
 * seulement quand il ouvre /hub lui-meme). Best-effort, ne leve jamais.
 */
export async function refreshDossier(
  guild: Guild,
  discordId: string,
  p: PlayerProfile,
): Promise<void> {
  try {
    const { embed, cardPng, rpName } = await buildProfilCard(p);
    const files = cardPng ? [new AttachmentBuilder(cardPng, { name: CARD_FILENAME })] : [];
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(siteButton());
    await upsertDossierChannel(guild, discordId, rpName, { embeds: [embed], files, components: [row] });
  } catch (err) {
    console.warn("[dossier-channel] Rafraichissement echoue :", err);
  }
}
