import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { StaffRank, UserRole } from '@prisma/client';
import { FactionsService } from './factions.service';
import { CreateFactionDto, UpdateFactionDto } from './dto/faction.dto';
import { AuthGuard } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinRank } from '../auth/rank.decorator';

type OptionalAuthRequest = Request & { user?: { id: string } };

@Controller('factions')
export class FactionsController {
  constructor(private factions: FactionsService) {}

  private async departmentIdOf(req: OptionalAuthRequest) {
    return req.user ? this.factions.resolveDepartmentId(req.user.id) : null;
  }

  private async clearanceLevelOf(req: OptionalAuthRequest) {
    return req.user ? this.factions.resolveClearanceLevel(req.user.id) : 1;
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  findAll(@Req() req: OptionalAuthRequest) {
    return this.factions.findAll(!!req.user);
  }

  @Get('by-id/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async findById(@Param('id') id: string) {
    const faction = await this.factions.findById(id);
    if (!faction) throw new NotFoundException('Faction introuvable');
    return faction;
  }

  @Get(':slug')
  @UseGuards(OptionalAuthGuard)
  async findOne(@Param('slug') slug: string, @Req() req: OptionalAuthRequest) {
    const faction = await this.factions.findOne(slug, !!req.user);
    if (!faction) throw new NotFoundException('Faction introuvable');
    return faction;
  }

  @Get(':slug/members')
  @UseGuards(AuthGuard)
  async listMembers(@Param('slug') slug: string) {
    const faction = await this.factions.findOne(slug);
    if (!faction) throw new NotFoundException('Faction introuvable');
    return this.factions.listMembers(faction.id);
  }

  @Get(':slug/events')
  @UseGuards(OptionalAuthGuard)
  async listEvents(@Param('slug') slug: string, @Req() req: OptionalAuthRequest) {
    const faction = await this.factions.findOne(slug);
    if (!faction) throw new NotFoundException('Faction introuvable');
    return this.factions.listEvents(faction.id, await this.departmentIdOf(req));
  }

  @Get(':slug/scp')
  @UseGuards(OptionalAuthGuard)
  async listScpObjects(@Param('slug') slug: string, @Req() req: OptionalAuthRequest) {
    const faction = await this.factions.findOne(slug);
    if (!faction) throw new NotFoundException('Faction introuvable');
    const [departmentId, clearanceLevel] = await Promise.all([
      this.departmentIdOf(req),
      this.clearanceLevelOf(req),
    ]);
    return this.factions.listScpObjects(faction.id, departmentId, clearanceLevel);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  create(@Body() dto: CreateFactionDto) {
    return this.factions.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  update(@Param('id') id: string, @Body() dto: UpdateFactionDto) {
    return this.factions.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.factions.remove(id);
  }
}
