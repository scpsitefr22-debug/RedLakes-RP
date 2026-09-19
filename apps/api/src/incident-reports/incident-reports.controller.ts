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
import { IncidentReportsService } from './incident-reports.service';
import {
  CreateIncidentReportDto,
  UpdateIncidentReportDto,
} from './dto/incident-report.dto';
import { AuthGuard } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinRank } from '../auth/rank.decorator';
import { PlayersService } from '../players/players.service';

type OptionalAuthRequest = Request & { user?: { id: string } };

@Controller('incident-reports')
export class IncidentReportsController {
  constructor(
    private reports: IncidentReportsService,
    private players: PlayersService,
  ) {}

  private async departmentIdOf(req: OptionalAuthRequest) {
    return req.user ? this.players.getDepartmentId(req.user.id) : null;
  }

  private async clearanceLevelOf(req: OptionalAuthRequest) {
    return req.user ? this.players.getClearanceLevel(req.user.id) : 1;
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findPublished(@Req() req: OptionalAuthRequest) {
    const [departmentId, clearanceLevel] = await Promise.all([
      this.departmentIdOf(req),
      this.clearanceLevelOf(req),
    ]);
    return this.reports.findPublished(departmentId, clearanceLevel);
  }

  @Get('cms')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  findAllAdmin() {
    return this.reports.findAllAdmin();
  }

  @Get('by-id/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async findById(@Param('id') id: string) {
    const report = await this.reports.findById(id);
    if (!report) throw new NotFoundException('Rapport introuvable');
    return report;
  }

  @Get(':slug')
  @UseGuards(OptionalAuthGuard)
  async findOne(@Param('slug') slug: string, @Req() req: OptionalAuthRequest) {
    const [departmentId, clearanceLevel] = await Promise.all([
      this.departmentIdOf(req),
      this.clearanceLevelOf(req),
    ]);
    return this.reports.findBySlug(slug, departmentId, clearanceLevel);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  create(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: CreateIncidentReportDto,
  ) {
    return this.reports.create(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.OFFICIER)
  update(@Param('id') id: string, @Body() dto: UpdateIncidentReportDto) {
    return this.reports.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.reports.remove(id);
  }
}
