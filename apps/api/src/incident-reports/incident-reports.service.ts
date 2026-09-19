import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateIncidentReportDto,
  UpdateIncidentReportDto,
} from './dto/incident-report.dto';
import {
  filterByClearance,
  filterByDepartment,
  isVisibleToDepartment,
  meetsClearance,
} from '../common/department-visibility';

@Injectable()
export class IncidentReportsService {
  constructor(private prisma: PrismaService) {}

  async findPublished(departmentId: string | null = null, clearanceLevel = 1) {
    const reports = await this.prisma.incidentReport.findMany({
      orderBy: { incidentAt: 'desc' },
    });
    return filterByClearance(filterByDepartment(reports, departmentId), clearanceLevel);
  }

  async findBySlug(slug: string, departmentId: string | null = null, clearanceLevel = 1) {
    const report = await this.prisma.incidentReport.findUnique({ where: { slug } });
    if (
      !report ||
      !isVisibleToDepartment(report.restrictedDepartmentIds, departmentId) ||
      !meetsClearance(report.minClearanceLevel, clearanceLevel)
    ) {
      // Meme message qu'un slug reellement inexistant — jamais de "trouve
      // mais interdit" distinguable (voir department-visibility.spec.ts).
      throw new NotFoundException('Rapport introuvable');
    }
    return report;
  }

  findAllAdmin() {
    return this.prisma.incidentReport.findMany({
      orderBy: { incidentAt: 'desc' },
      include: { author: { select: { minecraftUsername: true } } },
    });
  }

  findById(id: string) {
    return this.prisma.incidentReport.findUnique({ where: { id } });
  }

  create(authorId: string, dto: CreateIncidentReportDto) {
    return this.prisma.incidentReport.create({
      data: {
        ...dto,
        incidentAt: new Date(dto.incidentAt),
        personnelRows: (dto.personnelRows ?? []) as unknown as Prisma.InputJsonValue,
        equipmentRows: (dto.equipmentRows ?? []) as unknown as Prisma.InputJsonValue,
        restrictedDepartmentIds: dto.restrictedDepartmentIds ?? [],
        authorId,
      },
    });
  }

  async update(id: string, dto: UpdateIncidentReportDto) {
    const existing = await this.prisma.incidentReport.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Rapport introuvable');

    const { incidentAt, ...rest } = dto;
    return this.prisma.incidentReport.update({
      where: { id },
      data: {
        ...rest,
        incidentAt: incidentAt ? new Date(incidentAt) : undefined,
        personnelRows: dto.personnelRows as unknown as Prisma.InputJsonValue | undefined,
        equipmentRows: dto.equipmentRows as unknown as Prisma.InputJsonValue | undefined,
      },
    });
  }

  remove(id: string) {
    return this.prisma.incidentReport.delete({ where: { id } });
  }
}
