import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  findAll(type?: string) {
    return this.prisma.galleryAsset.findMany({
      where: type ? { type } : undefined,
      orderBy: { date: 'desc' },
    });
  }
}
