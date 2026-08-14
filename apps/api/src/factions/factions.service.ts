import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FactionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.faction.findMany({
      where: { playable: true },
      include: { departments: true },
      orderBy: { name: 'asc' },
    });
  }

  findOne(slug: string) {
    return this.prisma.faction.findUnique({
      where: { slug },
      include: { departments: true },
    });
  }
}
