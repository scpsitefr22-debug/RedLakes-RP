import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PlatformEntityType, Prisma, ScpClass, ScpProposalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScpObjectDto, UpdateScpObjectDto } from './dto/scp-object.dto';
import { ProposeScpDto } from './dto/propose-scp.dto';
import {
  filterByDepartment,
  isVisibleToDepartment,
  redactAddendums,
} from '../common/department-visibility';
import { AuditService } from '../platform/audit.service';
import { NotificationsService } from '../platform/notifications.service';

@Injectable()
export class ScpService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  async findAll(scpClass?: ScpClass, departmentId: string | null = null) {
    const objects = await this.prisma.scpObject.findMany({
      where: {
        status: ScpProposalStatus.APPROVED,
        ...(scpClass ? { class: scpClass } : {}),
      },
      orderBy: { number: 'asc' },
    });
    return filterByDepartment(objects, departmentId).map((scp) =>
      redactAddendums(scp, departmentId),
    );
  }

  findAllAdmin(status?: ScpProposalStatus) {
    return this.prisma.scpObject.findMany({
      where: status ? { status } : undefined,
      orderBy: { number: 'asc' },
      include: {
        submittedBy: {
          select: { minecraftUsername: true, discordUsername: true },
        },
      },
    });
  }

  async findOne(slug: string, departmentId: string | null = null) {
    const scp = await this.prisma.scpObject.findUnique({ where: { slug } });
    if (!scp || scp.status !== ScpProposalStatus.APPROVED) return null;
    if (!isVisibleToDepartment(scp.restrictedDepartmentIds, departmentId)) {
      throw new NotFoundException('Accès restreint à un autre département');
    }
    return redactAddendums(scp, departmentId);
  }

  findById(id: string) {
    return this.prisma.scpObject.findUnique({ where: { id } });
  }

  create(dto: CreateScpObjectDto) {
    return this.prisma.scpObject.create({
      data: {
        ...dto,
        incidents: (dto.incidents ?? []) as unknown as Prisma.InputJsonValue,
        tests: (dto.tests ?? []) as unknown as Prisma.InputJsonValue,
        addendums: (dto.addendums ?? []) as unknown as Prisma.InputJsonValue,
        status: ScpProposalStatus.APPROVED,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateScpObjectDto,
    editorId?: string,
    editorLabel?: string,
  ) {
    const before = await this.prisma.scpObject.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Objet SCP introuvable');

    await this.prisma.scpRevision.create({
      data: {
        scpObjectId: before.id,
        number: before.number,
        name: before.name,
        class: before.class,
        threatLevel: before.threatLevel,
        containment: before.containment,
        history: before.history,
        description: before.description,
        image: before.image,
        incidents: before.incidents as Prisma.InputJsonValue,
        tests: before.tests as Prisma.InputJsonValue,
        addendums: before.addendums as Prisma.InputJsonValue,
        containmentCost: before.containmentCost,
        personnelAssigned: before.personnelAssigned,
        breachCount: before.breachCount,
        editedById: editorId,
        editedByLabel: editorLabel,
      },
    });

    return this.prisma.scpObject.update({
      where: { id },
      data: {
        ...dto,
        incidents: dto.incidents as unknown as
          Prisma.InputJsonValue | undefined,
        tests: dto.tests as unknown as Prisma.InputJsonValue | undefined,
        addendums: dto.addendums as unknown as
          Prisma.InputJsonValue | undefined,
      },
    });
  }

  /** Historique des révisions d'une fiche — la plus récente d'abord */
  async listRevisions(scpObjectId: string) {
    const scp = await this.prisma.scpObject.findUnique({
      where: { id: scpObjectId },
      select: { id: true },
    });
    if (!scp) throw new NotFoundException('Objet SCP introuvable');

    return this.prisma.scpRevision.findMany({
      where: { scpObjectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  remove(id: string) {
    return this.prisma.scpObject.delete({ where: { id } });
  }

  async propose(userId: string, dto: ProposeScpDto) {
    const digits = dto.number.replace(/\D/g, '');
    if (!digits) {
      throw new ConflictException('Numéro SCP invalide.');
    }
    const slug = `scp-${digits}`;

    const existing = await this.prisma.scpObject.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Ce numéro SCP est déjà utilisé ou proposé.');
    }

    const proposal = await this.prisma.scpObject.create({
      data: {
        slug,
        number: `SCP-${digits}`,
        name: dto.name,
        class: dto.class,
        threatLevel: dto.threatLevel,
        containment: dto.containment,
        history: dto.history,
        description: dto.description,
        status: ScpProposalStatus.PENDING,
        submittedById: userId,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { minecraftUsername: true, discordUsername: true },
    });
    const actorLabel = user?.minecraftUsername ?? user?.discordUsername ?? 'Joueur';

    await this.audit.log({
      entityType: PlatformEntityType.SCP_OBJECT,
      entityId: proposal.id,
      action: 'CREATED',
      actorId: userId,
      actorLabel,
      summary: `Proposition de fiche ${proposal.number} déposée`,
      metadata: { class: proposal.class },
    });

    const staffIds = await this.notifications.findStaffUserIds();
    await this.notifications.notifyMany(staffIds, {
      title: 'Nouvelle proposition de fiche SCP',
      body: `${actorLabel} — ${proposal.number} : ${proposal.name}`,
      entityType: PlatformEntityType.SCP_OBJECT,
      entityId: proposal.id,
    });

    return proposal;
  }

  async review(
    id: string,
    reviewerId: string,
    status: 'APPROVED' | 'REJECTED',
    staffNote?: string,
  ) {
    const scp = await this.prisma.scpObject.findUnique({ where: { id } });
    if (!scp) throw new NotFoundException('Objet SCP introuvable');

    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },
      select: { minecraftUsername: true, discordUsername: true },
    });
    const reviewerLabel =
      reviewer?.minecraftUsername ?? reviewer?.discordUsername ?? 'Staff';

    const updated = await this.prisma.scpObject.update({
      where: { id },
      data: {
        status: status as ScpProposalStatus,
        staffNote,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
    });

    await this.audit.log({
      entityType: PlatformEntityType.SCP_OBJECT,
      entityId: id,
      action: status === 'APPROVED' ? 'REVIEWED' : 'STATUS_CHANGED',
      actorId: reviewerId,
      actorLabel: reviewerLabel,
      summary: `Fiche ${scp.number} ${status === 'APPROVED' ? 'approuvée' : 'refusée'}`,
      metadata: { staffNote, previousStatus: scp.status, newStatus: status },
    });

    if (scp.submittedById) {
      await this.notifications.notify({
        userId: scp.submittedById,
        title: status === 'APPROVED' ? 'Fiche SCP approuvée' : 'Fiche SCP refusée',
        body: `${scp.number} — ${scp.name}${staffNote ? ` — ${staffNote}` : ''}`,
        entityType: PlatformEntityType.SCP_OBJECT,
        entityId: id,
      });
    }

    return updated;
  }
}
