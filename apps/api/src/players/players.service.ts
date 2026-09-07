import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Grade, Faction, Team, UserRole, StaffRank, PlatformEntityType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../platform/audit.service';
import { clearanceForGrade } from './grade-clearance';

const MAX_CHARACTERS_PER_ACCOUNT = 5;

@Injectable()
export class PlayersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

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

      staffRank: StaffRank | null;

      discordId: string | null;

      discordUsername: string | null;

      username: string | null;

      passwordHash: string | null;

      createdAt: Date;
    };
  }) {
    return {
      grade: player.grade,

      gradeInfo: player.gradeInfo,

      // Habilitation reelle du catalogue en priorite, regex en filet de
      // securite pour un grade texte libre hors catalogue (voir aussi
      // reports.service.ts, meme principe) — jamais recalculee/simulee
      // cote client (regle du spec CORE : clearance verifiee cote API).
      clearanceLevel: player.gradeInfo?.clearanceLevel ?? clearanceForGrade(player.grade),

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

        staffRank: player.user.staffRank,

        discordLinked: !!player.user.discordId,

        discordUsername: player.user.discordUsername,

        redlakesUsername: player.user.username,

        hasPassword: !!player.user.passwordHash,

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

            username: true,

            passwordHash: true,

            createdAt: true,

            role: true,

            staffRank: true,
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

            staffRank: true,

            discordId: true,

            discordUsername: true,

            username: true,

            passwordHash: true,

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

  /** Tous les personnages d'un compte, avec lequel est actuellement actif. */
  async listCharacters(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { activeCharacterId: true },
    });

    const characters = await this.prisma.player.findMany({
      where: { userId },
      include: { factionInfo: true, gradeInfo: true },
      orderBy: { createdAt: 'asc' },
    });

    return characters.map((c) => ({
      id: c.id,
      grade: c.grade,
      gradeInfo: c.gradeInfo,
      faction: c.faction,
      factionInfo: c.factionInfo,
      rpFirstName: c.rpFirstName,
      rpLastName: c.rpLastName,
      createdAt: c.createdAt,
      isActive: c.id === user?.activeCharacterId,
    }));
  }

  /** Nouveau personnage — demarre Civil, comme un compte flambant neuf. */
  async createCharacter(
    userId: string,
    data: { rpFirstName?: string; rpLastName?: string } = {},
  ) {
    const count = await this.prisma.player.count({ where: { userId } });
    if (count >= MAX_CHARACTERS_PER_ACCOUNT) {
      throw new BadRequestException(
        `Maximum ${MAX_CHARACTERS_PER_ACCOUNT} personnages par compte`,
      );
    }
    return this.prisma.player.create({
      data: {
        userId,
        grade: 'Civil',
        faction: 'Civil',
        rpFirstName: data.rpFirstName || null,
        rpLastName: data.rpLastName || null,
      },
    });
  }

  /** Change le personnage actif du compte (doit lui appartenir). */
  async activateCharacter(userId: string, characterId: string) {
    const character = await this.prisma.player.findUnique({
      where: { id: characterId },
    });
    if (!character || character.userId !== userId) {
      throw new NotFoundException('Personnage introuvable');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { activeCharacterId: characterId },
    });

    return this.getDashboard(userId);
  }

  /** Personnages RP d'un compte, vus par le staff via son pseudo Minecraft. */
  async listCharactersByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { minecraftUsername: username },
      select: { id: true, activeCharacterId: true },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const characters = await this.prisma.player.findMany({
      where: { userId: user.id },
      include: { factionInfo: true, gradeInfo: true },
      orderBy: { createdAt: 'asc' },
    });

    return characters.map((c) => ({
      id: c.id,
      grade: c.grade,
      gradeInfo: c.gradeInfo,
      faction: c.faction,
      factionInfo: c.factionInfo,
      rpFirstName: c.rpFirstName,
      rpLastName: c.rpLastName,
      createdAt: c.createdAt,
      active: c.id === user.activeCharacterId,
    }));
  }

  /**
   * Suppression d'un personnage RP — reservee au STAFF/ADMIN (voir @Roles
   * sur le controller), jamais en self-service pour un PLAYER : un joueur
   * simple ne doit pas pouvoir effacer son propre historique RP (sanctions,
   * affectations) sans validation. Si le personnage supprime etait le
   * personnage actif du compte, on bascule automatiquement sur un autre
   * personnage restant (sinon le compte se retrouve onboarded mais sans
   * personnage actif).
   */
  async deleteCharacter(
    username: string,
    characterId: string,
    actorId: string,
    actorLabel: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { minecraftUsername: username },
      select: { id: true, activeCharacterId: true },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    await this.deleteCharacterForUser(user.id, characterId, actorId, actorLabel, username);

    return this.listCharactersByUsername(username);
  }

  /**
   * Meme suppression que `deleteCharacter`, mais adressee par userId plutot
   * que par pseudo Minecraft — utilisee par le raccourci self-service
   * `DELETE /players/me/characters/:id` (toujours reserve STAFF/ADMIN via
   * @Roles sur le controller) pour qu'un membre du staff puisse nettoyer
   * ses PROPRES personnages de test directement depuis son tableau de bord,
   * sans passer par la fiche joueur d'un pseudo.
   */
  async deleteCharacterForUser(
    userId: string,
    characterId: string,
    actorId: string,
    actorLabel: string,
    actorUsername?: string,
  ) {
    const character = await this.prisma.player.findUnique({
      where: { id: characterId },
    });
    if (!character || character.userId !== userId) {
      throw new NotFoundException('Personnage introuvable');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { activeCharacterId: true },
    });

    if (character.id === user.activeCharacterId) {
      const fallback = await this.prisma.player.findFirst({
        where: { userId, id: { not: characterId } },
        orderBy: { createdAt: 'asc' },
      });
      await this.prisma.user.update({
        where: { id: userId },
        data: { activeCharacterId: fallback?.id ?? null },
      });
    }

    await this.prisma.player.delete({ where: { id: characterId } });

    await this.audit.log({
      entityType: PlatformEntityType.PLAYER,
      entityId: characterId,
      action: 'DELETED',
      actorId,
      actorLabel,
      summary: `Personnage RP supprimé : ${[character.rpFirstName, character.rpLastName].filter(Boolean).join(' ') || characterId}${actorUsername ? ` (${actorUsername})` : ''}`,
      metadata: {
        targetUserId: userId,
        grade: character.grade,
        faction: character.faction,
      },
    });
  }

  /**
   * Seul moyen de changer le role (PLAYER/STAFF/ADMIN) et le rang staff
   * (Surveillant/Officier/Coordinateur Général) d'un compte — jusqu'ici il
   * fallait modifier la base a la main, sans aucune trace. Reserve a
   * l'ADMIN (voir @Roles sur le controller), journalise via AuditService
   * pour laisser une trace de qui a promu/retrograde qui. Le rang n'a de
   * sens que pour STAFF — il est efface des qu'on quitte STAFF (ADMIN =
   * Fondateur, acces total ; PLAYER n'en a pas besoin).
   */
  async updateRole(
    username: string,
    role: UserRole,
    staffRank: StaffRank | undefined,
    actorId: string,
    actorLabel: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { minecraftUsername: username },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const previousRole = user.role;
    const previousRank = user.staffRank;
    const nextRank = role === UserRole.STAFF ? (staffRank ?? previousRank) : null;

    if (previousRole === role && previousRank === nextRank) {
      return {
        minecraftUsername: username,
        role,
        staffRank: nextRank,
        unchanged: true,
      };
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { role, staffRank: nextRank },
    });

    const roleLabel = (r: UserRole, rank: StaffRank | null) =>
      rank ? `${r} (${rank})` : r;

    await this.audit.log({
      entityType: PlatformEntityType.USER,
      entityId: user.id,
      action: 'ROLE_CHANGED',
      actorId,
      actorLabel,
      summary: `Rôle de ${username} changé : ${roleLabel(previousRole, previousRank)} → ${roleLabel(role, nextRank)}`,
      metadata: {
        previousRole,
        newRole: role,
        previousRank,
        newRank: nextRank,
        targetUsername: username,
      },
    });

    return {
      minecraftUsername: username,
      role: updated.role,
      staffRank: updated.staffRank,
      previousRole,
      previousRank,
      unchanged: false,
    };
  }
}
