import { Injectable, NotFoundException } from '@nestjs/common';
import { Grade, Faction, Team } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  formatProfile(player: {
    grade: string;

    gradeInfo: Grade | null;

    faction: string;

    factionInfo: Faction | null;

    teamName: string | null;

    teamInfo: Team | null;

    rpFirstName: string | null;

    rpLastName: string | null;

    playtime: number;

    reputation: number;

    sanctions: number;

    medals: string[];

    achievements: unknown;

    roleUpdatedAt: Date;

    seniority: Date;

    user: {
      minecraftUsername: string | null;

      minecraftUuid: string | null;

      avatarUrl: string | null;

      role: string;

      discordId: string | null;

      discordUsername: string | null;

      createdAt: Date;
    };
  }) {
    return {
      grade: player.grade,

      gradeInfo: player.gradeInfo,

      faction: player.faction,

      factionInfo: player.factionInfo,

      teamName: player.teamName,

      teamInfo: player.teamInfo,

      rpFirstName: player.rpFirstName,

      rpLastName: player.rpLastName,

      playtime: player.playtime,

      reputation: player.reputation,

      sanctions: player.sanctions,

      medals: player.medals,

      achievements: player.achievements,

      roleUpdatedAt: player.roleUpdatedAt,

      seniority: player.seniority,

      user: {
        minecraftUsername: player.user.minecraftUsername,

        minecraftUuid: player.user.minecraftUuid,

        avatarUrl: player.user.avatarUrl,

        role: player.user.role,

        discordLinked: !!player.user.discordId,

        discordUsername: player.user.discordUsername,

        createdAt: player.user.createdAt,
      },
    };
  }

  async findAll() {
    const players = await this.prisma.player.findMany({
      include: {
        gradeInfo: { include: { departmentRef: true } },

        factionInfo: true,

        teamInfo: true,

        user: {
          select: {
            minecraftUsername: true,

            avatarUrl: true,

            discordId: true,
          },
        },
      },

      orderBy: { roleUpdatedAt: 'desc' },

      take: 100,
    });

    return players.map((p) => ({
      id: p.id,

      grade: p.grade,

      gradeInfo: p.gradeInfo,

      faction: p.faction,

      factionInfo: p.factionInfo,

      teamName: p.teamName,

      teamInfo: p.teamInfo,

      rpFirstName: p.rpFirstName,

      rpLastName: p.rpLastName,

      reputation: p.reputation,

      medals: p.medals,

      roleUpdatedAt: p.roleUpdatedAt,

      user: p.user,
    }));
  }

  /** Departement courant du joueur, derive de son grade actuel. */
  async getDepartmentId(userId: string): Promise<string | null> {
    const player = await this.prisma.player.findUnique({
      where: { userId },
      select: { gradeInfo: { select: { departmentRefId: true } } },
    });
    return player?.gradeInfo?.departmentRefId ?? null;
  }

  async findIdByUsername(username: string) {
    const player = await this.prisma.player.findFirst({
      where: { user: { minecraftUsername: username } },
      select: { id: true },
    });
    return player?.id ?? null;
  }

  async findByUsername(username: string) {
    const player = await this.prisma.player.findFirst({
      where: { user: { minecraftUsername: username } },

      include: {
        gradeInfo: { include: { departmentRef: true } },

        factionInfo: true,

        teamInfo: true,

        user: {
          select: {
            minecraftUsername: true,

            minecraftUuid: true,

            avatarUrl: true,

            discordId: true,

            discordUsername: true,

            createdAt: true,

            role: true,
          },
        },
      },
    });

    if (!player) throw new NotFoundException('Joueur introuvable');

    return this.formatProfile(player);
  }

  async getDashboard(userId: string) {
    const player = await this.prisma.player.findUnique({
      where: { userId },

      include: {
        gradeInfo: { include: { departmentRef: true } },

        factionInfo: true,

        teamInfo: true,

        user: {
          select: {
            minecraftUsername: true,

            minecraftUuid: true,

            avatarUrl: true,

            role: true,

            discordId: true,

            discordUsername: true,

            createdAt: true,
          },
        },
      },
    });

    if (!player) throw new NotFoundException('Profil joueur introuvable');

    return this.formatProfile(player);
  }
}
