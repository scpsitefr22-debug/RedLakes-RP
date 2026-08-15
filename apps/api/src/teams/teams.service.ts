import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto, UpdateTeamDto } from './dto/team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  findAll(departmentSlug?: string) {
    return this.prisma.team.findMany({
      where: departmentSlug
        ? { department: { slug: departmentSlug } }
        : undefined,
      include: { department: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  findOne(slug: string) {
    return this.prisma.team.findUnique({
      where: { slug },
      include: { department: true },
    });
  }

  findById(id: string) {
    return this.prisma.team.findUnique({
      where: { id },
      include: { department: true },
    });
  }

  create(dto: CreateTeamDto) {
    return this.prisma.team.create({
      data: { ...dto, composition: dto.composition ?? [] },
    });
  }

  update(id: string, dto: UpdateTeamDto) {
    return this.prisma.team.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.team.delete({ where: { id } });
  }
}
