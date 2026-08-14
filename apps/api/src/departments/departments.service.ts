import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  findAll(factionSlug?: string) {
    return this.prisma.department.findMany({
      where: factionSlug ? { faction: { slug: factionSlug } } : undefined,
      include: { faction: true },
      orderBy: { name: 'asc' },
    });
  }

  findOne(slug: string) {
    return this.prisma.department.findUnique({
      where: { slug },
      include: { faction: true },
    });
  }
}
