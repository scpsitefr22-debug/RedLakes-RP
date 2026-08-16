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
import {
  filterByDepartment,
  isVisibleToDepartment,
} from '../common/department-visibility';

@Injectable()
export class LoreService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => SearchService))
    private search: SearchService,
  ) {}

  async findPublished(departmentId: string | null = null) {
    const articles = await this.prisma.loreArticle.findMany({
      where: { status: LoreStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: { select: { minecraftUsername: true } },
      },
    });
    return filterByDepartment(articles, departmentId);
  }

  async findBySlug(slug: string, departmentId: string | null = null) {
    const article = await this.prisma.loreArticle.findUnique({
      where: { slug },
      include: {
        author: { select: { minecraftUsername: true } },
      },
    });
    if (!article || article.status !== LoreStatus.PUBLISHED) {
      throw new NotFoundException('Article introuvable');
    }
    if (!isVisibleToDepartment(article.restrictedDepartmentIds, departmentId)) {
      throw new NotFoundException('Accès restreint à un autre département');
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
