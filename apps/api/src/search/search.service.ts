import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { PrismaService } from '../prisma/prisma.service';
import { LoreArticle } from '@prisma/client';
import { filterByDepartment } from '../common/department-visibility';

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

  /**
   * departmentId : departement du demandeur (null = anonyme/public
   * uniquement). Applique au chemin SQL, le seul reellement actif tant
   * qu'Elasticsearch n'est pas configure ici. Le chemin ES n'indexe pas
   * encore restrictedDepartmentIds (seul LoreArticle y est indexe, sans ce
   * champ) — non filtre pour l'instant, a traiter si ES est active un jour.
   */
  async search(
    query: string,
    limit = 20,
    departmentId: string | null = null,
  ): Promise<SearchHit[]> {
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

    return this.fallbackSearch(query, limit, departmentId);
  }

  /**
   * SQL de repli — le seul chemin reellement actif tant qu'Elasticsearch
   * n'est pas configure dans cet environnement (voir onModuleInit). Couvre
   * les 8 types deja references par lib/search.ts cote web (autrefois des
   * tableaux statiques figes) : lore, scp, faction, departement, personnage,
   * evenement, actualite, lieu — chacun desormais un modele Prisma reel.
   * Indexation Elasticsearch volontairement non etendue a ces 7 types tant
   * qu'ES n'est pas actif ici pour verifier le comportement.
   */
  private async fallbackSearch(
    query: string,
    limit: number,
    departmentId: string | null = null,
  ): Promise<SearchHit[]> {
    const insensitive = { contains: query, mode: 'insensitive' as const };

    const [
      articlesRaw,
      scpObjectsRaw,
      charactersRaw,
      eventsRaw,
      news,
      locations,
      factions,
      departments,
    ] = await Promise.all([
      this.prisma.loreArticle.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: insensitive },
            { excerpt: insensitive },
            { content: insensitive },
          ],
        },
        take: limit,
      }),
      this.prisma.scpObject.findMany({
        where: {
          OR: [
            { number: insensitive },
            { name: insensitive },
            { description: insensitive },
          ],
        },
        take: limit,
      }),
      this.prisma.character.findMany({
        where: {
          OR: [
            { name: insensitive },
            { title: insensitive },
            { biography: insensitive },
          ],
        },
        take: limit,
      }),
      this.prisma.gameEvent.findMany({
        where: { OR: [{ title: insensitive }, { description: insensitive }] },
        take: limit,
      }),
      this.prisma.newsArticle.findMany({
        where: { OR: [{ title: insensitive }, { excerpt: insensitive }] },
        take: limit,
      }),
      this.prisma.mapLocation.findMany({
        where: { OR: [{ name: insensitive }, { description: insensitive }] },
        take: limit,
      }),
      this.prisma.faction.findMany({
        where: { OR: [{ name: insensitive }, { description: insensitive }] },
        take: limit,
      }),
      this.prisma.department.findMany({
        where: { name: insensitive },
        take: limit,
      }),
    ]);

    const articles = filterByDepartment(articlesRaw, departmentId);
    const scpObjects = filterByDepartment(scpObjectsRaw, departmentId);
    const characters = filterByDepartment(charactersRaw, departmentId);
    const events = filterByDepartment(eventsRaw, departmentId);

    const hits: SearchHit[] = [
      ...articles.map((a) => ({
        id: a.id,
        type: 'lore',
        title: a.title,
        excerpt: a.excerpt ?? a.content.slice(0, 120),
        href: `/lore/${a.slug}`,
        score: 1,
      })),
      ...scpObjects.map((s) => ({
        id: s.id,
        type: 'scp',
        title: `${s.number} — ${s.name}`,
        excerpt: s.description.slice(0, 120),
        href: `/wiki/${s.slug}`,
        score: 1,
      })),
      ...characters.map((c) => ({
        id: c.id,
        type: 'character',
        title: c.name,
        excerpt: c.title,
        href: `/personnages/${c.slug}`,
        score: 1,
      })),
      ...events.map((e) => ({
        id: e.id,
        type: 'event',
        title: e.title,
        excerpt: e.description.slice(0, 120),
        href: `/evenements/${e.slug}`,
        score: 1,
      })),
      ...news.map((n) => ({
        id: n.id,
        type: 'news',
        title: n.title,
        excerpt: n.excerpt.slice(0, 120),
        href: `/actualites/${n.slug}`,
        score: 1,
      })),
      ...locations.map((l) => ({
        id: l.id,
        type: 'location',
        title: l.name,
        excerpt: l.description.slice(0, 120),
        href: `/carte#${l.slug}`,
        score: 1,
      })),
      ...factions.map((f) => ({
        id: f.id,
        type: 'faction',
        title: f.name,
        excerpt: f.tagline ?? f.description ?? '',
        href: `/factions/${f.slug}`,
        score: 1,
      })),
      ...departments.map((d) => ({
        id: d.id,
        type: 'department',
        title: d.name,
        excerpt: d.utilities.slice(0, 3).join(', '),
        href: `/departements/${d.slug}`,
        score: 1,
      })),
    ];

    return hits.slice(0, limit);
  }
}
