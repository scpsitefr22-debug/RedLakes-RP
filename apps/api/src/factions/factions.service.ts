import { Injectable } from '@nestjs/common';
import { Faction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeGradeName } from '../grades/grades.service';
import { CreateFactionDto, UpdateFactionDto } from './dto/faction.dto';

@Injectable()
export class FactionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.faction.findMany({
      where: { playable: true },
      include: { departments: true },
      orderBy: { name: 'asc' },
    });
  }

  findOne(slug: string) {
    return this.prisma.faction.findUnique({
      where: { slug },
      include: { departments: true },
    });
  }

  findById(id: string) {
    return this.prisma.faction.findUnique({
      where: { id },
      include: { departments: true },
    });
  }

  create(dto: CreateFactionDto) {
    return this.prisma.faction.create({
      data: {
        ...dto,
        objectives: dto.objectives ?? [],
        deputyIds: dto.deputyIds ?? [],
      },
    });
  }

  update(id: string, dto: UpdateFactionDto) {
    return this.prisma.faction.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.faction.delete({ where: { id } });
  }

  /**
   * Resout un nom de faction en texte libre (Discord/Minecraft) vers
   * l'entree du catalogue correspondante, par correspondance normalisee.
   */
  async findByName(name: string | null | undefined): Promise<Faction | null> {
    if (!name) return null;
    const key = normalizeGradeName(name);
    const factions = await this.prisma.faction.findMany();
    return factions.find((f) => normalizeGradeName(f.name) === key) ?? null;
  }
}
