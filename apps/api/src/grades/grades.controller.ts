import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { GradesService } from './grades.service';

@Controller('grades')
export class GradesController {
  constructor(private grades: GradesService) {}

  @Get()
  findAll(@Query('branch') branch?: string) {
    return this.grades.findAll(branch);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const grade = await this.grades.findOne(slug);
    if (!grade) throw new NotFoundException('Grade introuvable');
    return grade;
  }
}
