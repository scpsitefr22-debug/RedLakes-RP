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
import { UserRole } from '@prisma/client';
import { EventsService } from './events.service';
import { CreateGameEventDto, UpdateGameEventDto } from './dto/game-event.dto';
import { AuthGuard } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PlayersService } from '../players/players.service';

type OptionalAuthRequest = Request & { user?: { id: string } };
type AuthedRequest = Request & {
  user: { id: string; minecraftUsername?: string; discordUsername?: string };
};

@Controller('events')
export class EventsController {
  constructor(
    private events: EventsService,
    private players: PlayersService,
  ) {}

  private async departmentIdOf(req: OptionalAuthRequest) {
    return req.user ? this.players.getDepartmentId(req.user.id) : null;
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(@Req() req: OptionalAuthRequest) {
    return this.events.findAll(await this.departmentIdOf(req));
  }

  @Get('cms')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  findAllAdmin() {
    return this.events.findAllAdmin();
  }

  @Get('by-id/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async findById(@Param('id') id: string) {
    const event = await this.events.findById(id);
    if (!event) throw new NotFoundException('Événement introuvable');
    return event;
  }

  @Get(':slug')
  @UseGuards(OptionalAuthGuard)
  async findOne(@Param('slug') slug: string, @Req() req: OptionalAuthRequest) {
    const event = await this.events.findOne(
      slug,
      await this.departmentIdOf(req),
    );
    if (!event) throw new NotFoundException('Événement introuvable');
    return event;
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  create(@Body() dto: CreateGameEventDto) {
    return this.events.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  update(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateGameEventDto,
  ) {
    const editorLabel = req.user.discordUsername ?? req.user.minecraftUsername ?? 'Staff';
    return this.events.update(id, dto, req.user.id, editorLabel);
  }

  @Get(':id/revisions')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  listRevisions(@Param('id') id: string) {
    return this.events.listRevisions(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.events.remove(id);
  }
}
