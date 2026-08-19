import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { TransmissionService } from './transmission.service';
import { ApiKeyGuard } from './api-key.guard';
import { SyncRoleDto } from './dto/sync-role.dto';
import { DiscordLinkDto } from './dto/discord-link.dto';
import { DiscordUnlinkDto } from './dto/discord-unlink.dto';
import { SyncDiscordGradeDto } from './dto/sync-discord-grade.dto';
import { SyncDiscordStaffDto } from './dto/sync-discord-staff.dto';
import { DiscordEventDto } from './dto/discord-event.dto';
import { UpdateDiscordIdentityDto } from './dto/update-discord-identity.dto';

/** Endpoints appelés par le plugin Minecraft et le bot Discord */
@Controller('sync')
@UseGuards(ApiKeyGuard)
export class SyncController {
  constructor(
    private sync: SyncService,
    private transmissions: TransmissionService,
  ) {}

  @Post('role')
  syncRole(@Body() dto: SyncRoleDto) {
    return this.sync.syncRole(dto);
  }

  @Post('discord/link')
  linkDiscord(@Body() dto: DiscordLinkDto) {
    return this.sync.linkDiscord(dto);
  }

  @Post('discord/unlink')
  unlinkDiscord(@Body() dto: DiscordUnlinkDto) {
    return this.sync.unlinkByDiscordId(dto.discordId);
  }

  @Get('discord/:discordId')
  profileByDiscord(@Param('discordId') discordId: string) {
    return this.sync.getProfileByDiscordId(discordId);
  }

  /** Grade mis a jour depuis Discord (role RP attribue sur le serveur) */
  @Post('discord/grade')
  syncGradeFromDiscord(@Body() dto: SyncDiscordGradeDto) {
    return this.sync.syncGradeFromDiscord(dto);
  }

  /** Rôle STAFF depuis Discord (rôle @Staff détecté sur le serveur) */
  @Post('discord/staff-role')
  syncStaffRoleFromDiscord(@Body() dto: SyncDiscordStaffDto) {
    return this.sync.syncStaffRoleFromDiscord(dto);
  }

  /** Identité RP depuis le bot (/identite) */
  @Patch('discord/identity')
  updateDiscordIdentity(@Body() dto: UpdateDiscordIdentityDto) {
    return this.sync.updateRpIdentityByDiscordId(dto.discordId, {
      rpFirstName: dto.rpFirstName,
      rpLastName: dto.rpLastName,
    });
  }

  /** Évènement Discord relayé par le bot → transmission RP stockée */
  @Post('discord/event')
  ingestDiscordEvent(@Body() dto: DiscordEventDto) {
    return this.transmissions.ingest(dto);
  }

  /** Rapports RP en attente (commande bot /rapports) */
  @Get('reports/pending')
  listPendingReports() {
    return this.sync.listPendingReports();
  }
}
