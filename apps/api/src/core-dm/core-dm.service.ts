import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const USER_SELECT = {
  id: true,
  minecraftUsername: true,
  discordUsername: true,
  avatarUrl: true,
};

@Injectable()
export class CoreDmService {
  constructor(private prisma: PrismaService) {}

  private async resolveSenderLabel(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        minecraftUsername: true,
        discordUsername: true,
        activeCharacter: { select: { grade: true, rpFirstName: true, rpLastName: true } },
      },
    });
    if (!user) throw new BadRequestException('Utilisateur introuvable');
    const character = user.activeCharacter;
    const rpName = character
      ? [character.rpFirstName, character.rpLastName].filter(Boolean).join(' ')
      : '';
    return rpName
      ? `${rpName} (${character!.grade})`
      : (user.discordUsername ?? user.minecraftUsername ?? 'Agent');
  }

  private async resolveUserByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { minecraftUsername: username },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('Destinataire introuvable');
    return user.id;
  }

  async send(senderId: string, toUsername: string, content: string) {
    const recipientId = await this.resolveUserByUsername(toUsername);
    if (recipientId === senderId) {
      throw new BadRequestException('Impossible de vous envoyer un message à vous-même');
    }
    const senderLabel = await this.resolveSenderLabel(senderId);
    return this.prisma.coreDirectMessage.create({
      data: { senderId, recipientId, senderLabel, content },
    });
  }

  /** Liste des conversations de l'utilisateur, une entrée par interlocuteur, la plus récente en premier. */
  async listConversations(userId: string) {
    const messages = await this.prisma.coreDirectMessage.findMany({
      where: { OR: [{ senderId: userId }, { recipientId: userId }] },
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

  /** Fil de discussion avec un interlocuteur donné — marque ses messages comme lus. */
  async getThread(userId: string, otherUsername: string) {
    const otherId = await this.resolveUserByUsername(otherUsername);

    await this.prisma.coreDirectMessage.updateMany({
      where: { senderId: otherId, recipientId: userId, readAt: null },
      data: { readAt: new Date() },
    });

    return this.prisma.coreDirectMessage.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: otherId },
          { senderId: otherId, recipientId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, senderId: true, senderLabel: true, content: true, createdAt: true, readAt: true },
    });
  }

  async unreadCount(userId: string) {
    return this.prisma.coreDirectMessage.count({
      where: { recipientId: userId, readAt: null },
    });
  }
}
