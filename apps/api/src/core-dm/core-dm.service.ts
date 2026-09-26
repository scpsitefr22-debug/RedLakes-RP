import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CoreDmChannel, PlatformEntityType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../platform/notifications.service';

const USER_SELECT = {
  id: true,
  minecraftUsername: true,
  username: true,
  discordUsername: true,
  avatarUrl: true,
  activeCharacter: { select: { rpFirstName: true, rpLastName: true, grade: true } },
};

const CHANNEL_LABELS: Record<CoreDmChannel, string> = {
  PERSONNEL: 'Personnel',
  PROFESSIONNEL: 'Professionnel',
};

@Injectable()
export class CoreDmService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Libelle affiche pour l'auteur d'un message — depend du canal : en
   * Professionnel (RP, voie hierarchique) on montre le personnage (nom +
   * grade), en Personnel (hors-RP, entre joueurs) on montre le compte
   * (Discord/Minecraft), jamais l'identite RP qui n'a pas sa place hors-RP.
   */
  private async resolveSenderLabel(userId: string, channel: CoreDmChannel) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        minecraftUsername: true,
        discordUsername: true,
        activeCharacter: { select: { grade: true, rpFirstName: true, rpLastName: true } },
      },
    });
    if (!user) throw new BadRequestException('Utilisateur introuvable');
    const accountLabel = user.discordUsername ?? user.minecraftUsername ?? 'Agent';
    if (channel !== CoreDmChannel.PROFESSIONNEL) return accountLabel;

    const character = user.activeCharacter;
    const rpName = character
      ? [character.rpFirstName, character.rpLastName].filter(Boolean).join(' ')
      : '';
    return rpName ? `${rpName} (${character!.grade})` : accountLabel;
  }

  /** Identifiant = pseudo Minecraft (historique) ou pseudo de connexion (comptes par mot de passe non encore liés Minecraft). */
  private async resolveUserByUsername(identifier: string) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ minecraftUsername: identifier }, { username: identifier }] },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('Destinataire introuvable');
    return user.id;
  }

  async send(
    senderId: string,
    toUsername: string,
    content: string,
    channel: CoreDmChannel = CoreDmChannel.PERSONNEL,
  ) {
    const recipientId = await this.resolveUserByUsername(toUsername);
    if (recipientId === senderId) {
      throw new BadRequestException('Impossible de vous envoyer un message à vous-même');
    }
    const senderLabel = await this.resolveSenderLabel(senderId, channel);
    const message = await this.prisma.coreDirectMessage.create({
      data: { senderId, recipientId, senderLabel, content, channel },
    });

    await this.notifications.notify({
      userId: recipientId,
      title: `Message ${CHANNEL_LABELS[channel]} — ${senderLabel}`,
      body: content.length > 140 ? `${content.slice(0, 140)}…` : content,
      entityType: PlatformEntityType.CORE_DM,
      entityId: message.id,
    });

    return message;
  }

  /**
   * Liste des conversations de l'utilisateur sur UN canal (Personnel ou
   * Professionnel), une entrée par interlocuteur, la plus récente en
   * premier. Les deux canaux sont volontairement des listes distinctes —
   * separation demandee, pas juste un badge different sur la meme liste.
   */
  async listConversations(userId: string, channel: CoreDmChannel) {
    const messages = await this.prisma.coreDirectMessage.findMany({
      where: { channel, OR: [{ senderId: userId }, { recipientId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: USER_SELECT }, recipient: { select: USER_SELECT } },
    });

    type Partner = (typeof messages)[number]['sender'];
    const byPartner = new Map<
      string,
      { partner: Partner; lastMessage: string; lastAt: Date; unreadCount: number }
    >();

    for (const m of messages) {
      const partner = m.senderId === userId ? m.recipient : m.sender;
      const existing = byPartner.get(partner.id);
      const isUnread = m.recipientId === userId && !m.readAt;
      if (!existing) {
        byPartner.set(partner.id, {
          partner,
          lastMessage: m.content,
          lastAt: m.createdAt,
          unreadCount: isUnread ? 1 : 0,
        });
      } else if (isUnread) {
        existing.unreadCount += 1;
      }
    }

    return [...byPartner.values()].sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
  }

  /** Fil de discussion avec un interlocuteur donné sur UN canal — marque ses messages (ce canal seulement) comme lus. */
  async getThread(userId: string, otherUsername: string, channel: CoreDmChannel) {
    const otherId = await this.resolveUserByUsername(otherUsername);

    await this.prisma.coreDirectMessage.updateMany({
      where: { senderId: otherId, recipientId: userId, channel, readAt: null },
      data: { readAt: new Date() },
    });

    return this.prisma.coreDirectMessage.findMany({
      where: {
        channel,
        OR: [
          { senderId: userId, recipientId: otherId },
          { senderId: otherId, recipientId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, senderId: true, senderLabel: true, content: true, createdAt: true, readAt: true },
    });
  }

  /**
   * Liste des contacts pour le sélecteur "nouvelle discussion" — tous les
   * comptes adressables (pseudo Minecraft OU pseudo de connexion, comme
   * resolveUserByUsername ci-dessus), hors soi-même. Alphabétique, plafonné
   * pour rester léger dans un panneau qu'on fait défiler.
   */
  async listContacts(excludeUserId: string) {
    return this.prisma.user.findMany({
      where: {
        id: { not: excludeUserId },
        OR: [{ minecraftUsername: { not: null } }, { username: { not: null } }],
      },
      select: USER_SELECT,
      orderBy: { minecraftUsername: 'asc' },
      take: 300,
    });
  }

  /**
   * Resout un message vers { channel, partner } pour le clic sur une
   * notification CORE_DM — la messagerie s'adresse par interlocuteur/canal,
   * pas par id de message, donc il faut cette etape avant d'ouvrir le fil.
   * Refuse si l'appelant n'est ni l'expediteur ni le destinataire.
   */
  async resolveMessageTarget(userId: string, messageId: string) {
    const message = await this.prisma.coreDirectMessage.findUnique({
      where: { id: messageId },
      select: {
        channel: true,
        senderId: true,
        recipientId: true,
        sender: { select: USER_SELECT },
        recipient: { select: USER_SELECT },
      },
    });
    if (!message || (message.senderId !== userId && message.recipientId !== userId)) {
      throw new NotFoundException('Message introuvable');
    }
    const partner = message.senderId === userId ? message.recipient : message.sender;
    return { channel: message.channel, partner };
  }

  /** Total non lu, tous canaux confondus — sert uniquement au badge global de la barre CORE. */
  async unreadCount(userId: string) {
    return this.prisma.coreDirectMessage.count({
      where: { recipientId: userId, readAt: null },
    });
  }
}
