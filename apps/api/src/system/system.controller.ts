import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { SystemService } from './system.service';
import { UpdateSystemStateDto } from './dto/update-system-state.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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
  updateStatus(@Body() dto: UpdateSystemStateDto) {
    return this.system.updateStatus(dto);
  }
}
