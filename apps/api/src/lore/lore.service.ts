import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoreDto, UpdateLoreDto } from './dto/lore.dto';
import { LoreStatus } from '@prisma/client';
import { SearchService } from '../search/search.service';

@Injectable()
export class LoreService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => SearchService))
    private search: SearchService,
  ) {}

  async findPublished(clearance = 1) {
    return this.prisma.loreArticle.findMany({
      where: {
        status: LoreStatus.PUBLISHED,
        clearance: { lte: clearance },
      },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: { select: { minecraftUsername: true } },
      },
    });
  }

  async findBySlug(slug: string, clearance = 1) {
    const article = await this.prisma.loreArticle.findUnique({
      where: { slug },
      include: {
        author: { select: { minecraftUsername: true } },
      },
    });
    if (!article || article.status !== LoreStatus.PUBLISHED) {
      throw new NotFoundException('Article introuvable');
    }
    if (article.clearance > clearance) {
      throw new NotFoundException('Habilitation insuffisante');
    }
    return article;
  }

  async findAllAdmin() {
    return this.prisma.loreArticle.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        author: { select: { minecraftUsername: true } },
      },
    });
  }

  async create(authorId: string, dto: CreateLoreDto) {
    const article = await this.prisma.loreArticle.create({
      data: {
        ...dto,
        authorId,
        publishedAt: dto.status === LoreStatus.PUBLISHED ? new Date() : null,
      },
    });
    if (article.status === LoreStatus.PUBLISHED) {
      await this.search.indexLore(article);
    }
    return article;
  }

  async update(id: string, dto: UpdateLoreDto) {
    const article = await this.prisma.loreArticle.update({
      where: { id },
      data: {
        ...dto,
        publishedAt:
          dto.status === LoreStatus.PUBLISHED ? new Date() : undefined,
      },
    });
    if (article.status === LoreStatus.PUBLISHED) {
      await this.search.indexLore(article);
    } else {
      await this.search.removeLore(article.id);
    }
    return article;
  }

  async remove(id: string) {
    await this.search.removeLore(id);
    return this.prisma.loreArticle.delete({ where: { id } });
  }
}
