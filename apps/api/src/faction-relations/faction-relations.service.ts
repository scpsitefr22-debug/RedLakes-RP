import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SetFactionRelationDto,
  UpdateFactionRelationDto,
} from './dto/faction-relation.dto';

const FACTION_SELECT = { id: true, slug: true, name: true, color: true };

@Injectable()
export class FactionRelationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Relation non dirigee : on range toujours factionAId/factionBId par
   * ordre d'id pour qu'une paire ne soit jamais stockee deux fois
   * (A-B et B-A) — l'index unique @@unique([factionAId, factionBId])
   * ne protege que dans un seul sens sans ca.
   */
  private canonicalPair(a: string, b: string): [string, string] {
    if (a === b) {
      throw new BadRequestException(
        'Une faction ne peut pas avoir de relation avec elle-même',
      );
    }
    return a < b ? [a, b] : [b, a];
  }

  findAll() {
    return this.prisma.factionRelation.findMany({
      include: { factionA: { select: FACTION_SELECT }, factionB: { select: FACTION_SELECT } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findForFaction(factionId: string) {
    const relations = await this.prisma.factionRelation.findMany({
      where: { OR: [{ factionAId: factionId }, { factionBId: factionId }] },
      include: { factionA: { select: FACTION_SELECT }, factionB: { select: FACTION_SELECT } },
    });

    return relations.map((r) => ({
      id: r.id,
      status: r.status,
      note: r.note,
      faction: r.factionAId === factionId ? r.factionB : r.factionA,
    }));
  }

  async set(dto: SetFactionRelationDto) {
    const [factionAId, factionBId] = this.canonicalPair(
      dto.factionAId,
      dto.factionBId,
    );

    return this.prisma.factionRelation.upsert({
      where: { factionAId_factionBId: { factionAId, factionBId } },
      create: { factionAId, factionBId, status: dto.status, note: dto.note },
      update: { status: dto.status, note: dto.note },
      include: { factionA: { select: FACTION_SELECT }, factionB: { select: FACTION_SELECT } },
    });
  }

  async update(id: string, dto: UpdateFactionRelationDto) {
    const existing = await this.prisma.factionRelation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Relation introuvable');

    return this.prisma.factionRelation.update({
      where: { id },
      data: dto,
      include: { factionA: { select: FACTION_SELECT }, factionB: { select: FACTION_SELECT } },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.factionRelation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Relation introuvable');
    return this.prisma.factionRelation.delete({ where: { id } });
  }
}
