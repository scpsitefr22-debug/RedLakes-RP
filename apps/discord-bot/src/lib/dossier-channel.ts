import {
  ChannelType,
  PermissionFlagsBits,
  type ActionRowBuilder,
  type AttachmentBuilder,
  type ButtonBuilder,
  type EmbedBuilder,
  type Guild,
} from "discord.js";

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
