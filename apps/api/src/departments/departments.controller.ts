import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';

@Controller('departments')
export class DepartmentsController {
  constructor(private departments: DepartmentsService) {}

  @Get()
  findAll(@Query('faction') faction?: string) {
    return this.departments.findAll(faction);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const department = await this.departments.findOne(slug);
    if (!department) throw new NotFoundException('Departement introuvable');
    return department;
  }
}
