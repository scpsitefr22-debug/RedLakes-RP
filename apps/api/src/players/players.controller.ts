import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
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
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
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

  @Get('me/characters')
  @UseGuards(AuthGuard)
  listMyCharacters(@Req() req: Request & { user: { id: string } }) {
    return this.players.listCharacters(req.user.id);
  }

  @Post('me/characters')
  @UseGuards(AuthGuard)
  createCharacter(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: UpdatePlayerProfileDto,
  ) {
    return this.players.createCharacter(req.user.id, dto);
  }

  @Post('me/characters/:id/activate')
  @UseGuards(AuthGuard)
  activateCharacter(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.players.activateCharacter(req.user.id, id);
  }

  @Delete('me/characters/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async deleteMyCharacter(
    @Req() req: Request & { user: { id: string; minecraftUsername?: string; discordUsername?: string } },
    @Param('id') id: string,
  ) {
    const actorLabel =
      req.user.discordUsername ?? req.user.minecraftUsername ?? 'Staff';
    await this.players.deleteCharacterForUser(
      req.user.id,
      id,
      req.user.id,
      actorLabel,
      req.user.minecraftUsername,
    );
    return this.players.listCharacters(req.user.id);
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

  @Get(':username/characters')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  listCharacters(@Param('username') username: string) {
    return this.players.listCharactersByUsername(username);
  }

  @Delete(':username/characters/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  deleteCharacter(
    @Req() req: Request & { user: { id: string; minecraftUsername?: string; discordUsername?: string } },
    @Param('username') username: string,
    @Param('id') id: string,
  ) {
    const actorLabel =
      req.user.discordUsername ?? req.user.minecraftUsername ?? 'Staff';
    return this.players.deleteCharacter(username, id, req.user.id, actorLabel);
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.players.findByUsername(username);
  }

  @Patch(':username/role')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateRole(
    @Req() req: Request & { user: { id: string; minecraftUsername?: string; discordUsername?: string } },
    @Param('username') username: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    const actorLabel =
      req.user.discordUsername ?? req.user.minecraftUsername ?? 'Admin';
    return this.players.updateRole(
      username,
      dto.role,
      dto.staffRank,
      req.user.id,
      actorLabel,
    );
  }
}
