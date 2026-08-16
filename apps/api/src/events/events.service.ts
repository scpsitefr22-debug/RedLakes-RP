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

  update(id: string, dto: UpdateGameEventDto) {
    return this.prisma.gameEvent.update({
      where: { id },
      data: { ...dto, date: dto.date ? new Date(dto.date) : undefined },
    });
  }

  remove(id: string) {
    return this.prisma.gameEvent.delete({ where: { id } });
  }
}
