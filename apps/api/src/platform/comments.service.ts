import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlatformEntityType, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  resolvePagination,
  toPaginatedResult,
} from '../common/dto/pagination.dto';
import { AuditService } from './audit.service';

export interface CreateCommentInput {
  entityType: PlatformEntityType;
  entityId: string;
  authorId: string;
  body: string;
  internal?: boolean;
}

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(input: CreateCommentInput, authorRole: UserRole) {
    if (
      input.internal &&
      authorRole !== UserRole.STAFF &&
      authorRole !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Commentaire interne réservé au staff');
    }

    const comment = await this.prisma.platformComment.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        authorId: input.authorId,
        body: input.body.trim(),
        internal: input.internal ?? false,
      },
      include: {
        author: {
          select: {
            minecraftUsername: true,
            discordUsername: true,
            role: true,
          },
        },
      },
    });

    await this.audit.log({
      entityType: input.entityType,
      entityId: input.entityId,
      action: 'COMMENT_ADDED',
      actorId: input.authorId,
      summary: input.internal
        ? 'Commentaire interne staff ajouté'
        : 'Commentaire ajouté',
      metadata: { commentId: comment.id },
    });

    return comment;
  }

  async findByEntity(
    entityType: PlatformEntityType,
    entityId: string,
    query: PaginationQueryDto,
    viewerRole: UserRole,
  ) {
    const { skip, take, page, limit } = resolvePagination(query);
    const isStaff =
      viewerRole === UserRole.STAFF || viewerRole === UserRole.ADMIN;

    const where = {
      entityType,
      entityId,
      deletedAt: null,
      ...(isStaff ? {} : { internal: false }),
    };

    const [items, total] = await Promise.all([
      this.prisma.platformComment.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip,
        take,
        include: {
          author: {
            select: {
              minecraftUsername: true,
              discordUsername: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.platformComment.count({ where }),
    ]);

    return toPaginatedResult(items, total, page, limit);
  }

  async softDelete(id: string, userId: string, userRole: UserRole) {
    const comment = await this.prisma.platformComment.findUnique({
      where: { id },
    });
    if (!comment || comment.deletedAt) {
      throw new NotFoundException('Commentaire introuvable');
    }

    const isStaff = userRole === UserRole.STAFF || userRole === UserRole.ADMIN;
    if (comment.authorId !== userId && !isStaff) {
      throw new ForbiddenException('Suppression non autorisée');
    }

    return this.prisma.platformComment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
