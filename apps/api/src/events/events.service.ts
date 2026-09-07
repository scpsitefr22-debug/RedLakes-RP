import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassifiedDocumentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameEventDto, UpdateGameEventDto } from './dto/game-event.dto';
import {
  filterByDepartment,
  isVisibleToDepartment,
} from '../common/department-visibility';
import { DiscordService } from '../sync/discord.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private discord: DiscordService,
  ) {}

  async findAll(departmentId: string | null = null) {
    const events = await this.prisma.gameEvent.findMany({
      orderBy: { date: 'desc' },
    });
    return filterByDepartment(events, departmentId);
  }

  findAllAdmin() {
    return this.prisma.gameEvent.findMany({ orderBy: { date: 'desc' } });
  }

  async findOne(slug: string, departmentId: string | null = null) {
    const event = await this.prisma.gameEvent.findUnique({
      where: { slug },
      include: {
        faction: { select: { id: true, slug: true, name: true, color: true } },
        linkedDocuments: {
          where: { status: ClassifiedDocumentStatus.PUBLISHED },
          select: { id: true, slug: true, title: true, excerpt: true, restrictedDepartmentIds: true },
        },
      },
    });
    if (!event) return null;
    if (!isVisibleToDepartment(event.restrictedDepartmentIds, departmentId)) {
      throw new NotFoundException('Accès restreint à un autre département');
    }
    return {
      ...event,
      linkedDocuments: filterByDepartment(event.linkedDocuments, departmentId),
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
