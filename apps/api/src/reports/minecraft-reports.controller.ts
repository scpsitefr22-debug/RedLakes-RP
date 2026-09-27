import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../sync/api-key.guard';
import { ReportsService } from './reports.service';
import { CreateMinecraftReportDto } from './dto/create-personnel-report.dto';

/**
 * Première écriture Minecraft → CORE (§31 du cahier Minecraft). Déclaré
 * dans ReportsModule plutôt que SyncModule : Reports importe déjà Sync
 * (DiscordService), l'inverse créerait un cycle. Même clé serveur que
 * GET /sync/minecraft/:uuid.
 */
@Controller('sync/minecraft')
@UseGuards(ApiKeyGuard)
export class MinecraftReportsController {
  constructor(private reports: ReportsService) {}

  @Post(':uuid/reports')
  create(@Param('uuid') uuid: string, @Body() dto: CreateMinecraftReportDto) {
    return this.reports.createFromMinecraft(uuid, dto);
  }
}
