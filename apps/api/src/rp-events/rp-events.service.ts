import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AuditAction,
  PlatformEntityType,
  Prisma,
  RpEventStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../platform/audit.service';
import { NotificationsService } from '../platform/notifications.service';
import {
  CreateRpEventAssignmentDto,
  CreateRpEventDto,
  UpdateRpEventDto,
} from './dto/rp-event.dto';

const ASSIGNMENT_INCLUDE = {
  player: {
    select: {
      id: true,
      userId: true,
      rpFirstName: true,
      rpLastName: true,
      grade: true,
      user: { select: { minecraftUsername: true, username: true } },
    },
  },
  department: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.RpEventAssignmentInclude;

const EVENT_INCLUDE = {
  faction: { select: { id: true, slug: true, name: true } },
  assignments: { include: ASSIGNMENT_INCLUDE, orderBy: { createdAt: 'asc' } },
} satisfies Prisma.RpEventInclude;

/** Statuts dans lesquels la composition peut encore changer. */
const OPEN_STATUSES: RpEventStatus[] = [
  RpEventStatus.PLANNED,
  RpEventStatus.ACTIVE,
];

const STATUS_ORDER: Record<RpEventStatus, number> = {
  [RpEventStatus.ACTIVE]: 0,
  [RpEventStatus.PLANNED]: 1,
  [RpEventStatus.CLOSED]: 2,
  [RpEventStatus.CANCELLED]: 3,
};

export interface Actor {
  id?: string;
  label: string;
}

function rpName(p: { rpFirstName: string | null; rpLastName: string | null }) {
  return (
    [p.rpFirstName, p.rpLastName].filter(Boolean).join(' ') ||
    'Personnage sans nom'
  );
}

/**
 * Opérations RP en direct. Une affectation est une couche TEMPORAIRE posée
 * sur un personnage pour la durée d'une opération : ce service ne modifie
 * jamais Player.gradeId / factionId / teamId (grade permanent ≠ rôle
 * d'opération). À la clôture, la couche disparaît d'elle-même puisque la
 * session Minecraft ne renvoie que les opérations ACTIVE.
 */
@Injectable()
export class RpEventsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  async findAll(status?: RpEventStatus) {
    const events = await this.prisma.rpEvent.findMany({
      where: status ? { status } : undefined,
      include: {
        faction: { select: { id: true, slug: true, name: true } },
        _count: { select: { assignments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    // En cours d'abord, puis planifiées, puis l'historique.
    return events.sort(
      (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
    );
  }

  async findOne(id: string) {
    const event = await this.prisma.rpEvent.findUnique({
      where: { id },
      include: EVENT_INCLUDE,
    });
    if (!event) throw new NotFoundException('Opération introuvable');
    return event;
  }

  /** Personnages affectables : ceux de la faction de l'opération, personnages actifs en premier. */
  async findCandidates(id: string) {
    const event = await this.findOne(id);
    const players = await this.prisma.player.findMany({
      where: event.factionId ? { factionId: event.factionId } : undefined,
      select: {
        id: true,
        rpFirstName: true,
        rpLastName: true,
        grade: true,
        activeForUser: { select: { id: true } },
        user: { select: { minecraftUsername: true, username: true } },
        gradeInfo: {
          select: { departmentRef: { select: { id: true, name: true } } },
        },
      },
      take: 300,
    });

    return players
      .map((p) => ({
        id: p.id,
        rpName: rpName(p),
        grade: p.grade,
        department: p.gradeInfo?.departmentRef ?? null,
        minecraftUsername: p.user.minecraftUsername,
        username: p.user.username,
        isActiveCharacter: p.activeForUser !== null,
      }))
      .sort((a, b) =>
        a.isActiveCharacter === b.isActiveCharacter
          ? a.rpName.localeCompare(b.rpName, 'fr')
          : a.isActiveCharacter
            ? -1
            : 1,
      );
  }

  /** Affectation en cours (opération ACTIVE) du personnage actif d'un compte. */
  async findActiveForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { activeCharacterId: true },
    });
    if (!user?.activeCharacterId) return null;
    return this.findActiveAssignment(user.activeCharacterId);
  }

  findActiveAssignment(playerId: string) {
    return this.prisma.rpEventAssignment.findFirst({
      where: { playerId, event: { status: RpEventStatus.ACTIVE } },
      include: {
        event: {
          select: { id: true, title: true, briefing: true, startedAt: true },
        },
        department: { select: { id: true, slug: true, name: true } },
      },
    });
  }

  async create(dto: CreateRpEventDto, actor: Actor) {
    if (dto.factionId) {
      const faction = await this.prisma.faction.findUnique({
        where: { id: dto.factionId },
      });
      if (!faction) throw new BadRequestException('Faction introuvable');
    }
    const event = await this.prisma.rpEvent.create({
      data: {
        title: dto.title.trim(),
        briefing: dto.briefing?.trim() || null,
        factionId: dto.factionId || null,
        createdById: actor.id,
        createdByLabel: actor.label,
      },
      include: EVENT_INCLUDE,
    });
    await this.log(
      event.id,
      AuditAction.CREATED,
      actor,
      `Opération créée : ${event.title}`,
    );
    return event;
  }

  async update(id: string, dto: UpdateRpEventDto, actor: Actor) {
    const event = await this.findOne(id);
    this.assertOpen(event.status);
    const updated = await this.prisma.rpEvent.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        briefing:
          dto.briefing === undefined ? undefined : dto.briefing.trim() || null,
      },
      include: EVENT_INCLUDE,
    });
    await this.log(
      id,
      AuditAction.UPDATED,
      actor,
      `Opération modifiée : ${updated.title}`,
    );
    return updated;
  }

  async addAssignment(
    id: string,
    dto: CreateRpEventAssignmentDto,
    actor: Actor,
  ) {
    const event = await this.findOne(id);
    this.assertOpen(event.status);

    const player = await this.prisma.player.findUnique({
      where: { id: dto.playerId },
      select: {
        id: true,
        userId: true,
        factionId: true,
        rpFirstName: true,
        rpLastName: true,
      },
    });
    if (!player) throw new BadRequestException('Personnage introuvable');
    if (event.factionId && player.factionId !== event.factionId) {
      throw new BadRequestException(
        `Ce personnage n'appartient pas à la faction de l'opération (${event.faction?.name ?? '?'})`,
      );
    }
    if (dto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!department) throw new BadRequestException('Département introuvable');
    }
    if (event.status === RpEventStatus.ACTIVE) {
      await this.assertNotInOtherActiveEvent([player.id], id);
    }

    try {
      const assignment = await this.prisma.rpEventAssignment.create({
        data: {
          eventId: id,
          playerId: player.id,
          roleLabel: dto.roleLabel.trim(),
          departmentId: dto.departmentId || null,
          sector: dto.sector?.trim() || null,
          equipment: dto.equipment?.trim() || null,
          instruction: dto.instruction?.trim() || null,
        },
        include: ASSIGNMENT_INCLUDE,
      });
      await this.log(
        id,
        AuditAction.UPDATED,
        actor,
        `Affectation : ${rpName(player)} → ${assignment.roleLabel}`,
      );
      if (event.status === RpEventStatus.ACTIVE) {
        await this.notifyAssigned(event.id, event.title, [assignment]);
      }
      return assignment;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          'Ce personnage est déjà affecté à cette opération',
        );
      }
      throw e;
    }
  }

  async removeAssignment(id: string, assignmentId: string, actor: Actor) {
    const event = await this.findOne(id);
    this.assertOpen(event.status);
    const assignment = event.assignments.find((a) => a.id === assignmentId);
    if (!assignment) throw new NotFoundException('Affectation introuvable');

    await this.prisma.rpEventAssignment.delete({ where: { id: assignmentId } });
    await this.log(
      id,
      AuditAction.UPDATED,
      actor,
      `Affectation retirée : ${rpName(assignment.player)}`,
    );
    if (event.status === RpEventStatus.ACTIVE) {
      await this.notifications.notify({
        userId: assignment.player.userId,
        title: `Fin d'affectation — ${event.title}`,
        body: 'Vous avez été retiré de cette opération. Reprenez votre poste habituel.',
        entityType: PlatformEntityType.RP_EVENT,
        entityId: event.id,
      });
    }
    return { deleted: true };
  }

  async start(id: string, actor: Actor) {
    const event = await this.findOne(id);
    if (event.status !== RpEventStatus.PLANNED) {
      throw new BadRequestException(
        'Seule une opération planifiée peut être lancée',
      );
    }
    if (event.assignments.length === 0) {
      throw new BadRequestException(
        "Affectez au moins un personnage avant de lancer l'opération",
      );
    }
    await this.assertNotInOtherActiveEvent(
      event.assignments.map((a) => a.playerId),
      id,
    );

    const started = await this.prisma.rpEvent.update({
      where: { id },
      data: { status: RpEventStatus.ACTIVE, startedAt: new Date() },
      include: EVENT_INCLUDE,
    });
    await this.log(
      id,
      AuditAction.STATUS_CHANGED,
      actor,
      `Opération lancée : ${started.title} (${started.assignments.length} affectés)`,
    );
    await this.notifyAssigned(started.id, started.title, started.assignments);
    return started;
  }

  async close(id: string, actor: Actor) {
    const event = await this.findOne(id);
    if (event.status !== RpEventStatus.ACTIVE) {
      throw new BadRequestException(
        'Seule une opération en cours peut être clôturée',
      );
    }
    const closed = await this.prisma.rpEvent.update({
      where: { id },
      data: {
        status: RpEventStatus.CLOSED,
        endedAt: new Date(),
        closedByLabel: actor.label,
      },
      include: EVENT_INCLUDE,
    });
    await this.log(
      id,
      AuditAction.STATUS_CHANGED,
      actor,
      `Opération clôturée : ${closed.title}`,
    );
    await this.notifications.notifyMany(
      [...new Set(closed.assignments.map((a) => a.player.userId))],
      {
        title: `Opération terminée — ${closed.title}`,
        body: 'Les affectations temporaires sont levées. Reprenez votre poste habituel.',
        entityType: PlatformEntityType.RP_EVENT,
        entityId: closed.id,
      },
    );
    return closed;
  }

  async cancel(id: string, actor: Actor) {
    const event = await this.findOne(id);
    if (event.status !== RpEventStatus.PLANNED) {
      throw new BadRequestException(
        'Seule une opération planifiée peut être annulée',
      );
    }
    const cancelled = await this.prisma.rpEvent.update({
      where: { id },
      data: { status: RpEventStatus.CANCELLED, closedByLabel: actor.label },
      include: EVENT_INCLUDE,
    });
    await this.log(
      id,
      AuditAction.STATUS_CHANGED,
      actor,
      `Opération annulée : ${cancelled.title}`,
    );
    return cancelled;
  }

  async remove(id: string, actor: Actor) {
    const event = await this.findOne(id);
    if (event.status === RpEventStatus.ACTIVE) {
      throw new BadRequestException(
        "Clôturez l'opération avant de la supprimer",
      );
    }
    await this.prisma.rpEvent.delete({ where: { id } });
    await this.log(
      id,
      AuditAction.DELETED,
      actor,
      `Opération supprimée : ${event.title}`,
    );
    return { deleted: true };
  }

  private assertOpen(status: RpEventStatus) {
    if (!OPEN_STATUSES.includes(status)) {
      throw new BadRequestException(
        'Cette opération est terminée et ne peut plus être modifiée',
      );
    }
  }

  /** Un personnage ne peut tenir qu'une seule affectation active à la fois. */
  private async assertNotInOtherActiveEvent(
    playerIds: string[],
    eventId: string,
  ) {
    const clash = await this.prisma.rpEventAssignment.findFirst({
      where: {
        playerId: { in: playerIds },
        eventId: { not: eventId },
        event: { status: RpEventStatus.ACTIVE },
      },
      include: {
        player: { select: { rpFirstName: true, rpLastName: true } },
        event: { select: { title: true } },
      },
    });
    if (clash) {
      throw new ConflictException(
        `${rpName(clash.player)} est déjà affecté à l'opération en cours « ${clash.event.title} »`,
      );
    }
  }

  private async notifyAssigned(
    eventId: string,
    title: string,
    assignments: {
      roleLabel: string;
      sector: string | null;
      player: { userId: string };
    }[],
  ) {
    for (const a of assignments) {
      await this.notifications.notify({
        userId: a.player.userId,
        title: `Affectation — ${title}`,
        body: a.sector ? `${a.roleLabel} · Secteur : ${a.sector}` : a.roleLabel,
        entityType: PlatformEntityType.RP_EVENT,
        entityId: eventId,
      });
    }
  }

  private log(
    entityId: string,
    action: AuditAction,
    actor: Actor,
    summary: string,
  ) {
    return this.audit.log({
      entityType: PlatformEntityType.RP_EVENT,
      entityId,
      action,
      actorId: actor.id,
      actorLabel: actor.label,
      summary,
    });
  }
}
