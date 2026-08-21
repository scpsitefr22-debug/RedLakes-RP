import { Injectable, NotFoundException } from '@nestjs/common';
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

  async update(
    id: string,
    dto: UpdateNewsArticleDto,
    editorId?: string,
    editorLabel?: string,
  ) {
    const before = await this.prisma.newsArticle.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Article introuvable');

    await this.prisma.newsRevision.create({
      data: {
        newsArticleId: before.id,
        title: before.title,
        excerpt: before.excerpt,
        date: before.date,
        category: before.category,
        image: before.image,
        featured: before.featured,
        editedById: editorId,
        editedByLabel: editorLabel,
      },
    });

    return this.prisma.newsArticle.update({
      where: { id },
      data: { ...dto, date: dto.date ? new Date(dto.date) : undefined },
    });
  }

  /** Historique des révisions d'un article — la plus récente d'abord */
  async listRevisions(newsArticleId: string) {
    const article = await this.prisma.newsArticle.findUnique({
      where: { id: newsArticleId },
      select: { id: true },
    });
    if (!article) throw new NotFoundException('Article introuvable');

    return this.prisma.newsRevision.findMany({
      where: { newsArticleId },
      orderBy: { createdAt: 'desc' },
    });
  }

  remove(id: string) {
    return this.prisma.newsArticle.delete({ where: { id } });
  }
}
