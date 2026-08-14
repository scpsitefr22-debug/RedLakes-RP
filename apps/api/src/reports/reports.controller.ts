import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { ReportsService } from './reports.service';
import { CreatePersonnelReportDto } from './dto/create-personnel-report.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { ReviewReportDto } from './dto/review-report.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: CreatePersonnelReportDto,
  ) {
    return this.reports.create(req.user.id, dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  mine(
    @Req() req: Request & { user: { id: string } },
    @Query() query: ListReportsQueryDto,
  ) {
    return this.reports.findMine(req.user.id, query);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  one(
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string; role: UserRole } },
  ) {
    return this.reports.findOneForUser(id, req.user.id, req.user.role);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  pending(
    @Req() req: Request & { user: { role: UserRole } },
    @Query() query: ListReportsQueryDto,
  ) {
    return this.reports.findAllPending(req.user.role, query);
  }

  @Patch(':id/review')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  review(
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string; role: UserRole } },
    @Body() body: ReviewReportDto,
  ) {
    return this.reports.review(id, req.user.id, body);
  }
}
