import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  findAll(branch?: string) {
    return this.prisma.grade.findMany({
      where: branch ? { branch } : undefined,
      orderBy: [{ branch: 'asc' }, { clearance: 'desc' }, { name: 'asc' }],
    });
  }

  findOne(slug: string) {
    return this.prisma.grade.findUnique({ where: { slug } });
  }
}
