import { Injectable } from '@nestjs/common';
import { Prisma, ScpClass } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScpObjectDto, UpdateScpObjectDto } from './dto/scp-object.dto';

@Injectable()
export class ScpService {
  constructor(private prisma: PrismaService) {}

  findAll(scpClass?: ScpClass) {
    return this.prisma.scpObject.findMany({
      where: scpClass ? { class: scpClass } : undefined,
      orderBy: { number: 'asc' },
    });
  }

  findOne(slug: string) {
    return this.prisma.scpObject.findUnique({ where: { slug } });
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
