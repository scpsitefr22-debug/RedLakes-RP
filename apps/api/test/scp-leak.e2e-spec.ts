import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ScpClass, ScpProposalStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { authHeader, setupLeakFixtures, teardownLeakFixtures } from './support/leak-fixtures';

/**
 * Anti-leak e2e pour les fiches SCP — meme scope et meme discipline que
 * classified-documents-leak.e2e-spec.ts (voir son en-tete), applique au
 * deuxieme type de contenu de la suite. "PENDING" (propose, pas encore
 * approuve par le staff) joue ici le role que "DRAFT" joue pour les
 * documents classifies : jamais visible publiquement, quel que soit le
 * departement/l'habilitation.
 */
describe('SCP objects — anti-leak (e2e)', () => {
  jest.setTimeout(30_000);

  let app: INestApplication<App>;
  let prisma: PrismaService;

  const RUN_ID = `e2e${Date.now()}scp`;

  let tokenNoCharacter: string;
  let tokenDeptALow: string;
  let tokenDeptAHigh: string;
  let tokenDeptBHigh: string;
  let createdUserIds: string[];

  let scpPublicSlug: string;
  let scpDeptASlug: string;
  let scpDeptAHighSlug: string;
  let scpPendingSlug: string;

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

    const base = {
      class: ScpClass.Euclid,
      threatLevel: 2,
      containment: 'Protocole de test.',
      history: 'Historique de test.',
      description: 'Description de test.',
    };

    const scpPublic = await prisma.scpObject.create({
      data: { ...base, slug: `${RUN_ID}-scp-public`, number: `${RUN_ID}-001`, name: 'SCP public' },
    });
    const scpDeptA = await prisma.scpObject.create({
      data: {
        ...base,
        slug: `${RUN_ID}-scp-dept-a`,
        number: `${RUN_ID}-002`,
        name: 'SCP dept A',
        restrictedDepartmentIds: [fixtures.deptA.id],
      },
    });
    const scpDeptAHigh = await prisma.scpObject.create({
      data: {
        ...base,
        slug: `${RUN_ID}-scp-dept-a-high`,
        number: `${RUN_ID}-003`,
        name: 'SCP dept A high clearance',
        restrictedDepartmentIds: [fixtures.deptA.id],
        minClearanceLevel: 5,
      },
    });
    const scpPending = await prisma.scpObject.create({
      data: {
        ...base,
        slug: `${RUN_ID}-scp-pending`,
        number: `${RUN_ID}-004`,
        name: 'SCP pending',
        status: ScpProposalStatus.PENDING,
      },
    });

    scpPublicSlug = scpPublic.slug;
    scpDeptASlug = scpDeptA.slug;
    scpDeptAHighSlug = scpDeptAHigh.slug;
    scpPendingSlug = scpPending.slug;
  }, 30_000);

  afterAll(async () => {
    if (!prisma) return;
    await prisma.scpObject.deleteMany({ where: { slug: { startsWith: RUN_ID } } });
    await teardownLeakFixtures(prisma, RUN_ID, createdUserIds);
    await app.close();
  }, 30_000);

  const slugsOf = (body: { slug: string }[]) => body.map((s) => s.slug);
  const auth = authHeader;

  describe('GET /scp (list)', () => {
    it('shows an anonymous visitor only the public SCP', async () => {
      const res = await request(app.getHttpServer()).get('/api/scp');
      const slugs = slugsOf(res.body);
      expect(slugs).toContain(scpPublicSlug);
      expect(slugs).not.toContain(scpDeptASlug);
      expect(slugs).not.toContain(scpDeptAHighSlug);
      expect(slugs).not.toContain(scpPendingSlug);
    });

    it('a department A member sees the department-restricted SCP', async () => {
      const res = await request(app.getHttpServer()).get('/api/scp').set(auth(tokenDeptALow));
      expect(slugsOf(res.body)).toContain(scpDeptASlug);
    });

    it('a department A member with insufficient clearance never sees the high-clearance SCP', async () => {
      const res = await request(app.getHttpServer()).get('/api/scp').set(auth(tokenDeptALow));
      expect(slugsOf(res.body)).not.toContain(scpDeptAHighSlug);
    });

    it('a department A member with sufficient clearance sees the high-clearance SCP', async () => {
      const res = await request(app.getHttpServer()).get('/api/scp').set(auth(tokenDeptAHigh));
      expect(slugsOf(res.body)).toContain(scpDeptAHighSlug);
    });

    it('high clearance in the WRONG department never substitutes for department membership', async () => {
      const res = await request(app.getHttpServer()).get('/api/scp').set(auth(tokenDeptBHigh));
      expect(slugsOf(res.body)).not.toContain(scpDeptASlug);
    });

    it('never lists a pending (unapproved) SCP to anyone', async () => {
      const res = await request(app.getHttpServer()).get('/api/scp').set(auth(tokenDeptAHigh));
      expect(slugsOf(res.body)).not.toContain(scpPendingSlug);
    });
  });

  describe('GET /scp/:slug (direct URL access)', () => {
    it('serves the public SCP to anyone', async () => {
      await request(app.getHttpServer()).get(`/api/scp/${scpPublicSlug}`).expect(200);
    });

    it('a wrong-department direct hit is a 404, not a 403', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/scp/${scpDeptASlug}`)
        .set(auth(tokenNoCharacter));
      expect(res.status).toBe(404);
    });

    it('the "restricted" 404 is byte-for-byte the same as a genuinely missing slug', async () => {
      const restricted = await request(app.getHttpServer())
        .get(`/api/scp/${scpDeptASlug}`)
        .set(auth(tokenNoCharacter));
      const missing = await request(app.getHttpServer()).get(
        `/api/scp/${RUN_ID}-does-not-exist`,
      );
      expect(restricted.status).toBe(missing.status);
      expect(restricted.body.message).toBe(missing.body.message);
    });

    it('right department AND sufficient clearance serves the SCP', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/scp/${scpDeptAHighSlug}`)
        .set(auth(tokenDeptAHigh));
      expect(res.status).toBe(200);
      expect(res.body.slug).toBe(scpDeptAHighSlug);
    });

    it('a pending SCP is never reachable by direct URL, even for a high-clearance department member', async () => {
      await request(app.getHttpServer())
        .get(`/api/scp/${scpPendingSlug}`)
        .set(auth(tokenDeptAHigh))
        .expect(404);
    });
  });
});
