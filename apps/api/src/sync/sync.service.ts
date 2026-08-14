import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { DiscordService } from './discord.service';
import { SyncRoleDto } from './dto/sync-role.dto';
import { DiscordLinkDto } from './dto/discord-link.dto';
import { SyncDiscordGradeDto } from './dto/sync-discord-grade.dto';
import { PersonnelReportStatus } from '@prisma/client';
import { clearanceForGrade } from '../players/grade-clearance';

@Injectable()
export class SyncService {
  constructor(
    private prisma: PrismaService,
    private discord: DiscordService,
  ) {}

  async syncRole(dto: SyncRoleDto) {
    const username = dto.minecraftUsername.trim();
    const uuid =
      dto.minecraftUuid ??
      `offline-${username.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;

    const user = await this.prisma.user.upsert({
      where: { minecraftUuid: uuid },
      update: { minecraftUsername: username },
      create: {
        minecraftUuid: uuid,
        minecraftUsername: username,
        avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(username)}/64`,
        player: {
          create: {
            grade: dto.grade,
            faction: dto.faction ?? 'Civil',
            teamName: dto.teamName,
            rpFirstName: dto.rpFirstName,
            rpLastName: dto.rpLastName,
            clearance: dto.clearance ?? clearanceForGrade(dto.grade),
            playtime: dto.playtime ?? 0,
            roleUpdatedAt: new Date(),
          },
        },
      },
      include: { player: true },
    });

    let player = user.player;
    const previousGrade = player?.grade;

    if (!player) {
      player = await this.prisma.player.create({
        data: {
          userId: user.id,
          grade: dto.grade,
          faction: dto.faction ?? 'Civil',
          teamName: dto.teamName,
          rpFirstName: dto.rpFirstName,
          rpLastName: dto.rpLastName,
          clearance: dto.clearance ?? clearanceForGrade(dto.grade),
          playtime: dto.playtime ?? 0,
        },
      });
    } else {
      const derivedClearance = clearanceForGrade(dto.grade);
      player = await this.prisma.player.update({
        where: { id: player.id },
        data: {
          grade: dto.grade,
          clearance: dto.clearance ?? derivedClearance,
          ...(dto.faction !== undefined && { faction: dto.faction }),
          ...(dto.teamName !== undefined && { teamName: dto.teamName }),
          ...(dto.rpFirstName !== undefined && {
            rpFirstName: dto.rpFirstName,
          }),
          ...(dto.rpLastName !== undefined && { rpLastName: dto.rpLastName }),
          ...(dto.clearance !== undefined && { clearance: dto.clearance }),
          ...(dto.playtime !== undefined && { playtime: dto.playtime }),
          roleUpdatedAt: new Date(),
        },
      });
    }

    if (user.discordId) {
      await this.discord.syncMemberProfile({
        discordId: user.discordId,
        minecraftUsername: username,
        grade: player.grade,
        faction: player.faction,
        teamName: player.teamName,
        rpFirstName: player.rpFirstName,
        rpLastName: player.rpLastName,
      });
    }

    await this.discord.notifyRoleChange({
      minecraftUsername: username,
      grade: player.grade,
      previousGrade,
      faction: player.faction,
      teamName: player.teamName,
    });

    return {
      success: true,
      minecraftUsername: username,
      grade: player.grade,
      faction: player.faction,
      teamName: player.teamName,
      rpFirstName: player.rpFirstName,
      rpLastName: player.rpLastName,
      discordSynced: !!user.discordId,
      roleUpdatedAt: player.roleUpdatedAt,
    };
  }

  async createDiscordLinkCode(userId: string) {
    const code = randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.linkCode.create({
      data: { code, userId, expiresAt },
    });

    return { code, expiresIn: 600 };
  }

  async linkDiscord(dto: DiscordLinkDto) {
    const link = await this.prisma.linkCode.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!link || link.used || link.expiresAt < new Date() || !link.userId) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    const user = await this.prisma.user.update({
      where: { id: link.userId },
      data: {
        discordId: dto.discordId,
        discordUsername: dto.discordUsername,
      },
      include: { player: true },
    });

    await this.prisma.linkCode.update({
      where: { id: link.id },
      data: { used: true },
    });

    if (user.player) {
      await this.discord.syncMemberProfile({
        discordId: dto.discordId,
        minecraftUsername: user.minecraftUsername ?? 'Joueur',
        grade: user.player.grade,
        faction: user.player.faction,
        teamName: user.player.teamName,
        rpFirstName: user.player.rpFirstName,
        rpLastName: user.player.rpLastName,
      });
    }

    await this.discord.notifyAccountLinked({
      minecraftUsername: user.minecraftUsername ?? 'Joueur',
      discordUsername: dto.discordUsername,
    });

    return {
      success: true,
      minecraftUsername: user.minecraftUsername,
      discordId: dto.discordId,
    };
  }

  async unlinkDiscord(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.discordId) throw new NotFoundException('Discord non lié');

    await this.prisma.user.update({
      where: { id: userId },
      data: { discordId: null, discordUsername: null },
    });

    return { success: true };
  }

  /** Déliaison déclenchée depuis Discord (commande /unlink) */
  async unlinkByDiscordId(discordId: string) {
    const user = await this.prisma.user.findUnique({ where: { discordId } });
    if (!user) throw new NotFoundException('Aucun compte lié à ce Discord');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { discordId: null, discordUsername: null },
    });

    return { success: true, minecraftUsername: user.minecraftUsername };
  }

  /** Profil joueur à partir de l'ID Discord (commande /profil) */
  async getProfileByDiscordId(discordId: string) {
    const user = await this.prisma.user.findUnique({
      where: { discordId },
      include: { player: true },
    });
    if (!user || !user.player) {
      throw new NotFoundException('Aucun compte lié à ce Discord');
    }

    return {
      minecraftUsername: user.minecraftUsername,
      avatarUrl: user.avatarUrl,
      discordUsername: user.discordUsername,
      grade: user.player.grade,
      faction: user.player.faction,
      teamName: user.player.teamName,
      rpFirstName: user.player.rpFirstName,
      rpLastName: user.player.rpLastName,
      playtime: user.player.playtime,
      reputation: user.player.reputation,
      sanctions: user.player.sanctions,
      clearance: user.player.clearance,
      medals: user.player.medals,
      roleUpdatedAt: user.player.roleUpdatedAt,
      seniority: user.player.seniority,
    };
  }

  /** Mise a jour du grade depuis Discord (role RP) — ne repousse pas vers Discord */
  async syncGradeFromDiscord(dto: SyncDiscordGradeDto) {
    const user = await this.prisma.user.findUnique({
      where: { discordId: dto.discordId },
      include: { player: true },
    });

    if (!user?.player) {
      throw new NotFoundException('Aucun compte lie a ce Discord');
    }

    const previousGrade = user.player.grade;
    if (previousGrade === dto.grade) {
      return {
        success: true,
        unchanged: true,
        grade: dto.grade,
        previousGrade,
        minecraftUsername: user.minecraftUsername,
      };
    }

    const player = await this.prisma.player.update({
      where: { id: user.player.id },
      data: {
        grade: dto.grade,
        clearance: clearanceForGrade(dto.grade),
        roleUpdatedAt: new Date(),
      },
    });

    await this.discord.notifyRoleChange({
      minecraftUsername: user.minecraftUsername ?? 'Joueur',
      grade: player.grade,
      previousGrade,
      faction: player.faction,
      teamName: player.teamName,
    });

    return {
      success: true,
      grade: player.grade,
      previousGrade,
      discordRoleName: dto.discordRoleName,
      minecraftUsername: user.minecraftUsername,
      roleUpdatedAt: player.roleUpdatedAt,
    };
  }

  /** Identité RP (prénom/nom) — site ou bot Discord */
  async updateRpIdentity(
    userId: string,
    data: { rpFirstName?: string; rpLastName?: string; teamName?: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { player: true },
    });
    if (!user?.player) {
      throw new NotFoundException('Profil joueur introuvable');
    }

    const player = await this.prisma.player.update({
      where: { id: user.player.id },
      data: {
        ...(data.rpFirstName !== undefined && {
          rpFirstName: data.rpFirstName || null,
        }),
        ...(data.rpLastName !== undefined && {
          rpLastName: data.rpLastName || null,
        }),
        ...(data.teamName !== undefined && { teamName: data.teamName || null }),
      },
    });

    if (user.discordId) {
      await this.discord.syncMemberProfile({
        discordId: user.discordId,
        minecraftUsername: user.minecraftUsername ?? 'Joueur',
        grade: player.grade,
        faction: player.faction,
        teamName: player.teamName,
        rpFirstName: player.rpFirstName,
        rpLastName: player.rpLastName,
      });
    }

    return {
      success: true,
      rpFirstName: player.rpFirstName,
      rpLastName: player.rpLastName,
      teamName: player.teamName,
      discordSynced: !!user.discordId,
    };
  }

  async updateRpIdentityByDiscordId(
    discordId: string,
    data: { rpFirstName?: string; rpLastName?: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { discordId },
      include: { player: true },
    });
    if (!user?.player) {
      throw new NotFoundException("Compte non lié — utilise /link d'abord");
    }
    return this.updateRpIdentity(user.id, data);
  }

  async listPendingReports() {
    return this.prisma.personnelReport.findMany({
      where: { status: PersonnelReportStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            minecraftUsername: true,
            player: {
              select: { grade: true, rpFirstName: true, rpLastName: true },
            },
          },
        },
      },
    });
  }
}
