import { Injectable, NotFoundException } from '@nestjs/common';
import { Grade, Faction } from '@prisma/client';

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

    rpFirstName: string | null;

    rpLastName: string | null;

    playtime: number;

    reputation: number;

    sanctions: number;

    clearance: number;

    medals: string[];

    achievements: unknown;

    roleUpdatedAt: Date;

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

      rpFirstName: player.rpFirstName,

      rpLastName: player.rpLastName,

      playtime: player.playtime,

      reputation: player.reputation,

      sanctions: player.sanctions,

      clearance: player.clearance,

      medals: player.medals,

      achievements: player.achievements,

      roleUpdatedAt: player.roleUpdatedAt,

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
        gradeInfo: true,

        factionInfo: true,

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

      rpFirstName: p.rpFirstName,

      rpLastName: p.rpLastName,

      reputation: p.reputation,

      medals: p.medals,

      roleUpdatedAt: p.roleUpdatedAt,

      user: p.user,
    }));
  }

  async findByUsername(username: string) {
    const player = await this.prisma.player.findFirst({
      where: { user: { minecraftUsername: username } },

      include: {
        gradeInfo: true,

        factionInfo: true,

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
        gradeInfo: true,

        factionInfo: true,

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
