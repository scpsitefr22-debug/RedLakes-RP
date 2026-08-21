import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StaffRank, UserRole } from '@prisma/client';
import { MapService } from './map.service';
import {
  CreateMapLocationDto,
  UpdateMapLocationDto,
} from './dto/map-location.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinRank } from '../auth/rank.decorator';

@Controller('map')
export class MapController {
  constructor(private map: MapService) {}

  @Get()
  findAll() {
    return this.map.findAll();
  }

  @Get('by-id/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async findById(@Param('id') id: string) {
    const location = await this.map.findById(id);
    if (!location) throw new NotFoundException('Emplacement introuvable');
    return location;
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const location = await this.map.findOne(slug);
    if (!location) throw new NotFoundException('Emplacement introuvable');
    return location;
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  create(@Body() dto: CreateMapLocationDto) {
    return this.map.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  update(@Param('id') id: string, @Body() dto: UpdateMapLocationDto) {
    return this.map.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.map.remove(id);
  }
}
