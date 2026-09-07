import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StaffRank, UserRole } from '@prisma/client';
import { FactionRelationsService } from './faction-relations.service';
import {
  SetFactionRelationDto,
  UpdateFactionRelationDto,
} from './dto/faction-relation.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinRank } from '../auth/rank.decorator';

@Controller('faction-relations')
export class FactionRelationsController {
  constructor(private relations: FactionRelationsService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.relations.findAll();
  }

  @Get('faction/:factionId')
  @UseGuards(AuthGuard)
  findForFaction(@Param('factionId') factionId: string) {
    return this.relations.findForFaction(factionId);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  set(@Body() dto: SetFactionRelationDto) {
    return this.relations.set(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  update(@Param('id') id: string, @Body() dto: UpdateFactionRelationDto) {
    return this.relations.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.relations.remove(id);
  }
}
