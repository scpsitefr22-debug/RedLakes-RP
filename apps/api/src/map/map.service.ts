import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMapLocationDto,
  UpdateMapLocationDto,
} from './dto/map-location.dto';

@Injectable()
export class MapService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.mapLocation.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(slug: string) {
    return this.prisma.mapLocation.findUnique({ where: { slug } });
  }

  findById(id: string) {
    return this.prisma.mapLocation.findUnique({ where: { id } });
  }

  create(dto: CreateMapLocationDto) {
    return this.prisma.mapLocation.create({ data: dto });
  }

  async update(
    id: string,
    dto: UpdateMapLocationDto,
    editorId?: string,
    editorLabel?: string,
  ) {
    const before = await this.prisma.mapLocation.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Emplacement introuvable');

    await this.prisma.mapLocationRevision.create({
      data: {
        mapLocationId: before.id,
        name: before.name,
        type: before.type,
        x: before.x,
        y: before.y,
        description: before.description,
        history: before.history,
        danger: before.danger,
        faction: before.faction,
        editedById: editorId,
        editedByLabel: editorLabel,
      },
    });

    return this.prisma.mapLocation.update({ where: { id }, data: dto });
  }

  /** Historique des révisions d'un emplacement — le plus récent d'abord */
  async listRevisions(mapLocationId: string) {
    const location = await this.prisma.mapLocation.findUnique({
      where: { id: mapLocationId },
      select: { id: true },
    });
    if (!location) throw new NotFoundException('Emplacement introuvable');

    return this.prisma.mapLocationRevision.findMany({
      where: { mapLocationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  remove(id: string) {
    return this.prisma.mapLocation.delete({ where: { id } });
  }
}
