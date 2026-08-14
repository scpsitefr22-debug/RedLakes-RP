import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { ApplicationsService } from './applications.service';
import {
  CreateApplicationDto,
  ReviewApplicationDto,
} from './dto/create-application.dto';
import { ListApplicationsQueryDto } from './dto/list-applications-query.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('applications')
export class ApplicationsController {
  constructor(private applications: ApplicationsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applications.create(req.user.id, dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  myApplications(
    @Req() req: Request & { user: { id: string } },
    @Query() query: ListApplicationsQueryDto,
  ) {
    return this.applications.findByUser(req.user.id, query);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  one(
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string; role: UserRole } },
  ) {
    return this.applications.findOneForUser(id, req.user.id, req.user.role);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  findAll(
    @Req() req: Request & { user: { role: UserRole } },
    @Query() query: ListApplicationsQueryDto,
  ) {
    return this.applications.findAll(req.user.role, query);
  }

  @Patch(':id/review')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  review(
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string } },
    @Body() body: ReviewApplicationDto,
  ) {
    return this.applications.review(
      id,
      req.user.id,
      body.status,
      body.staffNote,
    );
  }
}
