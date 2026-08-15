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
import { UserRole } from '@prisma/client';
import { GradesService } from './grades.service';
import { CreateGradeDto, UpdateGradeDto } from './dto/grade.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('grades')
export class GradesController {
  constructor(private grades: GradesService) {}

  @Get()
  findAll(@Query('branch') branch?: string) {
    return this.grades.findAll(branch);
  }

  @Get('by-id/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async findById(@Param('id') id: string) {
    const grade = await this.grades.findById(id);
    if (!grade) throw new NotFoundException('Grade introuvable');
    return grade;
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const grade = await this.grades.findOne(slug);
    if (!grade) throw new NotFoundException('Grade introuvable');
    return grade;
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  create(@Body() dto: CreateGradeDto) {
    return this.grades.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateGradeDto) {
    return this.grades.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.grades.remove(id);
  }
}
