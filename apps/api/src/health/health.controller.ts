import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Duree de mise en cache du check DB. Render appelle ce endpoint en continu
// (healthCheckPath) pour surveiller le service — sans cache, ca revenait a
// interroger Neon 24h/24 et empechait tout scale-to-zero du compute, meme
// hors trafic reel (cause principale du quota Neon epuise en sept. 2026).
const DB_CHECK_CACHE_MS = 60_000;

@Controller('health')
export class HealthController {
  private cachedDatabase: 'up' | 'down' = 'down';
  private cachedLatencyMs: number | null = null;
  private cachedAt = 0;

  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const startedAt = process.env.API_STARTED_AT ?? new Date().toISOString();

    if (Date.now() - this.cachedAt > DB_CHECK_CACHE_MS) {
      const t0 = Date.now();
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        this.cachedDatabase = 'up';
        this.cachedLatencyMs = Date.now() - t0;
      } catch {
        this.cachedDatabase = 'down';
        this.cachedLatencyMs = null;
      }
      this.cachedAt = Date.now();
    }

    const database = this.cachedDatabase;
    const databaseLatencyMs = this.cachedLatencyMs;
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
