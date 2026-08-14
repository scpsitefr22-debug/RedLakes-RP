import { Injectable } from '@nestjs/common';
import { AuditAction, PlatformEntityType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  resolvePagination,
  toPaginatedResult,
} from '../common/dto/pagination.dto';

export interface AuditLogInput {
  entityType: PlatformEntityType;
  entityId: string;
  action: AuditAction;
  actorId?: string | null;
  actorLabel?: string | null;
  summary: string;
  metadata?: Prisma.InputJsonValue;
  clearance?: number;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(input: AuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        actorId: input.actorId ?? undefined,
        actorLabel: input.actorLabel ?? undefined,
        summary: input.summary,
        metadata: input.metadata,
        clearance: input.clearance ?? 1,
      },
    });
  }

  async findByEntity(
    entityType: PlatformEntityType,
    entityId: string,
    query: PaginationQueryDto,
    maxClearance = 5,
  ) {
    const { skip, take, page, limit } = resolvePagination(query);

    const where: Prisma.AuditLogWhereInput = {
      entityType,
      entityId,
      clearance: { lte: maxClearance },
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          actor: {
            select: {
              minecraftUsername: true,
              discordUsername: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return toPaginatedResult(items, total, page, limit);
  }

  async findRecentForStaff(query: PaginationQueryDto) {
    const { skip, take, page, limit } = resolvePagination(query);

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          actor: {
            select: {
              minecraftUsername: true,
              discordUsername: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count(),
    ]);

    return toPaginatedResult(items, total, page, limit);
  }
}
