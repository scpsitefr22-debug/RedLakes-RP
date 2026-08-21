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
import { NewsService } from './news.service';
import {
  CreateNewsArticleDto,
  UpdateNewsArticleDto,
} from './dto/news-article.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinRank } from '../auth/rank.decorator';

@Controller('news')
export class NewsController {
  constructor(private news: NewsService) {}

  @Get()
  findAll() {
    return this.news.findAll();
  }

  @Get('by-id/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  async findById(@Param('id') id: string) {
    const article = await this.news.findById(id);
    if (!article) throw new NotFoundException('Article introuvable');
    return article;
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const article = await this.news.findOne(slug);
    if (!article) throw new NotFoundException('Article introuvable');
    return article;
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  create(@Body() dto: CreateNewsArticleDto) {
    return this.news.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @MinRank(StaffRank.COORDINATEUR_GENERAL)
  update(
    @Req() req: Request & { user: { id: string; minecraftUsername?: string; discordUsername?: string } },
    @Param('id') id: string,
    @Body() dto: UpdateNewsArticleDto,
  ) {
    const editorLabel = req.user.discordUsername ?? req.user.minecraftUsername ?? 'Staff';
    return this.news.update(id, dto, req.user.id, editorLabel);
  }

  @Get(':id/revisions')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  listRevisions(@Param('id') id: string) {
    return this.news.listRevisions(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.news.remove(id);
  }
}
