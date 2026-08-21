import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MissionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMissionDto, UpdateMissionDto } from './dto/mission.dto';

const MISSION_INCLUDE = {
  assignedPlayer: {
    select: {
      id: true,
      rpFirstName: true,
      rpLastName: true,
      grade: true,
      user: { select: { minecraftUsername: true } },
    },
  },
  assignedTeam: { select: { id: true, name: true } },
} satisfies Prisma.MissionInclude;

@Injectable()
export class MissionsService {
  constructor(private prisma: PrismaService) {}

  /** Missions d'un compte : celles assignees a son personnage actif + celles de son equipe */
  async findForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { activeCharacterId: true },
    });
    if (!user?.activeCharacterId) return [];

    const player = await this.prisma.player.findUnique({
      where: { id: user.activeCharacterId },
      select: { teamId: true },
    });

    return this.prisma.mission.findMany({
      where: {
        OR: [
          { assignedPlayerId: user.activeCharacterId },
          ...(player?.teamId ? [{ assignedTeamId: player.teamId }] : []),
        ],
      },
      include: MISSION_INCLUDE,
      orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { createdAt: 'desc' }],
    });
  }

  findAllAdmin(status?: MissionStatus) {
    return this.prisma.mission.findMany({
      where: status ? { status } : undefined,
      include: MISSION_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.mission.findUnique({
      where: { id },
      include: MISSION_INCLUDE,
    });
  }

  async create(dto: CreateMissionDto, actorId?: string, actorLabel?: string) {
    if (!dto.assignedPlayerId && !dto.assignedTeamId) {
      throw new BadRequestException(
        'Une mission doit être assignée à un joueur ou à une équipe',
      );
    }
    if (dto.assignedPlayerId && dto.assignedTeamId) {
      throw new BadRequestException(
        'Une mission ne peut pas être assignée à la fois à un joueur et à une équipe',
      );
    }

    return this.prisma.mission.create({
      data: {
        title: dto.title,
        description: dto.description,
        reward: dto.reward,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        assignedPlayerId: dto.assignedPlayerId,
        assignedTeamId: dto.assignedTeamId,
        createdById: actorId,
        createdByLabel: actorLabel,
      },
      include: MISSION_INCLUDE,
    });
  }

  update(id: string, dto: UpdateMissionDto) {
    return this.prisma.mission.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        reward: dto.reward,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      },
      include: MISSION_INCLUDE,
    });
  }

  async updateStatus(
    id: string,
    status: MissionStatus,
    actorId?: string,
    actorLabel?: string,
  ) {
    const mission = await this.prisma.mission.findUnique({ where: { id } });
    if (!mission) throw new NotFoundException('Mission introuvable');

    const isResolution = status !== MissionStatus.ASSIGNED;

    return this.prisma.mission.update({
      where: { id },
      data: {
        status,
        resolvedAt: isResolution ? new Date() : null,
        resolvedById: isResolution ? actorId : null,
        resolvedByLabel: isResolution ? actorLabel : null,
      },
      include: MISSION_INCLUDE,
    });
  }

  remove(id: string) {
    return this.prisma.mission.delete({ where: { id } });
  }
}
