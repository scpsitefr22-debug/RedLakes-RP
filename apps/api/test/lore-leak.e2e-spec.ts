import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { LoreCategory, LoreStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { authHeader, setupLeakFixtures, teardownLeakFixtures } from './support/leak-fixtures';

/**
 * Anti-leak e2e pour les articles de Lore — meme scope et meme discipline
 * que classified-documents-leak.e2e-spec.ts (voir son en-tete).
 */
describe('Lore articles — anti-leak (e2e)', () => {
  jest.setTimeout(30_000);

  let app: INestApplication<App>;
  let prisma: PrismaService;

  const RUN_ID = `e2e${Date.now()}lore`;

  let tokenNoCharacter: string;
  let tokenDeptALow: string;
  let tokenDeptAHigh: string;
  let tokenDeptBHigh: string;
  let createdUserIds: string[];

  let articlePublicSlug: string;
  let articleDeptASlug: string;
  let articleDeptAHighSlug: string;
  let articleDraftSlug: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    const fixtures = await setupLeakFixtures(prisma, RUN_ID);
    tokenNoCharacter = fixtures.tokenNoCharacter;
    tokenDeptALow = fixtures.tokenDeptALow;
    tokenDeptAHigh = fixtures.tokenDeptAHigh;
    tokenDeptBHigh = fixtures.tokenDeptBHigh;
    createdUserIds = fixtures.createdUserIds;

    const base = { content: 'Contenu de test.', category: LoreCategory.MONDE };

    const articlePublic = await prisma.loreArticle.create({
      data: {
        ...base,
        slug: `${RUN_ID}-article-public`,
        title: `${RUN_ID} Article public`,
        status: LoreStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
    const articleDeptA = await prisma.loreArticle.create({
      data: {
        ...base,
        slug: `${RUN_ID}-article-dept-a`,
        title: `${RUN_ID} Article dept A`,
        status: LoreStatus.PUBLISHED,
        publishedAt: new Date(),
        restrictedDepartmentIds: [fixtures.deptA.id],
      },
    });
    const articleDeptAHigh = await prisma.loreArticle.create({
      data: {
        ...base,
        slug: `${RUN_ID}-article-dept-a-high`,
        title: `${RUN_ID} Article dept A high clearance`,
        status: LoreStatus.PUBLISHED,
        publishedAt: new Date(),
        restrictedDepartmentIds: [fixtures.deptA.id],
        minClearanceLevel: 5,
      },
    });
    const articleDraft = await prisma.loreArticle.create({
      data: {
        ...base,
        slug: `${RUN_ID}-article-draft`,
        title: `${RUN_ID} Article draft`,
        status: LoreStatus.DRAFT,
      },
    });

    articlePublicSlug = articlePublic.slug;
    articleDeptASlug = articleDeptA.slug;
    articleDeptAHighSlug = articleDeptAHigh.slug;
    articleDraftSlug = articleDraft.slug;
  }, 30_000);

  afterAll(async () => {
    if (!prisma) return;
    await prisma.loreArticle.deleteMany({ where: { slug: { startsWith: RUN_ID } } });
    await teardownLeakFixtures(prisma, RUN_ID, createdUserIds);
    await app.close();
  }, 30_000);

  const slugsOf = (body: { slug: string }[]) => body.map((a) => a.slug);
  const auth = authHeader;

  describe('GET /lore (list)', () => {
    it('shows an anonymous visitor only the published public article', async () => {
      const res = await request(app.getHttpServer()).get('/api/lore');
      const slugs = slugsOf(res.body);
      expect(slugs).toContain(articlePublicSlug);
      expect(slugs).not.toContain(articleDeptASlug);
      expect(slugs).not.toContain(articleDeptAHighSlug);
      expect(slugs).not.toContain(articleDraftSlug);
    });

    it('a department A member sees the department-restricted article', async () => {
      const res = await request(app.getHttpServer()).get('/api/lore').set(auth(tokenDeptALow));
      expect(slugsOf(res.body)).toContain(articleDeptASlug);
    });

    it('a department A member with insufficient clearance never sees the high-clearance article', async () => {
      const res = await request(app.getHttpServer()).get('/api/lore').set(auth(tokenDeptALow));
      expect(slugsOf(res.body)).not.toContain(articleDeptAHighSlug);
    });

    it('a department A member with sufficient clearance sees the high-clearance article', async () => {
      const res = await request(app.getHttpServer()).get('/api/lore').set(auth(tokenDeptAHigh));
      expect(slugsOf(res.body)).toContain(articleDeptAHighSlug);
    });

    it('high clearance in the WRONG department never substitutes for department membership', async () => {
      const res = await request(app.getHttpServer()).get('/api/lore').set(auth(tokenDeptBHigh));
      expect(slugsOf(res.body)).not.toContain(articleDeptASlug);
    });

    it('never lists an unpublished draft to anyone', async () => {
      const res = await request(app.getHttpServer()).get('/api/lore').set(auth(tokenDeptAHigh));
      expect(slugsOf(res.body)).not.toContain(articleDraftSlug);
    });
  });

  describe('GET /lore/:slug (direct URL access)', () => {
    it('serves the public article to anyone', async () => {
      await request(app.getHttpServer()).get(`/api/lore/${articlePublicSlug}`).expect(200);
    });

    it('a wrong-department direct hit is a 404, not a 403', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/lore/${articleDeptASlug}`)
        .set(auth(tokenNoCharacter));
      expect(res.status).toBe(404);
    });

    it('the "restricted" 404 is byte-for-byte the same as a genuinely missing slug', async () => {
      const restricted = await request(app.getHttpServer())
        .get(`/api/lore/${articleDeptASlug}`)
        .set(auth(tokenNoCharacter));
      const missing = await request(app.getHttpServer()).get(
        `/api/lore/${RUN_ID}-does-not-exist`,
      );
      expect(restricted.status).toBe(missing.status);
      expect(restricted.body.message).toBe(missing.body.message);
    });

    it('right department AND sufficient clearance serves the article', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/lore/${articleDeptAHighSlug}`)
        .set(auth(tokenDeptAHigh));
      expect(res.status).toBe(200);
      expect(res.body.slug).toBe(articleDeptAHighSlug);
    });

    it('a draft is never reachable by direct URL, even for a high-clearance department member', async () => {
      await request(app.getHttpServer())
        .get(`/api/lore/${articleDraftSlug}`)
        .set(auth(tokenDeptAHigh))
        .expect(404);
    });
  });
});
