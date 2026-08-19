import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameEventDto, UpdateGameEventDto } from './dto/game-event.dto';
import {
  filterByDepartment,
  isVisibleToDepartment,
} from '../common/department-visibility';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

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
    const event = await this.prisma.gameEvent.findUnique({ where: { slug } });
    if (!event) return null;
    if (!isVisibleToDepartment(event.restrictedDepartmentIds, departmentId)) {
      throw new NotFoundException('Accès restreint à un autre département');
    }
    return event;
  }

  findById(id: string) {
    return this.prisma.gameEvent.findUnique({ where: { id } });
  }

  create(dto: CreateGameEventDto) {
    return this.prisma.gameEvent.create({
      data: { ...dto, date: new Date(dto.date) },
    });
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
