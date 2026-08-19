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
      // Un compte peut avoir plusieurs personnages (Player) — le trombinoscope
      // ne montre que le personnage actif de chacun, pas tous ses alts.
      where: { activeForUser: { isNot: null } },
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

  /** Resout l'id du personnage actif d'un compte (User.activeCharacterId). */
  private async resolveActiveCharacterId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { activeCharacterId: true },
    });
    if (!user?.activeCharacterId) {
      throw new NotFoundException('Profil joueur introuvable');
    }
    return user.activeCharacterId;
  }

  /** Departement courant du joueur (personnage actif), derive de son grade. */
  async getDepartmentId(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { activeCharacterId: true },
    });
    if (!user?.activeCharacterId) return null;
    const player = await this.prisma.player.findUnique({
      where: { id: user.activeCharacterId },
      select: { gradeInfo: { select: { departmentRefId: true } } },
    });
    return player?.gradeInfo?.departmentRefId ?? null;
  }

  async findIdByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { minecraftUsername: username },
      select: { activeCharacterId: true },
    });
    return user?.activeCharacterId ?? null;
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { minecraftUsername: username },
      select: { activeCharacterId: true },
    });
    if (!user?.activeCharacterId) throw new NotFoundException('Joueur introuvable');

    const player = await this.prisma.player.findUnique({
      where: { id: user.activeCharacterId },

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
    const activeCharacterId = await this.resolveActiveCharacterId(userId);
    const player = await this.prisma.player.findUnique({
      where: { id: activeCharacterId },

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

  /**
   * Historique de carriere reel — alimente par PlayerAssignment, ecrit
   * automatiquement a chaque changement de faction/departement (voir
   * SyncService.recordAssignmentChange). Retourne un intitule lisible au
   * lieu du cuid brut de l'entite.
   */
  async getCareerHistory(userId: string) {
    const activeCharacterId = await this.resolveActiveCharacterId(userId);

    const assignments = await this.prisma.playerAssignment.findMany({
      where: { playerId: activeCharacterId },
      orderBy: { startedAt: 'desc' },
    });

    const factionIds = assignments
      .filter((a) => a.entityType === 'FACTION')
      .map((a) => a.entityId);
    const departmentIds = assignments
      .filter((a) => a.entityType === 'DEPARTMENT')
      .map((a) => a.entityId);

    const [factions, departments] = await Promise.all([
      factionIds.length
        ? this.prisma.faction.findMany({
            where: { id: { in: factionIds } },
            select: { id: true, name: true },
          })
        : [],
      departmentIds.length
        ? this.prisma.department.findMany({
            where: { id: { in: departmentIds } },
            select: { id: true, name: true },
          })
        : [],
    ]);
    const factionNames = new Map(factions.map((f) => [f.id, f.name]));
    const departmentNames = new Map(departments.map((d) => [d.id, d.name]));

    return assignments.map((a) => ({
      id: a.id,
      entityType: a.entityType,
      label:
        a.entityType === 'FACTION'
          ? (factionNames.get(a.entityId) ?? 'Faction inconnue')
          : (departmentNames.get(a.entityId) ?? 'Département inconnu'),
      startedAt: a.startedAt,
      endedAt: a.endedAt,
    }));
  }
}
