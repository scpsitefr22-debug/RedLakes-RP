import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { authHeader, setupLeakFixtures, teardownLeakFixtures } from './support/leak-fixtures';

/**
 * Anti-leak e2e pour les fiches personnage — meme scope et meme discipline
 * que classified-documents-leak.e2e-spec.ts (voir son en-tete). Pas de
 * notion de brouillon/statut ici (Character n'a pas de champ status), donc
 * uniquement les deux axes departement + habilitation.
 */
describe('Characters — anti-leak (e2e)', () => {
  jest.setTimeout(30_000);

  let app: INestApplication<App>;
  let prisma: PrismaService;

  const RUN_ID = `e2e${Date.now()}char`;

  let tokenNoCharacter: string;
  let tokenDeptALow: string;
  let tokenDeptAHigh: string;
  let tokenDeptBHigh: string;
  let createdUserIds: string[];

  let charPublicSlug: string;
  let charDeptASlug: string;
  let charDeptAHighSlug: string;

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

    const base = { title: 'Titre de test', faction: 'Test', biography: 'Biographie de test.' };

    const charPublic = await prisma.character.create({
      data: { ...base, slug: `${RUN_ID}-char-public`, name: 'Personnage public' },
    });
    const charDeptA = await prisma.character.create({
      data: {
        ...base,
        slug: `${RUN_ID}-char-dept-a`,
        name: 'Personnage dept A',
        restrictedDepartmentIds: [fixtures.deptA.id],
      },
    });
    const charDeptAHigh = await prisma.character.create({
      data: {
        ...base,
        slug: `${RUN_ID}-char-dept-a-high`,
        name: 'Personnage dept A high clearance',
        restrictedDepartmentIds: [fixtures.deptA.id],
        minClearanceLevel: 5,
      },
    });

    charPublicSlug = charPublic.slug;
    charDeptASlug = charDeptA.slug;
    charDeptAHighSlug = charDeptAHigh.slug;
  }, 30_000);

  afterAll(async () => {
    if (!prisma) return;
    await prisma.character.deleteMany({ where: { slug: { startsWith: RUN_ID } } });
    await teardownLeakFixtures(prisma, RUN_ID, createdUserIds);
    await app.close();
  }, 30_000);

  const slugsOf = (body: { slug: string }[]) => body.map((c) => c.slug);
  const auth = authHeader;

  describe('GET /characters (list)', () => {
    it('shows an anonymous visitor only the public character', async () => {
      const res = await request(app.getHttpServer()).get('/api/characters');
      const slugs = slugsOf(res.body);
      expect(slugs).toContain(charPublicSlug);
      expect(slugs).not.toContain(charDeptASlug);
      expect(slugs).not.toContain(charDeptAHighSlug);
    });

    it('a department A member sees the department-restricted character', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/characters')
        .set(auth(tokenDeptALow));
      expect(slugsOf(res.body)).toContain(charDeptASlug);
    });

    it('a department A member with insufficient clearance never sees the high-clearance character', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/characters')
        .set(auth(tokenDeptALow));
      expect(slugsOf(res.body)).not.toContain(charDeptAHighSlug);
    });

    it('a department A member with sufficient clearance sees the high-clearance character', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/characters')
        .set(auth(tokenDeptAHigh));
      expect(slugsOf(res.body)).toContain(charDeptAHighSlug);
    });

    it('high clearance in the WRONG department never substitutes for department membership', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/characters')
        .set(auth(tokenDeptBHigh));
      expect(slugsOf(res.body)).not.toContain(charDeptASlug);
    });
  });

  describe('GET /characters/:slug (direct URL access)', () => {
    it('serves the public character to anyone', async () => {
      await request(app.getHttpServer()).get(`/api/characters/${charPublicSlug}`).expect(200);
    });

    it('a wrong-department direct hit is a 404, not a 403', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/characters/${charDeptASlug}`)
        .set(auth(tokenNoCharacter));
      expect(res.status).toBe(404);
    });

    it('the "restricted" 404 is byte-for-byte the same as a genuinely missing slug', async () => {
      const restricted = await request(app.getHttpServer())
        .get(`/api/characters/${charDeptASlug}`)
        .set(auth(tokenNoCharacter));
      const missing = await request(app.getHttpServer()).get(
        `/api/characters/${RUN_ID}-does-not-exist`,
      );
      expect(restricted.status).toBe(missing.status);
      expect(restricted.body.message).toBe(missing.body.message);
    });

    it('right department but insufficient clearance is still a 404', async () => {
      await request(app.getHttpServer())
        .get(`/api/characters/${charDeptAHighSlug}`)
        .set(auth(tokenDeptALow))
        .expect(404);
    });

    it('right department AND sufficient clearance serves the character', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/characters/${charDeptAHighSlug}`)
        .set(auth(tokenDeptAHigh));
      expect(res.status).toBe(200);
      expect(res.body.slug).toBe(charDeptAHighSlug);
    });
  });
});
