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

  async update(
    id: string,
    dto: UpdateLoreDto,
    editorId?: string,
    editorLabel?: string,
  ) {
    const before = await this.prisma.loreArticle.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Article introuvable');

    await this.prisma.loreRevision.create({
      data: {
        loreArticleId: before.id,
        title: before.title,
        excerpt: before.excerpt,
        content: before.content,
        category: before.category,
        status: before.status,
        restrictedDepartmentIds: before.restrictedDepartmentIds,
        featured: before.featured,
        coverImage: before.coverImage,
        tags: before.tags,
        editedById: editorId,
        editedByLabel: editorLabel,
      },
    });

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

  /** Historique des révisions d'un article de lore — le plus récent d'abord */
  async listRevisions(loreArticleId: string) {
    const article = await this.prisma.loreArticle.findUnique({
      where: { id: loreArticleId },
      select: { id: true },
    });
    if (!article) throw new NotFoundException('Article introuvable');

    return this.prisma.loreRevision.findMany({
      where: { loreArticleId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    await this.search.removeLore(id);
    return this.prisma.loreArticle.delete({ where: { id } });
  }
}
