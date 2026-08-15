import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCharacterDto, UpdateCharacterDto } from './dto/character.dto';

@Injectable()
export class CharactersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.character.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(slug: string) {
    return this.prisma.character.findUnique({ where: { slug } });
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
