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

  update(id: string, dto: UpdateCharacterDto) {
    return this.prisma.character.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.character.delete({ where: { id } });
  }
}
