import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSystemStateDto } from './dto/update-system-state.dto';

const SINGLETON_ID = 'singleton';

@Injectable()
export class SystemService {
  constructor(private prisma: PrismaService) {}

  /** Source unique de l'état serveur — remplace siteConfig.ts (web) et SERVER_OPEN (bot). */
  getStatus() {
    return this.prisma.systemState.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID },
    });
  }

  updateStatus(dto: UpdateSystemStateDto) {
    return this.prisma.systemState.upsert({
      where: { id: SINGLETON_ID },
      update: dto,
      create: { id: SINGLETON_ID, ...dto },
    });
  }
}
