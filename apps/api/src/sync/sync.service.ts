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
import { SyncDiscordStaffDto } from './dto/sync-discord-staff.dto';
import {
  AssignmentEntityType,
  PersonnelReportStatus,
  PlatformEntityType,
  UserRole,
} from '@prisma/client';
import { GradesService } from '../grades/grades.service';
import { FactionsService } from '../factions/factions.service';
import { AuditService } from '../platform/audit.service';

@Injectable()
export class SyncService {
  constructor(
    private prisma: PrismaService,
    private discord: DiscordService,
    private grades: GradesService,
    private factions: FactionsService,
    private audit: AuditService,
  ) {}

  /** Resout le nom d'un grade en texte libre vers le catalogue Grade. */
  private async resolveGrade(name: string) {
    const grade = await this.grades.findByName(name);
    return {
      gradeId: grade?.id ?? null,
      departmentRefId: grade?.departmentRefId ?? null,
    };
  }

  /** Resout un nom de faction en texte libre vers le catalogue Faction. */
  private async resolveFactionId(name: string | undefined) {
    const faction = await this.factions.findByName(name ?? 'Civil');
    return faction?.id ?? null;
  }

  private async departmentRefIdForGrade(
    gradeId: string | null,
  ): Promise<string | null> {
    if (!gradeId) return null;
    const grade = await this.prisma.grade.findUnique({
      where: { id: gradeId },
      select: { departmentRefId: true },
    });
    return grade?.departmentRefId ?? null;
  }

  /**
   * Journalise un changement de faction/departement dans PlayerAssignment
   * (historique de carriere) — ferme l'affectation precedente (endedAt) et
   * ouvre la nouvelle. No-op si rien n'a change.
   */
  private async recordAssignmentChange(
    playerId: string,
    entityType: AssignmentEntityType,
    previousEntityId: string | null,
    newEntityId: string | null,
  ) {
    if (previousEntityId === newEntityId) return;
    const now = new Date();
    if (previousEntityId) {
      await this.prisma.playerAssignment.updateMany({
        where: { playerId, entityType, entityId: previousEntityId, endedAt: null },
        data: { endedAt: now },
      });
    }
    if (newEntityId) {
      await this.prisma.playerAssignment.create({
        data: { playerId, entityType, entityId: newEntityId, startedAt: now },
      });
    }
  }

