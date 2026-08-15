import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateNewsArticleDto,
  UpdateNewsArticleDto,
} from './dto/news-article.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.newsArticle.findMany({ orderBy: { date: 'desc' } });
  }

  findOne(slug: string) {
    return this.prisma.newsArticle.findUnique({ where: { slug } });
  }

  findById(id: string) {
    return this.prisma.newsArticle.findUnique({ where: { id } });
  }

  create(dto: CreateNewsArticleDto) {
    return this.prisma.newsArticle.create({
      data: { ...dto, date: new Date(dto.date) },
    });
  }

  update(id: string, dto: UpdateNewsArticleDto) {
    return this.prisma.newsArticle.update({
      where: { id },
      data: { ...dto, date: dto.date ? new Date(dto.date) : undefined },
    });
  }

  remove(id: string) {
    return this.prisma.newsArticle.delete({ where: { id } });
  }
}
