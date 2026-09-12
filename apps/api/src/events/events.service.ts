import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassifiedDocumentStatus, ScpProposalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameEventDto, UpdateGameEventDto } from './dto/game-event.dto';
import {
  filterByClearance,
  filterByDepartment,
  isVisibleToDepartment,
  meetsClearance,
} from '../common/department-visibility';
import { DiscordService } from '../sync/discord.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private discord: DiscordService,
  ) {}

  async findAll(departmentId: string | null = null, clearanceLevel = 1) {
    const events = await this.prisma.gameEvent.findMany({
      orderBy: { date: 'desc' },
    });
    return filterByClearance(
      filterByDepartment(events, departmentId),
      clearanceLevel,
    );
  }

  findAllAdmin() {
    return this.prisma.gameEvent.findMany({ orderBy: { date: 'desc' } });
  }

  async findOne(
    slug: string,
    departmentId: string | null = null,
    clearanceLevel = 1,
  ) {
    const event = await this.prisma.gameEvent.findUnique({
      where: { slug },
      include: {
        faction: { select: { id: true, slug: true, name: true, color: true } },
        linkedDocuments: {
          where: { status: ClassifiedDocumentStatus.PUBLISHED },
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            restrictedDepartmentIds: true,
            minClearanceLevel: true,
            linkedScpObjects: {
              where: { status: ScpProposalStatus.APPROVED },
              select: {
                id: true,
                slug: true,
                number: true,
                name: true,
                class: true,
                threatLevel: true,
                restrictedDepartmentIds: true,
                minClearanceLevel: true,
              },
            },
          },
        },
      },
    });
    if (!event) return null;
    // null plutot qu'une exception distincte — le controleur renvoie le meme
    // "Événement introuvable" que pour un slug reellement inexistant, jamais
    // de "trouve mais interdit" distinguable (department-visibility.spec.ts).
    if (
      !isVisibleToDepartment(event.restrictedDepartmentIds, departmentId) ||
      !meetsClearance(event.minClearanceLevel, clearanceLevel)
    ) {
      return null;
    }

    const visibleDocuments = filterByClearance(
      filterByDepartment(event.linkedDocuments, departmentId),
      clearanceLevel,
    );
    const linkedScpBySlug = new Map<
      string,
      (typeof visibleDocuments)[number]['linkedScpObjects'][number]
    >();
    for (const doc of visibleDocuments) {
      for (const scp of filterByClearance(
        filterByDepartment(doc.linkedScpObjects, departmentId),
        clearanceLevel,
      )) {
        linkedScpBySlug.set(scp.slug, scp);
      }
    }

    return {
      ...event,
      linkedDocuments: visibleDocuments.map(({ linkedScpObjects: _s, ...doc }) => doc),
      /// SCP lies a cet evenement via ses documents classifies — meme
      /// composition transitive que ScpService.findOne (miroir exact,
      /// meme relation ClassifiedDocument<->ScpObject du Lot 40).
      linkedScpObjects: [...linkedScpBySlug.values()],
    };
  }

  findById(id: string) {
    return this.prisma.gameEvent.findUnique({ where: { id } });
  }

  async create(dto: CreateGameEventDto) {
    const event = await this.prisma.gameEvent.create({
      data: { ...dto, date: new Date(dto.date) },
    });

    if ((dto.restrictedDepartmentIds ?? []).length === 0) {
      void this.discord.notifyEventPublished({
        title: event.title,
        type: event.type,
        slug: event.slug,
      });
    }

    return event;
  }

  async update(
    id: string,
    dto: UpdateGameEventDto,
    editorId?: string,
    editorLabel?: string,
  ) {
    const before = await this.prisma.gameEvent.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Événement introuvable');

    await this.prisma.gameEventRevision.create({
      data: {
        gameEventId: before.id,
        title: before.title,
        date: before.date,
        type: before.type,
        description: before.description,
        casualties: before.casualties,
        outcome: before.outcome,
        editedById: editorId,
        editedByLabel: editorLabel,
      },
    });

    return this.prisma.gameEvent.update({
      where: { id },
      data: { ...dto, date: dto.date ? new Date(dto.date) : undefined },
    });
  }

  /** Historique des révisions d'un évènement — le plus récent d'abord */
  async listRevisions(gameEventId: string) {
    const event = await this.prisma.gameEvent.findUnique({
      where: { id: gameEventId },
      select: { id: true },
    });
    if (!event) throw new NotFoundException('Événement introuvable');

    return this.prisma.gameEventRevision.findMany({
      where: { gameEventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  remove(id: string) {
    return this.prisma.gameEvent.delete({ where: { id } });
  }
}
