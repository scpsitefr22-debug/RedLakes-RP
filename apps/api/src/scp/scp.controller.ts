import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ScpClass, UserRole } from '@prisma/client';
import { ScpService } from './scp.service';
import { CreateScpObjectDto, UpdateScpObjectDto } from './dto/scp-object.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('scp')
export class ScpController {
  constructor(private scp: ScpService) {}

  @Get()
  findAll(@Query('class') scpClass?: ScpClass) {
    return this.scp.findAll(scpClass);
  }

  @Get('by-id/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async findById(@Param('id') id: string) {
    const scp = await this.scp.findById(id);
    if (!scp) throw new NotFoundException('Objet SCP introuvable');
    return scp;
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const scp = await this.scp.findOne(slug);
    if (!scp) throw new NotFoundException('Objet SCP introuvable');
    return scp;
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  create(@Body() dto: CreateScpObjectDto) {
    return this.scp.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateScpObjectDto) {
    return this.scp.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.scp.remove(id);
  }
}
