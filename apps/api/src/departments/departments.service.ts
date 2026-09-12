import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

/** Champs internes (direction/budget) — mêmes exclusions que FactionsService pour un visiteur non connecté. */
function stripInternalFields<T extends { leadership: string[]; chefId: string | null; deputyIds: string[]; budget: number }>(
  dept: T,
) {
  const { leadership: _l, chefId: _c, deputyIds: _d, budget: _b, ...pub } = dept;
  return pub;
}

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(factionSlug?: string, authenticated = false) {
    const departments = await this.prisma.department.findMany({
      where: factionSlug ? { faction: { slug: factionSlug } } : undefined,
      include: {
        faction: true,
        _count: { select: { grades: true, teams: true } },
      },
      orderBy: { name: 'asc' },
    });
    return authenticated ? departments : departments.map(stripInternalFields);
  }

  async findOne(slug: string, authenticated = false) {
    const department = await this.prisma.department.findUnique({
      where: { slug },
      include: {
        faction: true,
        grades: { orderBy: { pay: 'desc' } },
        teams: { orderBy: [{ category: 'asc' }, { name: 'asc' }] },
      },
    });
    if (!department) return null;
    return authenticated ? department : stripInternalFields(department);
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
