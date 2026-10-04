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
import { StaffRank, UserRole } from '@prisma/client';
import type { Request } from 'express';
import { GradesService } from './grades.service';
import { CreateGradeDto, UpdateGradeDto } from './dto/grade.dto';
import { UpdateGradeAccessDto } from './dto/grade-access.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinRank } from '../auth/rank.decorator';

@Controller('grades')
export class GradesController {
  constructor(private grades: GradesService) {}

  @Get()
  findAll(@Query('branch') branch?: string) {
    return this.grades.findAll(branch);
  }

  /** Grille staff : tous les grades, retirés compris, avec leur nombre de personnages. */
  @Get('manage')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  findForManagement() {
    return this.grades.findForManagement();
  }

  @Get('by-id/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async findById(@Param('id') id: string) {
    const grade = await this.grades.findById(id);
    if (!grade) throw new NotFoundException('Grade introuvable');
    return grade;
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const grade = await this.grades.findOne(slug);
    if (!grade) throw new NotFoundException('Grade introuvable');
    return grade;
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  create(@Body() dto: CreateGradeDto) {
    return this.grades.create(dto);
  }

  /** Grille des accès : plusieurs grades d'un coup. Déclaré avant `:id`. */
  @Patch('access')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  updateAccess(
    @Req() req: Request & { user: { id: string; minecraftUsername?: string; discordUsername?: string; username?: string } },
    @Body() dto: UpdateGradeAccessDto,
  ) {
    const actorLabel =
      req.user.discordUsername ?? req.user.minecraftUsername ?? req.user.username ?? 'Staff';
    return this.grades.updateAccess(dto.changes, { id: req.user.id, label: actorLabel });
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  update(@Param('id') id: string, @Body() dto: UpdateGradeDto) {
    return this.grades.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.grades.remove(id);
  }
}
