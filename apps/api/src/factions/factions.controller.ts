import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { FactionsService } from './factions.service';
import { CreateFactionDto, UpdateFactionDto } from './dto/faction.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('factions')
export class FactionsController {
  constructor(private factions: FactionsService) {}

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

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  create(@Body() dto: CreateFactionDto) {
    return this.factions.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
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
