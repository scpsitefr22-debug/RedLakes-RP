import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  findAll(factionSlug?: string) {
    return this.prisma.department.findMany({
      where: factionSlug ? { faction: { slug: factionSlug } } : undefined,
      include: {
        faction: true,
        _count: { select: { grades: true, teams: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  findOne(slug: string) {
    return this.prisma.department.findUnique({
      where: { slug },
      include: {
        faction: true,
        grades: { orderBy: { pay: 'desc' } },
        teams: { orderBy: [{ category: 'asc' }, { name: 'asc' }] },
      },
    });
  }

  findById(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      include: { faction: true },
    });
  }

  create(dto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: {
        ...dto,
        utilities: dto.utilities ?? [],
        objectives: dto.objectives ?? [],
        deputyIds: dto.deputyIds ?? [],
      },
    });
  }

  update(id: string, dto: UpdateDepartmentDto) {
    return this.prisma.department.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }
}
