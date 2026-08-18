import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ScpClass } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScpObjectDto, UpdateScpObjectDto } from './dto/scp-object.dto';
import {
  filterByDepartment,
  isVisibleToDepartment,
  redactAddendums,
} from '../common/department-visibility';

@Injectable()
export class ScpService {
  constructor(private prisma: PrismaService) {}

  async findAll(scpClass?: ScpClass, departmentId: string | null = null) {
    const objects = await this.prisma.scpObject.findMany({
      where: scpClass ? { class: scpClass } : undefined,
      orderBy: { number: 'asc' },
    });
    return filterByDepartment(objects, departmentId).map((scp) =>
      redactAddendums(scp, departmentId),
    );
  }

  findAllAdmin() {
    return this.prisma.scpObject.findMany({ orderBy: { number: 'asc' } });
  }

  async findOne(slug: string, departmentId: string | null = null) {
    const scp = await this.prisma.scpObject.findUnique({ where: { slug } });
    if (!scp) return null;
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
      },
    });
  }

  update(id: string, dto: UpdateScpObjectDto) {
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

  remove(id: string) {
    return this.prisma.scpObject.delete({ where: { id } });
  }
}
