import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PersonnelReportStatus,
  PlatformEntityType,
  Prisma,
  UserRole,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { clearanceForGrade } from '../players/grade-clearance';

import { CreatePersonnelReportDto } from './dto/create-personnel-report.dto';

import { ListReportsQueryDto } from './dto/list-reports-query.dto';

import { DiscordService } from '../sync/discord.service';

import { AuditService } from '../platform/audit.service';

import { NotificationsService } from '../platform/notifications.service';

import {
  resolvePagination,
  toPaginatedResult,
} from '../common/dto/pagination.dto';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,

    private discord: DiscordService,

    private audit: AuditService,

    private notifications: NotificationsService,
  ) {}

  private buildWhere(
    base: Prisma.PersonnelReportWhereInput,

    query: ListReportsQueryDto,
  ): Prisma.PersonnelReportWhereInput {
    return {
      ...base,

      ...(query.status ? { status: query.status } : {}),

      ...(query.type ? { type: query.type } : {}),
    };
  }

  private resolveOrderBy(query: ListReportsQueryDto) {
    const order = query.order ?? 'desc';

    const sort = query.sort ?? 'createdAt';

    const allowed = [
      'createdAt',
      'updatedAt',
      'subject',
      'status',
      'type',
    ] as const;

    const field = allowed.includes(sort as (typeof allowed)[number])
      ? sort
      : 'createdAt';

    return { [field]: order };
  }

  async create(userId: string, dto: CreatePersonnelReportDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },

      include: { player: true },
    });

    if (!user?.player) {
      throw new ForbiddenException(
        'Profil joueur requis pour déposer un rapport',
      );
    }

    const clearance = clearanceForGrade(user.player.grade);

    const actorLabel =
      user.minecraftUsername ?? user.discordUsername ?? 'Agent';

    const report = await this.prisma.personnelReport.create({
      data: {
        userId,

        type: dto.type,

        subject: dto.subject.trim(),

        content: dto.content.trim(),

        clearance,

        factionId: user.player.factionId,
      },

      include: {
        user: {
          select: {
            minecraftUsername: true,

            player: {
              select: { grade: true, rpFirstName: true, rpLastName: true },
            },
          },
        },
      },
    });

    await this.audit.log({
      entityType: PlatformEntityType.PERSONNEL_REPORT,

      entityId: report.id,

      action: 'CREATED',

      actorId: userId,

      actorLabel,

      summary: `Rapport déposé : ${report.subject}`,

      metadata: { type: report.type, clearance: report.clearance },

      clearance: report.clearance,
    });

    const staffIds = await this.notifications.findStaffUserIds();

    await this.notifications.notifyMany(staffIds, {
      title: 'Nouveau rapport personnel',

      body: `${actorLabel} — ${report.type} : ${report.subject}`,

      entityType: PlatformEntityType.PERSONNEL_REPORT,

      entityId: report.id,
    });

    const p = report.user.player;

    const rpName = p
      ? [p.rpFirstName, p.rpLastName].filter(Boolean).join(' ')
      : null;

    await this.discord.notifyPersonnelReport({
      type: report.type,

      subject: report.subject,

      content: report.content,

      minecraftUsername: report.user.minecraftUsername ?? 'Agent',

      grade: p?.grade ?? 'Civil',

      rpName,

      clearance: report.clearance,

      reportId: report.id,
    });

    return report;
  }

  async findMine(userId: string, query: ListReportsQueryDto) {
    const { skip, take, page, limit } = resolvePagination(query);

    const where = this.buildWhere({ userId }, query);

    const [items, total] = await Promise.all([
      this.prisma.personnelReport.findMany({
        where,

        orderBy: this.resolveOrderBy(query),

        skip,

        take,
      }),

      this.prisma.personnelReport.count({ where }),
    ]);

    return toPaginatedResult(items, total, page, limit);
  }

  /**
   * Journal partage entre membres d'une meme faction — visible pour tous
   * les membres actuels, pas seulement le staff. N'expose ni staffNote ni
   * reviewedBy (echange prive avec le staff), uniquement le contenu que
   * l'auteur a lui-meme choisi de deposer.
   */
  async findByFaction(userId: string, query: ListReportsQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { player: { select: { factionId: true } } },
    });
    const factionId = user?.player?.factionId;
    if (!factionId) {
      return toPaginatedResult([], 0, 1, resolvePagination(query).limit);
    }

    const { skip, take, page, limit } = resolvePagination(query);
    const where = this.buildWhere({ factionId }, query);

    const [items, total] = await Promise.all([
      this.prisma.personnelReport.findMany({
        where,
        orderBy: this.resolveOrderBy(query),
        skip,
        take,
        select: {
          id: true,
          type: true,
          subject: true,
          content: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              minecraftUsername: true,
              player: { select: { rpFirstName: true, rpLastName: true, grade: true } },
            },
          },
        },
      }),
      this.prisma.personnelReport.count({ where }),
    ]);

    return toPaginatedResult(items, total, page, limit);
  }

  async findOneForUser(id: string, userId: string, userRole: UserRole) {
    const report = await this.prisma.personnelReport.findUnique({
      where: { id },

      include: {
        user: {
          select: {
            minecraftUsername: true,

            discordUsername: true,

            player: {
              select: {
                grade: true,

                faction: true,

                rpFirstName: true,

                rpLastName: true,
              },
            },
          },
        },
      },
    });

    if (!report) throw new NotFoundException('Rapport introuvable');

    const isStaff = userRole === UserRole.STAFF || userRole === UserRole.ADMIN;

    if (report.userId !== userId && !isStaff) {
      throw new ForbiddenException('Accès refusé');
    }

    return report;
  }

  async findAllPending(userRole: UserRole, query: ListReportsQueryDto) {
    if (userRole !== UserRole.STAFF && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Accès staff requis');
    }

    const { skip, take, page, limit } = resolvePagination(query);

    const where = this.buildWhere(
      query.status ? {} : { status: PersonnelReportStatus.PENDING },

      query,
    );

    const [items, total] = await Promise.all([
      this.prisma.personnelReport.findMany({
        where,

        orderBy: this.resolveOrderBy(query),

        skip,

        take,

        include: {
          user: {
            select: {
              minecraftUsername: true,

              discordUsername: true,

              player: {
                select: {
                  grade: true,

                  faction: true,

                  rpFirstName: true,

                  rpLastName: true,
                },
              },
            },
          },
        },
      }),

      this.prisma.personnelReport.count({ where }),
    ]);

    return toPaginatedResult(items, total, page, limit);
  }

  async review(
    id: string,

    reviewerId: string,

    body: { status: 'REVIEWED' | 'ARCHIVED'; staffNote?: string },
  ) {
    const report = await this.prisma.personnelReport.findUnique({
      where: { id },

      include: {
        user: { select: { minecraftUsername: true, id: true } },
      },
    });

    if (!report) throw new NotFoundException('Rapport introuvable');

    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },

      select: { minecraftUsername: true, discordUsername: true },
    });

    const reviewerLabel =
      reviewer?.minecraftUsername ?? reviewer?.discordUsername ?? 'Staff';

    const updated = await this.prisma.personnelReport.update({
      where: { id },

      data: {
        status: body.status,

        staffNote: body.staffNote,

        reviewedBy: reviewerId,

        reviewedAt: new Date(),
      },
    });

    await this.audit.log({
      entityType: PlatformEntityType.PERSONNEL_REPORT,

      entityId: id,

      action: body.status === 'ARCHIVED' ? 'ARCHIVED' : 'REVIEWED',

      actorId: reviewerId,

      actorLabel: reviewerLabel,

      summary: `Rapport ${body.status === 'ARCHIVED' ? 'archivé' : 'traité'} : ${report.subject}`,

      metadata: { staffNote: body.staffNote, previousStatus: report.status },

      clearance: report.clearance,
    });

    await this.notifications.notify({
      userId: report.user.id,

      title:
        body.status === 'ARCHIVED'
          ? 'Rapport archivé'
          : 'Rapport traité par le staff',

      body: `${report.subject}${body.staffNote ? ` — ${body.staffNote}` : ''}`,

      entityType: PlatformEntityType.PERSONNEL_REPORT,

      entityId: id,
    });

    await this.discord.notifyPersonnelReportReviewed({
      subject: report.subject,

      status: body.status,

      staffNote: body.staffNote,

      minecraftUsername: report.user.minecraftUsername ?? 'Agent',
    });

    return updated;
  }
}
