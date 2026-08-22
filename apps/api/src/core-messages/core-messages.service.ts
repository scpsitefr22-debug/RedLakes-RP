import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  resolvePagination,
  toPaginatedResult,
} from '../common/dto/pagination.dto';

const MESSAGE_SELECT = {
  id: true,
  authorId: true,
  authorLabel: true,
  factionId: true,
  content: true,
  createdAt: true,
};

@Injectable()
export class CoreMessagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * factionId de l'utilisateur (via son personnage actif) — null si aucune
   * faction reelle assignee, ce qui pointe vers le canal public/Civil
   * partage. Meme convention que useCoreSession cote frontend.
   */
  private async resolveAuthorContext(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        minecraftUsername: true,
        discordUsername: true,
        activeCharacter: {
          select: {
            grade: true,
            rpFirstName: true,
            rpLastName: true,
            factionId: true,
          },
        },
      },
    });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    const character = user.activeCharacter;
    const rpName = character
      ? [character.rpFirstName, character.rpLastName].filter(Boolean).join(' ')
      : '';
    const authorLabel = rpName
      ? `${rpName} (${character!.grade})`
      : (user.discordUsername ?? user.minecraftUsername ?? 'Agent');

    return { factionId: character?.factionId ?? null, authorLabel };
  }

  async create(userId: string, content: string) {
    const { factionId, authorLabel } = await this.resolveAuthorContext(userId);
    return this.prisma.coreMessage.create({
      data: { authorId: userId, authorLabel, factionId, content },
      select: MESSAGE_SELECT,
    });
  }

  async findForUser(userId: string, query: PaginationQueryDto) {
    const { factionId } = await this.resolveAuthorContext(userId);
    const { skip, take, page, limit } = resolvePagination(query);

    const where = { factionId };
    const [items, total] = await Promise.all([
      this.prisma.coreMessage.findMany({
        where,
        select: MESSAGE_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.coreMessage.count({ where }),
    ]);

    return toPaginatedResult(items, total, page, limit);
  }
}
