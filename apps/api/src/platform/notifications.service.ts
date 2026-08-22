import { Injectable, NotFoundException } from '@nestjs/common';
import { PlatformEntityType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  resolvePagination,
  toPaginatedResult,
} from '../common/dto/pagination.dto';

export interface NotificationInput {
  userId: string;
  title: string;
  body: string;
  entityType?: PlatformEntityType;
  entityId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async notify(input: NotificationInput) {
    return this.prisma.platformNotification.create({
      data: {
        userId: input.userId,
        title: input.title,
        body: input.body,
        entityType: input.entityType,
        entityId: input.entityId,
      },
    });
  }

  async notifyMany(
    userIds: string[],
    payload: Omit<NotificationInput, 'userId'>,
  ) {
    if (userIds.length === 0) return [];
    return this.prisma.platformNotification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title: payload.title,
        body: payload.body,
        entityType: payload.entityType,
        entityId: payload.entityId,
      })),
    });
  }

  async findMine(
    userId: string,
    query: PaginationQueryDto & { unreadOnly?: boolean },
  ) {
    const { skip, take, page, limit } = resolvePagination(query);

    const where: Prisma.PlatformNotificationWhereInput = {
      userId,
      ...(query.unreadOnly ? { readAt: null } : {}),
    };

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.platformNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.platformNotification.count({ where }),
      this.prisma.platformNotification.count({
        where: { userId, readAt: null },
      }),
    ]);

    return {
      ...toPaginatedResult(items, total, page, limit),
      unreadCount,
    };
  }

  async markRead(id: string, userId: string) {
    const row = await this.prisma.platformNotification.findFirst({
      where: { id, userId },
    });
    if (!row) throw new NotFoundException('Notification introuvable');

    return this.prisma.platformNotification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.platformNotification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async findStaffUserIds(): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: { role: { in: ['STAFF', 'ADMIN'] } },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }

  /** Tous les comptes — pour un évènement qui concerne l'ensemble du réseau (ex: alerte Site-12). */
  async findAllUserIds(): Promise<string[]> {
    const users = await this.prisma.user.findMany({ select: { id: true } });
    return users.map((u) => u.id);
  }
}
