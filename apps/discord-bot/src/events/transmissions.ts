import type { GuildMember, Message, PartialGuildMember } from "discord.js";
import { config } from "../config.js";
import { api, ApiError, type DiscordEventPayload } from "../lib/api.js";

/**
 * Pont Discord → Site (thème SCP "Transmissions de la Fondation").
 *
 * Confidentialité : aucun message brut de salon privé n'est transmis. Pour les
 * salons non marqués `public`, on n'envoie que des métadonnées (salon, auteur
 * anonymisé côté API, horodatage). Le pseudo et un extrait ne sont transmis que
 * pour les salons explicitement publics.
 */

const EXCERPT_MAX = 280;

function truncate(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= EXCERPT_MAX) return clean;
  return `${clean.slice(0, EXCERPT_MAX - 1)}…`;
}

/** Envoi best-effort : on n'interrompt jamais le bot si l'API est indisponible. */
async function relay(payload: DiscordEventPayload): Promise<void> {
  if (!config.transmissions.enabled) return;
  if (!config.syncApiKey) return;
  try {
    await api.sendDiscordEvent(payload);
  } catch (err) {
    if (err instanceof ApiError && err.status === 0) return; // API hors ligne, silencieux
    console.warn("[transmissions] relais échoué :", err);
  }
}

export async function handleMessageTransmission(message: Message): Promise<void> {
  if (!config.transmissions.enabled) return;
  if (message.author?.bot) return;
  if (!message.inGuild()) return;

  const classification = config.transmissions.channelMap[message.channelId];
  if (!classification) return; // on n'écoute que les salons explicitement mappés

  const isPublic = classification.public;
  const hasContent = message.content && message.content.trim().length > 0;

  await relay({
    type: classification.kind === "announce" ? "ANNOUNCE" : "MESSAGE",
    discordMessageId: message.id,
    channelId: message.channelId,
    channelLabel: classification.label,
    clearance: classification.clearance,
    isPublic,
    authorId: message.author.id,
    authorDisplay: isPublic ? message.author.username : undefined,
    contentExcerpt: isPublic && hasContent ? truncate(message.content) : undefined,
    occurredAt: new Date(message.createdTimestamp).toISOString(),
  });
}

export async function handleMemberJoinTransmission(
  member: GuildMember,
): Promise<void> {
  if (!config.transmissions.relayMembers) return;
  await relay({
    type: "MEMBER_JOIN",
    authorId: member.id,
    clearance: 1,
    isPublic: false,
    occurredAt: new Date().toISOString(),
  });
}

export async function handleMemberLeaveTransmission(
  member: GuildMember | PartialGuildMember,
): Promise<void> {
  if (!config.transmissions.relayMembers) return;
  await relay({
    type: "MEMBER_LEAVE",
    authorId: member.id,
    clearance: 1,
    isPublic: false,
    occurredAt: new Date().toISOString(),
  });
}
