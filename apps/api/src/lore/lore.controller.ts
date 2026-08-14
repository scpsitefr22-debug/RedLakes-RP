import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { LoreService } from './lore.service';
import { CreateLoreDto, UpdateLoreDto } from './dto/lore.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('lore')
export class LoreController {
  constructor(private lore: LoreService) {}

  @Get()
  findPublished(@Query('clearance') clearance?: string) {
    return this.lore.findPublished(clearance ? parseInt(clearance) : 1);
  }

  @Get('cms')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  findAllAdmin() {
    return this.lore.findAllAdmin();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string, @Query('clearance') clearance?: string) {
    return this.lore.findBySlug(slug, clearance ? parseInt(clearance) : 1);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  create(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: CreateLoreDto,
  ) {
    return this.lore.create(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateLoreDto) {
    return this.lore.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.lore.remove(id);
  }
}
