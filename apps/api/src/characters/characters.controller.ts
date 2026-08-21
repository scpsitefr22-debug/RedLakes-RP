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
import { CharactersService } from './characters.service';
import { CreateCharacterDto, UpdateCharacterDto } from './dto/character.dto';
import { AuthGuard } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinRank } from '../auth/rank.decorator';
import { PlayersService } from '../players/players.service';

type OptionalAuthRequest = Request & { user?: { id: string } };
type AuthedRequest = Request & {
  user: { id: string; minecraftUsername?: string; discordUsername?: string };
};

@Controller('characters')
export class CharactersController {
  constructor(
    private characters: CharactersService,
    private players: PlayersService,
  ) {}

  private async departmentIdOf(req: OptionalAuthRequest) {
    return req.user ? this.players.getDepartmentId(req.user.id) : null;
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(@Req() req: OptionalAuthRequest) {
    return this.characters.findAll(await this.departmentIdOf(req));
  }

  @Get('cms')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  findAllAdmin() {
    return this.characters.findAllAdmin();
  }

  @Get('by-id/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async findById(@Param('id') id: string) {
    const character = await this.characters.findById(id);
    if (!character) throw new NotFoundException('Personnage introuvable');
    return character;
  }

  @Get(':slug')
  @UseGuards(OptionalAuthGuard)
  async findOne(@Param('slug') slug: string, @Req() req: OptionalAuthRequest) {
    const character = await this.characters.findOne(
      slug,
      await this.departmentIdOf(req),
    );
    if (!character) throw new NotFoundException('Personnage introuvable');
    return character;
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  create(@Body() dto: CreateCharacterDto) {
    return this.characters.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  update(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCharacterDto,
  ) {
    const editorLabel = req.user.discordUsername ?? req.user.minecraftUsername ?? 'Staff';
    return this.characters.update(id, dto, req.user.id, editorLabel);
  }

  @Get(':id/revisions')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  listRevisions(@Param('id') id: string) {
    return this.characters.listRevisions(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.characters.remove(id);
  }
}
