import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMapLocationDto,
  UpdateMapLocationDto,
} from './dto/map-location.dto';

@Injectable()
export class MapService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.mapLocation.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(slug: string) {
    return this.prisma.mapLocation.findUnique({ where: { slug } });
  }

  findById(id: string) {
    return this.prisma.mapLocation.findUnique({ where: { id } });
  }

  create(dto: CreateMapLocationDto) {
    return this.prisma.mapLocation.create({ data: dto });
  }

  update(id: string, dto: UpdateMapLocationDto) {
    return this.prisma.mapLocation.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.mapLocation.delete({ where: { id } });
  }
}
