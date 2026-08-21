import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { StaffRank, UserRole } from '@prisma/client';
import { SanctionsService } from './sanctions.service';
import { CreateSanctionDto, UpdateSanctionDto } from './dto/sanction.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinRank } from '../auth/rank.decorator';

@Controller('sanctions')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.STAFF, UserRole.ADMIN)
export class SanctionsController {
  constructor(private sanctions: SanctionsService) {}

  @Get('player/:playerId')
  findForPlayer(@Param('playerId') playerId: string) {
    return this.sanctions.findForPlayer(playerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const sanction = await this.sanctions.findOne(id);
    if (!sanction) throw new NotFoundException('Sanction introuvable');
    return sanction;
  }

  @Post()
  @MinRank(StaffRank.OFFICIER)
  create(
    @Body() dto: CreateSanctionDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.sanctions.create(dto, req.user.id);
  }

  @Patch(':id')
  @MinRank(StaffRank.OFFICIER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSanctionDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.sanctions.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.sanctions.remove(id);
  }
}
