import { Injectable } from '@nestjs/common';
import { AssignmentEntityType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  findForPlayer(playerId: string) {
    return this.prisma.playerAssignment.findMany({
      where: { playerId },
      orderBy: { startedAt: 'desc' },
    });
  }

  findCurrent(entityType: AssignmentEntityType, entityId: string) {
    return this.prisma.playerAssignment.findMany({
      where: { entityType, entityId, endedAt: null },
      include: {
        player: {
          include: {
            user: { select: { minecraftUsername: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { startedAt: 'asc' },
    });
  }

  /**
   * Cree une nouvelle affectation et cloture automatiquement la precedente
   * affectation ouverte du meme joueur pour le meme type d'entite (on ne
   * peut pas etre dans 2 factions, 2 departements ou 2 teams a la fois).
   * Synchronise aussi l'etat courant sur Player (factionId/teamId) quand le
   * champ existe — DEPARTMENT n'a pas d'equivalent direct sur Player
   * aujourd'hui, l'historique de PlayerAssignment reste alors la seule
   * source pour "quel departement en ce moment".
   */
  async create(dto: CreateAssignmentDto) {
    const now = new Date();

    await this.prisma.playerAssignment.updateMany({
      where: {
        playerId: dto.playerId,
        entityType: dto.entityType,
        endedAt: null,
      },
      data: { endedAt: now },
    });

    const assignment = await this.prisma.playerAssignment.create({
      data: {
        playerId: dto.playerId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        role: dto.role,
        note: dto.note,
        startedAt: now,
      },
    });

    if (dto.entityType === AssignmentEntityType.FACTION) {
      await this.prisma.player.update({
        where: { id: dto.playerId },
        data: { factionId: dto.entityId },
      });
    } else if (dto.entityType === AssignmentEntityType.TEAM) {
      await this.prisma.player.update({
        where: { id: dto.playerId },
        data: { teamId: dto.entityId },
      });
    }

    return assignment;
  }

  update(id: string, dto: UpdateAssignmentDto) {
    return this.prisma.playerAssignment.update({
      where: { id },
      data: {
        role: dto.role,
        note: dto.note,
        endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
      },
    });
  }

  remove(id: string) {
    return this.prisma.playerAssignment.delete({ where: { id } });
  }
}
