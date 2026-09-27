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
import { RpEventStatus, StaffRank, UserRole } from '@prisma/client';
import { RpEventsService, type Actor } from './rp-events.service';
import {
  CreateRpEventAssignmentDto,
  CreateRpEventDto,
  UpdateRpEventDto,
} from './dto/rp-event.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinRank } from '../auth/rank.decorator';

type AuthedRequest = Request & {
  user: { id: string; minecraftUsername?: string; discordUsername?: string };
};

function actorOf(req: AuthedRequest): Actor {
  return {
    id: req.user.id,
    label: req.user.discordUsername ?? req.user.minecraftUsername ?? 'Staff',
  };
}

/**
 * Opérations RP en direct. Pilotage staff uniquement (Officier ou plus),
 * même partition que Missions ; suppression réservée ADMIN.
 */
@Controller('rp-events')
export class RpEventsController {
  constructor(private events: RpEventsService) {}

  // Déclarée avant ':id' pour que "me" ne soit pas lu comme un identifiant.
  @Get('me')
  @UseGuards(AuthGuard)
  findMine(@Req() req: AuthedRequest) {
    return this.events.findActiveForUser(req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  findAll(@Query('status') status?: RpEventStatus) {
    return this.events.findAll(status);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  findOne(@Param('id') id: string) {
    return this.events.findOne(id);
  }

  @Get(':id/candidates')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  findCandidates(@Param('id') id: string) {
    return this.events.findCandidates(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  create(@Req() req: AuthedRequest, @Body() dto: CreateRpEventDto) {
    return this.events.create(dto, actorOf(req));
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  update(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateRpEventDto,
  ) {
    return this.events.update(id, dto, actorOf(req));
  }

  @Post(':id/assignments')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  addAssignment(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: CreateRpEventAssignmentDto,
  ) {
    return this.events.addAssignment(id, dto, actorOf(req));
  }

  @Delete(':id/assignments/:assignmentId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  removeAssignment(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.events.removeAssignment(id, assignmentId, actorOf(req));
  }

  @Post(':id/start')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  start(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.events.start(id, actorOf(req));
  }

  @Post(':id/close')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  close(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.events.close(id, actorOf(req));
  }

  @Post(':id/cancel')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  cancel(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.events.cancel(id, actorOf(req));
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.events.remove(id, actorOf(req));
  }
}
