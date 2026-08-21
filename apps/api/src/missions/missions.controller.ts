import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { MissionStatus, StaffRank, UserRole } from '@prisma/client';
import { MissionsService } from './missions.service';
import {
  CreateMissionDto,
  UpdateMissionDto,
  UpdateMissionStatusDto,
} from './dto/mission.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinRank } from '../auth/rank.decorator';

type AuthedRequest = Request & {
  user: { id: string; minecraftUsername?: string; discordUsername?: string };
};

@Controller('missions')
export class MissionsController {
  constructor(private missions: MissionsService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  findMine(@Req() req: AuthedRequest) {
    return this.missions.findForUser(req.user.id);
  }

  @Get('cms')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  findAllAdmin(@Query('status') status?: MissionStatus) {
    return this.missions.findAllAdmin(status);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  async findOne(@Param('id') id: string) {
    const mission = await this.missions.findOne(id);
    if (!mission) throw new NotFoundException('Mission introuvable');
    return mission;
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  create(@Req() req: AuthedRequest, @Body() dto: CreateMissionDto) {
    const actorLabel =
      req.user.discordUsername ?? req.user.minecraftUsername ?? 'Staff';
    return this.missions.create(dto, req.user.id, actorLabel);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  update(@Param('id') id: string, @Body() dto: UpdateMissionDto) {
    return this.missions.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  updateStatus(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateMissionStatusDto,
  ) {
    const actorLabel =
      req.user.discordUsername ?? req.user.minecraftUsername ?? 'Staff';
    return this.missions.updateStatus(id, dto.status, req.user.id, actorLabel);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.missions.remove(id);
  }
}
