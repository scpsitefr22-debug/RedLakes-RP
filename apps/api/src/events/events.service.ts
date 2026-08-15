import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameEventDto, UpdateGameEventDto } from './dto/game-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.gameEvent.findMany({ orderBy: { date: 'desc' } });
  }

  findOne(slug: string) {
    return this.prisma.gameEvent.findUnique({ where: { slug } });
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
