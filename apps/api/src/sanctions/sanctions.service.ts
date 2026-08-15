import { Injectable } from '@nestjs/common';
import { SanctionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSanctionDto, UpdateSanctionDto } from './dto/sanction.dto';

@Injectable()
export class SanctionsService {
  constructor(private prisma: PrismaService) {}

  findForPlayer(playerId: string) {
    return this.prisma.sanction.findMany({
      where: { playerId },
      orderBy: { issuedAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.sanction.findUnique({ where: { id } });
  }

  /**
   * Player.sanctions reste un compteur cumulatif (total historique, pas
   * "sanctions actives") — une sanction levee reste dans le decompte, elle
   * a bien eu lieu. Seule une suppression (correction d'une erreur de
   * saisie) le decremente.
   */
  async create(dto: CreateSanctionDto, issuedById?: string) {
    const [sanction] = await this.prisma.$transaction([
      this.prisma.sanction.create({
        data: {
          playerId: dto.playerId,
          type: dto.type,
          reason: dto.reason,
          note: dto.note,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
          issuedById,
        },
      }),
      this.prisma.player.update({
        where: { id: dto.playerId },
        data: { sanctions: { increment: 1 } },
      }),
    ]);
    return sanction;
  }

  async update(id: string, dto: UpdateSanctionDto, actorId?: string) {
    const data: {
      type: typeof dto.type;
      reason: typeof dto.reason;
      note: typeof dto.note;
      expiresAt?: Date;
      status?: SanctionStatus;
      liftedAt?: Date;
      liftedById?: string;
    } = {
      type: dto.type,
      reason: dto.reason,
      note: dto.note,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    };

    if (dto.status) {
      data.status = dto.status;
      if (dto.status === SanctionStatus.LEVEE) {
        data.liftedAt = new Date();
        data.liftedById = actorId;
      }
    }

    return this.prisma.sanction.update({ where: { id }, data });
  }

  async remove(id: string) {
    const sanction = await this.prisma.sanction.delete({ where: { id } });
    await this.prisma.player.update({
      where: { id: sanction.playerId },
      data: { sanctions: { decrement: 1 } },
    });
    return sanction;
  }
}
