import { Injectable } from '@nestjs/common';
import { Faction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeGradeName } from '../grades/grades.service';

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