  async syncRole(dto: SyncRoleDto) {
    const username = dto.minecraftUsername.trim();
    const uuid =
      dto.minecraftUuid ??
      `offline-${username.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
    const resolved = await this.resolveGrade(dto.grade);
    const factionId = await this.resolveFactionId(dto.faction);

    // Capture l'etat AVANT ecriture — la creation ci-dessous peut creer le
    // personnage avec le grade/faction deja resolus, ce qui rendrait toute
    // comparaison "avant/apres" faite apres coup invalide pour un nouveau
    // joueur (il n'y aurait alors jamais d'affectation initiale journalisee).
    const existingUser = await this.prisma.user.findUnique({
      where: { minecraftUuid: uuid },
      include: { activeCharacter: true },
    });
    const previousFactionIdSnapshot =
      existingUser?.activeCharacter?.factionId ?? null;
    const previousDepartmentRefIdSnapshot = await this.departmentRefIdForGrade(
      existingUser?.activeCharacter?.gradeId ?? null,
    );

    const user = await this.prisma.user.upsert({
      where: { minecraftUuid: uuid },
      update: { minecraftUsername: username },
      create: {
        minecraftUuid: uuid,
        minecraftUsername: username,
        avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(username)}/64`,
      },
      include: { activeCharacter: true },
    });

    let player = user.activeCharacter;
    const previousGrade = player?.grade;

    if (!player) {
      player = await this.prisma.player.create({
        data: {
          userId: user.id,
          grade: dto.grade,
          gradeId: resolved.gradeId,
          faction: dto.faction ?? 'Civil',
          factionId,
          teamName: dto.teamName,
          rpFirstName: dto.rpFirstName,
          rpLastName: dto.rpLastName,
          playtime: dto.playtime ?? 0,
          roleUpdatedAt: new Date(),
        },
      });
      await this.prisma.user.update({
        where: { id: user.id },
        data: { activeCharacterId: player.id },
      });
    } else {
      player = await this.prisma.player.update({
        where: { id: player.id },
        data: {
          grade: dto.grade,
          gradeId: resolved.gradeId,
          ...(dto.faction !== undefined && { faction: dto.faction, factionId }),
          ...(dto.teamName !== undefined && { teamName: dto.teamName }),
          ...(dto.rpFirstName !== undefined && {
            rpFirstName: dto.rpFirstName,
          }),
          ...(dto.rpLastName !== undefined && { rpLastName: dto.rpLastName }),
          ...(dto.playtime !== undefined && { playtime: dto.playtime }),
          roleUpdatedAt: new Date(),
        },
      });
    }

    await this.recordAssignmentChange(
      player.id,
      AssignmentEntityType.FACTION,
      previousFactionIdSnapshot,
      player.factionId ?? null,
    );
    await this.recordAssignmentChange(
      player.id,
      AssignmentEntityType.DEPARTMENT,
      previousDepartmentRefIdSnapshot,
      resolved.departmentRefId,
    );

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
      include: { activeCharacter: true },
    });

    await this.prisma.linkCode.update({
      where: { id: link.id },
      data: { used: true },
    });

    // Pas d'appel à discord.syncMemberProfile() ici : ce endpoint n'est
    // jamais atteint que depuis le hub Discord (POST /sync/discord/link,
    // ApiKeyGuard), qui refait lui-même GET /sync/discord/:id + applique
    // le rôle/pseudo juste après cet appel. Écrire ici en plus dupliquait
    // la résolution rôle↔grade avec une implémentation indépendante
    // (discord-role-registry.ts) pouvant diverger de celle du bot.

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
      include: {
        activeCharacter: {
          include: {
            gradeInfo: { include: { departmentRef: true } },
            factionInfo: true,
          },
        },
      },
    });
    if (!user || !user.activeCharacter) {
      throw new NotFoundException('Aucun compte lié à ce Discord');
    }

    return {
      minecraftUsername: user.minecraftUsername,
      avatarUrl: user.avatarUrl,
      discordUsername: user.discordUsername,
      grade: user.activeCharacter.grade,
      gradeInfo: user.activeCharacter.gradeInfo,
      faction: user.activeCharacter.faction,
      factionInfo: user.activeCharacter.factionInfo,
      teamName: user.activeCharacter.teamName,
      rpFirstName: user.activeCharacter.rpFirstName,
      rpLastName: user.activeCharacter.rpLastName,
      playtime: user.activeCharacter.playtime,
      reputation: user.activeCharacter.reputation,
      sanctions: user.activeCharacter.sanctions,
      medals: user.activeCharacter.medals,
      roleUpdatedAt: user.activeCharacter.roleUpdatedAt,
      seniority: user.activeCharacter.seniority,
    };
  }

  /** Mise a jour du grade depuis Discord (role RP) — ne repousse pas vers Discord */
  async syncGradeFromDiscord(dto: SyncDiscordGradeDto) {
    const user = await this.prisma.user.findUnique({
      where: { discordId: dto.discordId },
      include: { activeCharacter: true },
    });

    if (!user?.activeCharacter) {
      throw new NotFoundException('Aucun compte lie a ce Discord');
    }

    const previousGrade = user.activeCharacter.grade;
    if (previousGrade === dto.grade) {
      return {
        success: true,
        unchanged: true,
        grade: dto.grade,
        previousGrade,
        minecraftUsername: user.minecraftUsername,
      };
    }

    const previousDepartmentRefId = await this.departmentRefIdForGrade(
      user.activeCharacter.gradeId,
    );
    const resolved = await this.resolveGrade(dto.grade);
    const player = await this.prisma.player.update({
      where: { id: user.activeCharacter.id },
      data: {
        grade: dto.grade,
        gradeId: resolved.gradeId,
        roleUpdatedAt: new Date(),
      },
    });

    await this.recordAssignmentChange(
      player.id,
      AssignmentEntityType.DEPARTMENT,
      previousDepartmentRefId,
      resolved.departmentRefId,
    );

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

  /**
   * Rôle STAFF depuis Discord (rôle @Staff détecté sur le serveur) —
   * promotion automatique uniquement (PLAYER -> STAFF). Ne redescend jamais
   * automatiquement quelqu'un (perte du rôle Discord = pas de perte du
   * site), et ne touche jamais ADMIN : ces deux cas restent décidés à la
   * main sur le site (voir PlayersService.updateRole), pour garder un vrai
   * contrôle et une trace claire sur les changements sensibles.
   */
  async syncStaffRoleFromDiscord(dto: SyncDiscordStaffDto) {
    const user = await this.prisma.user.findUnique({
      where: { discordId: dto.discordId },
    });
    if (!user) throw new NotFoundException('Aucun compte lié à ce Discord');

    if (!dto.hasStaffRole || user.role !== UserRole.PLAYER) {
      return { success: true, unchanged: true, role: user.role };
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.STAFF },
    });

    await this.audit.log({
      entityType: PlatformEntityType.USER,
      entityId: user.id,
      action: 'ROLE_CHANGED',
      actorLabel: 'Sync Discord (rôle Staff)',
      summary: `Rôle de ${user.minecraftUsername ?? user.discordUsername ?? user.id} changé automatiquement : PLAYER → STAFF (rôle Discord Staff détecté)`,
      metadata: { previousRole: 'PLAYER', newRole: 'STAFF', source: 'discord-role-sync' },
    });

    return {
      success: true,
      unchanged: false,
      role: updated.role,
      previousRole: UserRole.PLAYER,
      minecraftUsername: user.minecraftUsername,
    };
  }

  /**
   * Identité RP (prénom/nom) — site ou bot Discord.
   * syncDiscord=false quand l'appelant est le bot lui-même (il refait déjà
   * GET /sync/discord/:id + applique le rôle/pseudo juste après) — évite la
   * même double-écriture que linkDiscord(). Reste à true par défaut pour le
   * site, seul écrivain sur ce chemin.
   */
  async updateRpIdentity(
    userId: string,
    data: { rpFirstName?: string; rpLastName?: string; teamName?: string },
    options: { syncDiscord?: boolean } = {},
  ) {
    const { syncDiscord = true } = options;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { activeCharacter: true },
    });
    if (!user?.activeCharacter) {
      throw new NotFoundException('Profil joueur introuvable');
    }

    const player = await this.prisma.player.update({
      where: { id: user.activeCharacter.id },
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

    if (syncDiscord && user.discordId) {
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
      include: { activeCharacter: true },
    });
    if (!user?.activeCharacter) {
      throw new NotFoundException("Compte non lié — utilise /link d'abord");
    }
    // syncDiscord: false — le hub Discord (/identite) refait lui-même
    // GET /sync/discord/:id + applique le rôle/pseudo juste après cet appel.
    return this.updateRpIdentity(user.id, data, { syncDiscord: false });
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
            activeCharacter: {
              select: { grade: true, rpFirstName: true, rpLastName: true },
            },
          },
        },
      },
    });
  }
}
