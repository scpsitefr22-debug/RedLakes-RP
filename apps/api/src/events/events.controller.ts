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
import { EventsService } from './events.service';
import { CreateGameEventDto, UpdateGameEventDto } from './dto/game-event.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('events')
export class EventsController {
  constructor(private events: EventsService) {}

  @Get()
  findAll() {
    return this.events.findAll();
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
  async findOne(@Param('slug') slug: string) {
    const event = await this.events.findOne(slug);
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
  update(@Param('id') id: string, @Body() dto: UpdateGameEventDto) {
    return this.events.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.events.remove(id);
  }
}
