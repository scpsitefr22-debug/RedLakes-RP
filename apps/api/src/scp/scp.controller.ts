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
import { ScpClass, UserRole } from '@prisma/client';
import { ScpService } from './scp.service';
import { CreateScpObjectDto, UpdateScpObjectDto } from './dto/scp-object.dto';
import { AuthGuard } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PlayersService } from '../players/players.service';

type OptionalAuthRequest = Request & { user?: { id: string } };

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
  findAllAdmin() {
    return this.scp.findAllAdmin();
  }

  @Get('by-id/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async findById(@Param('id') id: string) {
    const scp = await this.scp.findById(id);
    if (!scp) throw new NotFoundException('Objet SCP introuvable');
    return scp;
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
  create(@Body() dto: CreateScpObjectDto) {
    return this.scp.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateScpObjectDto) {
    return this.scp.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.scp.remove(id);
  }
}
