import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { PlayersService } from './players.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdatePlayerProfileDto } from './dto/update-player-profile.dto';
import { SyncService } from '../sync/sync.service';

@Controller('players')
export class PlayersController {
  constructor(
    private players: PlayersService,
    private sync: SyncService,
  ) {}

  @Get()
  findAll() {
    return this.players.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() req: Request & { user: { id: string } }) {
    return this.players.getDashboard(req.user.id);
  }

  @Get('me/career')
  @UseGuards(AuthGuard)
  getMyCareer(@Req() req: Request & { user: { id: string } }) {
    return this.players.getCareerHistory(req.user.id);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: UpdatePlayerProfileDto,
  ) {
    await this.sync.updateRpIdentity(req.user.id, dto);
    return this.players.getDashboard(req.user.id);
  }

  @Get(':username/staff-id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async findIdByUsername(@Param('username') username: string) {
    const id = await this.players.findIdByUsername(username);
    if (!id) throw new NotFoundException('Joueur introuvable');
    return { id };
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.players.findByUsername(username);
  }
}
