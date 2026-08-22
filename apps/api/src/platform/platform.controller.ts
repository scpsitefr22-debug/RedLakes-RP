import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PlatformEntityType, UserRole } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { AuditService } from './audit.service';
import { CommentsService } from './comments.service';
import { NotificationsService } from './notifications.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsQueryDto } from './dto/notifications-query.dto';

@Controller('platform')
export class PlatformController {
  constructor(
    private audit: AuditService,
    private comments: CommentsService,
    private notifications: NotificationsService,
  ) {}

  @Get('audit/:entityType/:entityId')
  @UseGuards(AuthGuard)
  entityAudit(
    @Param('entityType') entityType: PlatformEntityType,
    @Param('entityId') entityId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.audit.findByEntity(entityType, entityId, query);
  }

  @Get('audit')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  recentAudit(@Query() query: PaginationQueryDto) {
    return this.audit.findRecentForStaff(query);
  }

  @Get('comments/:entityType/:entityId')
  @UseGuards(AuthGuard)
  entityComments(
    @Param('entityType') entityType: PlatformEntityType,
    @Param('entityId') entityId: string,
    @Query() query: PaginationQueryDto,
    @Req() req: Request & { user: { role: UserRole } },
  ) {
    return this.comments.findByEntity(
      entityType,
      entityId,
      query,
      req.user.role,
    );
  }

  @Post('comments')
  @UseGuards(AuthGuard)
  createComment(
    @Body() dto: CreateCommentDto,
    @Req() req: Request & { user: { id: string; role: UserRole } },
  ) {
    return this.comments.create(
      {
        entityType: dto.entityType,
        entityId: dto.entityId,
        authorId: req.user.id,
        body: dto.body,
        internal: dto.internal,
      },
      req.user.role,
    );
  }

  @Delete('comments/:id')
  @UseGuards(AuthGuard)
  deleteComment(
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string; role: UserRole } },
  ) {
    return this.comments.softDelete(id, req.user.id, req.user.role);
  }

  @Get('notifications/me')
  @UseGuards(AuthGuard)
  myNotifications(
    @Req() req: Request & { user: { id: string } },
    @Query() query: NotificationsQueryDto,
  ) {
    return this.notifications.findMine(req.user.id, {
      ...query,
      unreadOnly: query.unreadOnly === 'true',
    });
  }

  @Patch('notifications/:id/read')
  @UseGuards(AuthGuard)
  markNotificationRead(
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.notifications.markRead(id, req.user.id);
  }

  @Patch('notifications/read-all')
  @UseGuards(AuthGuard)
  markAllRead(@Req() req: Request & { user: { id: string } }) {
    return this.notifications.markAllRead(req.user.id);
  }
}
