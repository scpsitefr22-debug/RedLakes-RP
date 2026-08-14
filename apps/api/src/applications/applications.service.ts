import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  PlatformEntityType,
  Prisma,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ListApplicationsQueryDto } from './dto/list-applications-query.dto';
import { DiscordService } from '../sync/discord.service';
import { AuditService } from '../platform/audit.service';
import { NotificationsService } from '../platform/notifications.service';
import {
  resolvePagination,
  toPaginatedResult,
} from '../common/dto/pagination.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private discord: DiscordService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  private buildWhere(
    base: Prisma.ApplicationWhereInput,
    query: ListApplicationsQueryDto,
  ): Prisma.ApplicationWhereInput {
    return {
      ...base,
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
    };
  }

  private resolveOrderBy(query: ListApplicationsQueryDto) {
    const order = query.order ?? 'desc';
    const sort = query.sort ?? 'createdAt';
    const allowed = ['createdAt', 'updatedAt', 'status', 'type'] as const;
    const field = allowed.includes(sort as (typeof allowed)[number])
      ? sort
      : 'createdAt';
    return { [field]: order };
  }

  async create(userId: string, dto: CreateApplicationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { minecraftUsername: true, discordUsername: true },
    });

    const app = await this.prisma.application.create({
      data: { userId, ...dto },
      include: {
        user: { select: { minecraftUsername: true } },
      },
    });

    const actorLabel =
      user?.minecraftUsername ?? user?.discordUsername ?? 'Candidat';

    await this.audit.log({
      entityType: PlatformEntityType.APPLICATION,
      entityId: app.id,
      action: 'CREATED',
      actorId: userId,
      actorLabel,
      summary: `Candidature ${app.type} déposée`,
      metadata: { type: app.type },
    });

    const staffIds = await this.notifications.findStaffUserIds();
    await this.notifications.notifyMany(staffIds, {
      title: 'Nouvelle candidature',
      body: `${actorLabel} — ${app.type}`,
      entityType: PlatformEntityType.APPLICATION,
      entityId: app.id,
    });

    await this.discord.notifyApplication({
      type: app.type,
      minecraftUsername: app.user.minecraftUsername ?? 'Joueur',
      motivation: app.motivation,
      applicationId: app.id,
    });

    return app;
  }

  async findByUser(userId: string, query: ListApplicationsQueryDto) {
    const { skip, take, page, limit } = resolvePagination(query);
    const where = this.buildWhere({ userId }, query);

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        orderBy: this.resolveOrderBy(query),
        skip,
        take,
      }),
      this.prisma.application.count({ where }),
    ]);

    return toPaginatedResult(items, total, page, limit);
  }

  async findOneForUser(id: string, userId: string, userRole: UserRole) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            minecraftUsername: true,
            discordUsername: true,
            avatarUrl: true,
          },
        },
      },
    });
    if (!app) throw new NotFoundException('Candidature introuvable');

    const isStaff = userRole === UserRole.STAFF || userRole === UserRole.ADMIN;
    if (app.userId !== userId && !isStaff) {
      throw new ForbiddenException('Accès refusé');
    }

    return app;
  }

  async findAll(userRole: UserRole, query: ListApplicationsQueryDto) {
    if (userRole !== UserRole.STAFF && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Accès staff requis');
    }

    const { skip, take, page, limit } = resolvePagination(query);
    const where = this.buildWhere(
      query.status ? {} : { status: ApplicationStatus.PENDING },
      query,
    );

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        orderBy: this.resolveOrderBy(query),
        skip,
        take,
        include: {
          user: {
            select: {
              minecraftUsername: true,
              discordUsername: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return toPaginatedResult(items, total, page, limit);
  }

  async review(
    id: string,
    reviewerId: string,
    status: 'APPROVED' | 'REJECTED',
    staffNote?: string,
  ) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, minecraftUsername: true } },
      },
    });
    if (!app) throw new NotFoundException('Candidature introuvable');

    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },
      select: { minecraftUsername: true, discordUsername: true },
    });
    const reviewerLabel =
      reviewer?.minecraftUsername ?? reviewer?.discordUsername ?? 'Staff';

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status,
        staffNote,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        user: { select: { minecraftUsername: true } },
      },
    });

    await this.audit.log({
      entityType: PlatformEntityType.APPLICATION,
      entityId: id,
      action: status === 'APPROVED' ? 'REVIEWED' : 'STATUS_CHANGED',
      actorId: reviewerId,
      actorLabel: reviewerLabel,
      summary: `Candidature ${status === 'APPROVED' ? 'approuvée' : 'refusée'}`,
      metadata: { staffNote, previousStatus: app.status, newStatus: status },
    });

    await this.notifications.notify({
      userId: app.user.id,
      title:
        status === 'APPROVED' ? 'Candidature approuvée' : 'Candidature refusée',
      body: `${app.type}${staffNote ? ` — ${staffNote}` : ''}`,
      entityType: PlatformEntityType.APPLICATION,
      entityId: id,
    });

    return updated;
  }
}
