import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ClassifiedDocumentStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Anti-leak e2e — couvre les scenarios explicitement nommes dans le spec
 * REDLAKES CORE (permissions/clearance) sur UN type de contenu (documents
 * classifies), pris comme reference car il expose deja les deux axes
 * (departement + habilitation). Premier lot d'une suite a etendre a
 * SCP/Lore/Personnages/Evenements/Recherche au meme endroit dans
 * department-visibility.ts — pas fait ici pour rester un lot verifiable
 * separement (voir memoire depth-over-breadth).
 *
 * Tourne contre la vraie DB de dev (Neon) comme le reste du projet — aucune
 * DB de test dediee. Toutes les fixtures sont prefixees par un RUN_ID unique
 * et entierement supprimees dans afterAll, meme discipline que les
 * verifications manuelles faites au fil de cette session.
 */
describe('Classified documents — anti-leak (e2e)', () => {
  jest.setTimeout(30_000);

  let app: INestApplication<App>;
  let prisma: PrismaService;

  const RUN_ID = `e2e${Date.now()}`;
  const createdUserIds: string[] = [];

  let deptA: { id: string };
  let deptB: { id: string };

  let tokenNoCharacter: string;
  let tokenDeptALow: string;
  let tokenDeptAHigh: string;
  let tokenDeptBHigh: string;

  let docPublicSlug: string;
  let docDeptASlug: string;
  let docDeptAHighSlug: string;
  let docDraftSlug: string;

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

    deptA = await prisma.department.create({
      data: { slug: `${RUN_ID}-dept-a`, name: `${RUN_ID} Dept A` },
    });
    deptB = await prisma.department.create({
      data: { slug: `${RUN_ID}-dept-b`, name: `${RUN_ID} Dept B` },
    });

    const gradeDeptALow = await prisma.grade.create({
      data: {
        slug: `${RUN_ID}-grade-a-low`,
        name: 'Test A Low',
        branch: 'Test',
        tier: 'Test',
        clearanceLevel: 1,
        departmentRefId: deptA.id,
      },
    });
    const gradeDeptAHigh = await prisma.grade.create({
      data: {
        slug: `${RUN_ID}-grade-a-high`,
        name: 'Test A High',
        branch: 'Test',
        tier: 'Test',
        clearanceLevel: 5,
        departmentRefId: deptA.id,
      },
    });
    const gradeDeptBHigh = await prisma.grade.create({
      data: {
        slug: `${RUN_ID}-grade-b-high`,
        name: 'Test B High',
        branch: 'Test',
        tier: 'Test',
        clearanceLevel: 5,
        departmentRefId: deptB.id,
      },
    });

    const makeAgent = async (label: string, gradeId?: string) => {
      const user = await prisma.user.create({
        data: { minecraftUsername: `${RUN_ID}-${label}`, role: 'PLAYER' },
      });
      createdUserIds.push(user.id);
      if (gradeId) {
        const player = await prisma.player.create({ data: { userId: user.id, gradeId } });
        await prisma.user.update({
          where: { id: user.id },
          data: { activeCharacterId: player.id },
        });
      }
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token: `${RUN_ID}-token-${label}`,
          expiresAt: new Date(Date.now() + 3_600_000),
        },
      });
      return session.token;
    };

    tokenNoCharacter = await makeAgent('no-character');
    tokenDeptALow = await makeAgent('dept-a-low', gradeDeptALow.id);
    tokenDeptAHigh = await makeAgent('dept-a-high', gradeDeptAHigh.id);
    tokenDeptBHigh = await makeAgent('dept-b-high', gradeDeptBHigh.id);

    const docPublic = await prisma.classifiedDocument.create({
      data: {
        slug: `${RUN_ID}-doc-public`,
        title: `${RUN_ID} Doc Public`,
        content: 'Contenu public de test.',
        status: ClassifiedDocumentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
    const docDeptA = await prisma.classifiedDocument.create({
      data: {
        slug: `${RUN_ID}-doc-dept-a`,
        title: `${RUN_ID} Doc Dept A`,
        content: 'Contenu reserve au departement A.',
        status: ClassifiedDocumentStatus.PUBLISHED,
        publishedAt: new Date(),
        restrictedDepartmentIds: [deptA.id],
      },
    });
    const docDeptAHigh = await prisma.classifiedDocument.create({
      data: {
        slug: `${RUN_ID}-doc-dept-a-high`,
        title: `${RUN_ID} Doc Dept A High Clearance`,
        content: 'Contenu reserve au departement A, habilitation 5.',
        status: ClassifiedDocumentStatus.PUBLISHED,
        publishedAt: new Date(),
        restrictedDepartmentIds: [deptA.id],
        minClearanceLevel: 5,
      },
    });
    const docDraft = await prisma.classifiedDocument.create({
      data: {
        slug: `${RUN_ID}-doc-draft`,
        title: `${RUN_ID} Doc Draft`,
        content: 'Brouillon jamais publie.',
        status: ClassifiedDocumentStatus.DRAFT,
      },
    });

    docPublicSlug = docPublic.slug;
    docDeptASlug = docDeptA.slug;
    docDeptAHighSlug = docDeptAHigh.slug;
    docDraftSlug = docDraft.slug;
  }, 30_000);

  afterAll(async () => {
    if (!prisma) return;
    await prisma.classifiedDocument.deleteMany({ where: { slug: { startsWith: RUN_ID } } });
    await prisma.session.deleteMany({ where: { token: { startsWith: `${RUN_ID}-token-` } } });
    await prisma.user.updateMany({
      where: { id: { in: createdUserIds } },
      data: { activeCharacterId: null },
    });
    await prisma.player.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.grade.deleteMany({ where: { slug: { startsWith: RUN_ID } } });
    await prisma.department.deleteMany({ where: { slug: { startsWith: RUN_ID } } });
    await app.close();
  }, 30_000);

  const slugsOf = (body: { slug: string }[]) => body.map((d) => d.slug);
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  describe('GET /classified-documents (list)', () => {
    it('shows an anonymous visitor only the public document', async () => {
      const res = await request(app.getHttpServer()).get('/api/classified-documents');
      const slugs = slugsOf(res.body);
      expect(slugs).toContain(docPublicSlug);
      expect(slugs).not.toContain(docDeptASlug);
      expect(slugs).not.toContain(docDeptAHighSlug);
      expect(slugs).not.toContain(docDraftSlug);
    });

    it('civil (logged in, no active character) sees exactly what an anonymous visitor sees', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/classified-documents')
        .set(auth(tokenNoCharacter));
      const slugs = slugsOf(res.body);
      expect(slugs).toContain(docPublicSlug);
      expect(slugs).not.toContain(docDeptASlug);
      expect(slugs).not.toContain(docDeptAHighSlug);
    });

    it('a department A member sees the department-restricted document', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/classified-documents')
        .set(auth(tokenDeptALow));
      const slugs = slugsOf(res.body);
      expect(slugs).toContain(docPublicSlug);
      expect(slugs).toContain(docDeptASlug);
    });

    it('a department A member with insufficient clearance never sees the high-clearance document', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/classified-documents')
        .set(auth(tokenDeptALow));
      expect(slugsOf(res.body)).not.toContain(docDeptAHighSlug);
    });

    it('a department A member with sufficient clearance sees the high-clearance document', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/classified-documents')
        .set(auth(tokenDeptAHigh));
      expect(slugsOf(res.body)).toContain(docDeptAHighSlug);
    });

    it('high clearance in the WRONG department never substitutes for department membership', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/classified-documents')
        .set(auth(tokenDeptBHigh));
      const slugs = slugsOf(res.body);
      expect(slugs).toContain(docPublicSlug);
      expect(slugs).not.toContain(docDeptASlug);
      expect(slugs).not.toContain(docDeptAHighSlug);
    });

    it('never lists an unpublished draft to anyone, staff document endpoints aside', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/classified-documents')
        .set(auth(tokenDeptAHigh));
      expect(slugsOf(res.body)).not.toContain(docDraftSlug);
    });
  });

  describe('GET /classified-documents/:slug (direct URL access)', () => {
    it('serves the public document to anyone', async () => {
      await request(app.getHttpServer())
        .get(`/api/classified-documents/${docPublicSlug}`)
        .expect(200);
    });

    it('a wrong-department direct hit is a 404, not a 403', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/classified-documents/${docDeptASlug}`)
        .set(auth(tokenNoCharacter));
      expect(res.status).toBe(404);
    });

    it('the "restricted" 404 is byte-for-byte the same as a genuinely missing slug', async () => {
      const restricted = await request(app.getHttpServer())
        .get(`/api/classified-documents/${docDeptASlug}`)
        .set(auth(tokenNoCharacter));
      const missing = await request(app.getHttpServer()).get(
        `/api/classified-documents/${RUN_ID}-does-not-exist`,
      );
      expect(restricted.status).toBe(missing.status);
      expect(restricted.body.message).toBe(missing.body.message);
    });

    it('right department but insufficient clearance is still a 404', async () => {
      await request(app.getHttpServer())
        .get(`/api/classified-documents/${docDeptAHighSlug}`)
        .set(auth(tokenDeptALow))
        .expect(404);
    });

    it('right department AND sufficient clearance serves the document', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/classified-documents/${docDeptAHighSlug}`)
        .set(auth(tokenDeptAHigh));
      expect(res.status).toBe(200);
      expect(res.body.slug).toBe(docDeptAHighSlug);
    });

    it('a draft is never reachable by direct URL, even for a high-clearance department member', async () => {
      await request(app.getHttpServer())
        .get(`/api/classified-documents/${docDraftSlug}`)
        .set(auth(tokenDeptAHigh))
        .expect(404);
    });
  });

  describe('GET /search — restricted content never surfaces', () => {
    it('an anonymous search never returns a department-restricted document', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/search')
        .query({ q: RUN_ID });
      const hrefs: string[] = res.body.map((h: { href: string }) => h.href);
      expect(hrefs.some((h) => h.includes(docDeptASlug))).toBe(false);
      expect(hrefs.some((h) => h.includes(docDeptAHighSlug))).toBe(false);
    });

    it('a department A member searching the same term does find the restricted document', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/search')
        .set(auth(tokenDeptAHigh))
        .query({ q: RUN_ID });
      const hrefs: string[] = res.body.map((h: { href: string }) => h.href);
      expect(hrefs.some((h) => h.includes(docDeptASlug))).toBe(true);
    });

    it('a wrong-department high-clearance search still never finds it', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/search')
        .set(auth(tokenDeptBHigh))
        .query({ q: RUN_ID });
      const hrefs: string[] = res.body.map((h: { href: string }) => h.href);
      expect(hrefs.some((h) => h.includes(docDeptASlug))).toBe(false);
    });
  });
});
