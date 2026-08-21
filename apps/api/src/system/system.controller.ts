import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { SystemService } from './system.service';
import { UpdateSystemStateDto } from './dto/update-system-state.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

type AuthedRequest = Request & {
  user: { id: string; minecraftUsername?: string; discordUsername?: string };
};

@Controller('system')
export class SystemController {
  constructor(private system: SystemService) {}

  @Get('status')
  getStatus() {
    return this.system.getStatus();
  }

  @Patch('status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Req() req: AuthedRequest, @Body() dto: UpdateSystemStateDto) {
    const actorLabel =
      req.user.discordUsername ?? req.user.minecraftUsername ?? 'Admin';
    return this.system.updateStatus(dto, req.user.id, actorLabel);
  }
}
