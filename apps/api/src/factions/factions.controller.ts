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

  @Get()
  findAll() {
    return this.factions.findAll();
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
  async findOne(@Param('slug') slug: string) {
    const faction = await this.factions.findOne(slug);
    if (!faction) throw new NotFoundException('Faction introuvable');
    return faction;
  }

  @Get(':slug/members')
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
