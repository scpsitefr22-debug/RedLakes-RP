import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCharacterDto, UpdateCharacterDto } from './dto/character.dto';
import {
  filterByDepartment,
  isVisibleToDepartment,
} from '../common/department-visibility';

@Injectable()
export class CharactersService {
  constructor(private prisma: PrismaService) {}

  async findAll(departmentId: string | null = null) {
    const characters = await this.prisma.character.findMany({
      orderBy: { name: 'asc' },
    });
    return filterByDepartment(characters, departmentId);
  }

  findAllAdmin() {
    return this.prisma.character.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(slug: string, departmentId: string | null = null) {
    const character = await this.prisma.character.findUnique({
      where: { slug },
    });
    if (!character) return null;
    if (
      !isVisibleToDepartment(character.restrictedDepartmentIds, departmentId)
    ) {
      throw new NotFoundException('Accès restreint à un autre département');
    }
    return character;
  }

  findById(id: string) {
    return this.prisma.character.findUnique({ where: { id } });
  }

  create(dto: CreateCharacterDto) {
    return this.prisma.character.create({
      data: {
        ...dto,
        quotes: dto.quotes ?? [],
        history: dto.history ?? [],
      },
    });
  }

  async update(
    id: string,
    dto: UpdateCharacterDto,
    editorId?: string,
    editorLabel?: string,
  ) {
    const before = await this.prisma.character.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Personnage introuvable');

    await this.prisma.characterRevision.create({
      data: {
        characterId: before.id,
        name: before.name,
        title: before.title,
        faction: before.faction,
        biography: before.biography,
        quotes: before.quotes,
        history: before.history,
        portrait: before.portrait,
        editedById: editorId,
        editedByLabel: editorLabel,
      },
    });

    return this.prisma.character.update({ where: { id }, data: dto });
  }

  /** Historique des révisions d'un personnage — la plus récente d'abord */
  async listRevisions(characterId: string) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      select: { id: true },
    });
    if (!character) throw new NotFoundException('Personnage introuvable');

    return this.prisma.characterRevision.findMany({
      where: { characterId },
      orderBy: { createdAt: 'desc' },
    });
  }

  remove(id: string) {
    return this.prisma.character.delete({ where: { id } });
  }
}
