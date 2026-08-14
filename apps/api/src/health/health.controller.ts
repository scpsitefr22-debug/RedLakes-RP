import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const startedAt = process.env.API_STARTED_AT ?? new Date().toISOString();
    let database: 'up' | 'down' = 'down';
    let databaseLatencyMs: number | null = null;

    const t0 = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'up';
      databaseLatencyMs = Date.now() - t0;
    } catch {
      database = 'down';
    }

    const status = database === 'up' ? 'ok' : 'degraded';

    return {
      status,
      service: 'redlakes-api',
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
      startedAt,
      checks: {
        database,
        databaseLatencyMs,
      },
      links: {
        site: process.env.WEB_URL ?? 'http://localhost:3000',
        api: '/api',
      },
    };
  }
}
