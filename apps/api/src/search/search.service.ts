import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { PrismaService } from '../prisma/prisma.service';
import { LoreArticle } from '@prisma/client';

export interface SearchHit {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  href: string;
  score: number;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private client: Client | null = null;
  private index: string;
  private readonly logger = new Logger(SearchService.name);
  private enabled = false;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.index = config.get('ELASTICSEARCH_INDEX', 'redlakes');
  }

  async onModuleInit() {
    const url = this.config.get('ELASTICSEARCH_URL');
    if (!url) return;

    try {
      this.client = new Client({ node: url });
      await this.client.ping();
      this.enabled = true;
      await this.ensureIndex();
      await this.reindexAll();
      this.logger.log('Elasticsearch connecté');
    } catch {
      this.logger.warn('Elasticsearch indisponible — recherche fallback SQL');
    }
  }

  private async ensureIndex() {
    if (!this.client) return;
    const exists = await this.client.indices.exists({ index: this.index });
    if (!exists) {
      await this.client.indices.create({
        index: this.index,
        settings: { number_of_shards: 1, number_of_replicas: 0 },
        mappings: {
          properties: {
            type: { type: 'keyword' },
            title: { type: 'text', analyzer: 'french' },
            excerpt: { type: 'text', analyzer: 'french' },
            content: { type: 'text', analyzer: 'french' },
            href: { type: 'keyword' },
            tags: { type: 'keyword' },
          },
        },
      });
    }
  }

  async indexLore(article: LoreArticle) {
    if (!this.client || !this.enabled) return;
    await this.client.index({
      index: this.index,
      id: `lore-${article.id}`,
      document: {
        type: 'lore',
        title: article.title,
        excerpt: article.excerpt ?? '',
        content: article.content,
        href: `/lore/${article.slug}`,
        tags: article.tags,
      },
    });
  }

  async removeLore(id: string) {
    if (!this.client || !this.enabled) return;
    try {
      await this.client.delete({ index: this.index, id: `lore-${id}` });
    } catch {
      /* ignore */
    }
  }

  async reindexAll() {
    if (!this.client || !this.enabled) return;
    const articles = await this.prisma.loreArticle.findMany({
      where: { status: 'PUBLISHED' },
    });
    for (const article of articles) {
      await this.indexLore(article);
    }
  }

  async search(query: string, limit = 20): Promise<SearchHit[]> {
    if (!query.trim()) return [];

    if (this.client && this.enabled) {
      try {
        const result = await this.client.search({
          index: this.index,
          query: {
            multi_match: {
              query,
              fields: ['title^3', 'excerpt^2', 'content', 'tags'],
              fuzziness: 'AUTO',
            },
          },
          size: limit,
        });
        return result.hits.hits.map((hit) => {
          const src = hit._source as Record<string, string>;
          return {
            id: hit._id ?? '',
            type: src.type,
            title: src.title,
            excerpt: src.excerpt,
            href: src.href,
            score: hit._score ?? 0,
          };
        });
      } catch {
        this.logger.warn('Recherche ES échouée, fallback SQL');
      }
    }

    return this.fallbackSearch(query, limit);
  }

  private async fallbackSearch(
    query: string,
    limit: number,
  ): Promise<SearchHit[]> {
    const articles = await this.prisma.loreArticle.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
    });

    return articles.map((a) => ({
      id: a.id,
      type: 'lore',
      title: a.title,
      excerpt: a.excerpt ?? a.content.slice(0, 120),
      href: `/lore/${a.slug}`,
      score: 1,
    }));
  }
}
