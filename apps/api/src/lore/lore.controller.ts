import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { LoreService } from './lore.service';
import { CreateLoreDto, UpdateLoreDto } from './dto/lore.dto';
import { AuthGuard } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PlayersService } from '../players/players.service';

type OptionalAuthRequest = Request & { user?: { id: string } };

@Controller('lore')
export class LoreController {
  constructor(
    private lore: LoreService,
    private players: PlayersService,
  ) {}

  private async departmentIdOf(req: OptionalAuthRequest) {
    return req.user ? this.players.getDepartmentId(req.user.id) : null;
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findPublished(@Req() req: OptionalAuthRequest) {
    return this.lore.findPublished(await this.departmentIdOf(req));
  }

  @Get('cms')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  findAllAdmin() {
    return this.lore.findAllAdmin();
  }

  @Get(':slug')
  @UseGuards(OptionalAuthGuard)
  async findOne(@Param('slug') slug: string, @Req() req: OptionalAuthRequest) {
    return this.lore.findBySlug(slug, await this.departmentIdOf(req));
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  create(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: CreateLoreDto,
  ) {
    return this.lore.create(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateLoreDto) {
    return this.lore.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.lore.remove(id);
  }
}
