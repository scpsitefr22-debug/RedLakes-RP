import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { TransmissionsController } from './transmissions.controller';
import { TransmissionService } from './transmission.service';
import { DiscordService } from './discord.service';
import { ApiKeyGuard } from './api-key.guard';

@Module({
  controllers: [SyncController, TransmissionsController],
  providers: [SyncService, DiscordService, TransmissionService, ApiKeyGuard],
  exports: [SyncService, DiscordService, TransmissionService],
})
export class SyncModule {}
