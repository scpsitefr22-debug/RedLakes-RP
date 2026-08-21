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
import { ScpClass, ScpProposalStatus, StaffRank, UserRole } from '@prisma/client';
import { ScpService } from './scp.service';
import { CreateScpObjectDto, UpdateScpObjectDto } from './dto/scp-object.dto';
import { ProposeScpDto } from './dto/propose-scp.dto';
import { ReviewScpDto } from './dto/review-scp.dto';
import { AuthGuard } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinRank } from '../auth/rank.decorator';
import { PlayersService } from '../players/players.service';

type OptionalAuthRequest = Request & { user?: { id: string } };
type AuthedRequest = Request & { user: { id: string } };

@Controller('scp')
export class ScpController {
  constructor(
    private scp: ScpService,
    private players: PlayersService,
  ) {}

  private async departmentIdOf(req: OptionalAuthRequest) {
    return req.user ? this.players.getDepartmentId(req.user.id) : null;
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(
    @Req() req: OptionalAuthRequest,
    @Query('class') scpClass?: ScpClass,
  ) {
    return this.scp.findAll(scpClass, await this.departmentIdOf(req));
  }

  @Get('cms')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  findAllAdmin(@Query('status') status?: ScpProposalStatus) {
    return this.scp.findAllAdmin(status);
  }

  @Get('by-id/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async findById(@Param('id') id: string) {
    const scp = await this.scp.findById(id);
    if (!scp) throw new NotFoundException('Objet SCP introuvable');
    return scp;
  }

  @Post('propose')
  @UseGuards(AuthGuard)
  propose(@Req() req: AuthedRequest, @Body() dto: ProposeScpDto) {
    return this.scp.propose(req.user.id, dto);
  }

  @Get(':slug')
  @UseGuards(OptionalAuthGuard)
  async findOne(@Param('slug') slug: string, @Req() req: OptionalAuthRequest) {
    const scp = await this.scp.findOne(slug, await this.departmentIdOf(req));
    if (!scp) throw new NotFoundException('Objet SCP introuvable');
    return scp;
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  create(@Body() dto: CreateScpObjectDto) {
    return this.scp.create(dto);
  }

  @Patch(':id/review')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  review(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: ReviewScpDto,
  ) {
    return this.scp.review(id, req.user.id, dto.status, dto.staffNote);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  async update(
    @Req() req: AuthedRequest & { user: { minecraftUsername?: string; discordUsername?: string } },
    @Param('id') id: string,
    @Body() dto: UpdateScpObjectDto,
  ) {
    const editorLabel = req.user.discordUsername ?? req.user.minecraftUsername ?? 'Staff';
    return this.scp.update(id, dto, req.user.id, editorLabel);
  }

  @Get(':id/revisions')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  listRevisions(@Param('id') id: string) {
    return this.scp.listRevisions(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.scp.remove(id);
  }
}
