import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { authHeader, setupLeakFixtures, teardownLeakFixtures } from './support/leak-fixtures';

/**
 * Anti-leak e2e pour les evenements narratifs — meme scope et meme
 * discipline que classified-documents-leak.e2e-spec.ts (voir son en-tete).
 * Pas de notion de brouillon/statut ici (GameEvent n'a pas de champ status),
 * donc uniquement les deux axes departement + habilitation. Dernier lot de
 * cette premiere passe (documents/SCP/lore/personnages/evenements) —
 * recherche deja couverte par le spec documents classifies, pas repetee ici.
 */
describe('Game events — anti-leak (e2e)', () => {
  jest.setTimeout(30_000);

  let app: INestApplication<App>;
  let prisma: PrismaService;

  const RUN_ID = `e2e${Date.now()}evt`;

  let tokenNoCharacter: string;
  let tokenDeptALow: string;
  let tokenDeptAHigh: string;
  let tokenDeptBHigh: string;
  let createdUserIds: string[];

  let eventPublicSlug: string;
  let eventDeptASlug: string;
  let eventDeptAHighSlug: string;

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
      date: new Date('2020-01-01'),
      type: 'incident',
      description: 'Description de test.',
      outcome: 'Issue de test.',
    };

    const eventPublic = await prisma.gameEvent.create({
      data: { ...base, slug: `${RUN_ID}-event-public`, title: `${RUN_ID} Événement public` },
    });
    const eventDeptA = await prisma.gameEvent.create({
      data: {
        ...base,
        slug: `${RUN_ID}-event-dept-a`,
        title: `${RUN_ID} Événement dept A`,
        restrictedDepartmentIds: [fixtures.deptA.id],
      },
    });
    const eventDeptAHigh = await prisma.gameEvent.create({
      data: {
        ...base,
        slug: `${RUN_ID}-event-dept-a-high`,
        title: `${RUN_ID} Événement dept A high clearance`,
        restrictedDepartmentIds: [fixtures.deptA.id],
        minClearanceLevel: 5,
      },
    });

    eventPublicSlug = eventPublic.slug;
    eventDeptASlug = eventDeptA.slug;
    eventDeptAHighSlug = eventDeptAHigh.slug;
  }, 30_000);

  afterAll(async () => {
    if (!prisma) return;
    await prisma.gameEvent.deleteMany({ where: { slug: { startsWith: RUN_ID } } });
    await teardownLeakFixtures(prisma, RUN_ID, createdUserIds);
    await app.close();
  }, 30_000);

  const slugsOf = (body: { slug: string }[]) => body.map((e) => e.slug);
  const auth = authHeader;

  describe('GET /events (list)', () => {
    it('shows an anonymous visitor only the public event', async () => {
      const res = await request(app.getHttpServer()).get('/api/events');
      const slugs = slugsOf(res.body);
      expect(slugs).toContain(eventPublicSlug);
      expect(slugs).not.toContain(eventDeptASlug);
      expect(slugs).not.toContain(eventDeptAHighSlug);
    });

    it('a department A member sees the department-restricted event', async () => {
      const res = await request(app.getHttpServer()).get('/api/events').set(auth(tokenDeptALow));
      expect(slugsOf(res.body)).toContain(eventDeptASlug);
    });

    it('a department A member with insufficient clearance never sees the high-clearance event', async () => {
      const res = await request(app.getHttpServer()).get('/api/events').set(auth(tokenDeptALow));
      expect(slugsOf(res.body)).not.toContain(eventDeptAHighSlug);
    });

    it('a department A member with sufficient clearance sees the high-clearance event', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/events')
        .set(auth(tokenDeptAHigh));
      expect(slugsOf(res.body)).toContain(eventDeptAHighSlug);
    });

    it('high clearance in the WRONG department never substitutes for department membership', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/events')
        .set(auth(tokenDeptBHigh));
      expect(slugsOf(res.body)).not.toContain(eventDeptASlug);
    });
  });

  describe('GET /events/:slug (direct URL access)', () => {
    it('serves the public event to anyone', async () => {
      await request(app.getHttpServer()).get(`/api/events/${eventPublicSlug}`).expect(200);
    });

    it('a wrong-department direct hit is a 404, not a 403', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/events/${eventDeptASlug}`)
        .set(auth(tokenNoCharacter));
      expect(res.status).toBe(404);
    });

    it('the "restricted" 404 is byte-for-byte the same as a genuinely missing slug', async () => {
      const restricted = await request(app.getHttpServer())
        .get(`/api/events/${eventDeptASlug}`)
        .set(auth(tokenNoCharacter));
      const missing = await request(app.getHttpServer()).get(
        `/api/events/${RUN_ID}-does-not-exist`,
      );
      expect(restricted.status).toBe(missing.status);
      expect(restricted.body.message).toBe(missing.body.message);
    });

    it('right department but insufficient clearance is still a 404', async () => {
      await request(app.getHttpServer())
        .get(`/api/events/${eventDeptAHighSlug}`)
        .set(auth(tokenDeptALow))
        .expect(404);
    });

    it('right department AND sufficient clearance serves the event', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/events/${eventDeptAHighSlug}`)
        .set(auth(tokenDeptAHigh));
      expect(res.status).toBe(200);
      expect(res.body.slug).toBe(eventDeptAHighSlug);
    });
  });
});
