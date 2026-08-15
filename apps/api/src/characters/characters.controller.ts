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
import { CharactersService } from './characters.service';
import { CreateCharacterDto, UpdateCharacterDto } from './dto/character.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('characters')
export class CharactersController {
  constructor(private characters: CharactersService) {}

  @Get()
  findAll() {
    return this.characters.findAll();
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
  async findOne(@Param('slug') slug: string) {
    const character = await this.characters.findOne(slug);
    if (!character) throw new NotFoundException('Personnage introuvable');
    return character;
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  create(@Body() dto: CreateCharacterDto) {
    return this.characters.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCharacterDto) {
    return this.characters.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.characters.remove(id);
  }
}
