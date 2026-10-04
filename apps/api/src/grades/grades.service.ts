import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Grade, PlatformEntityType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../platform/audit.service';
import { CreateGradeDto, UpdateGradeDto } from './dto/grade.dto';
import { GradeAccessChangeDto } from './dto/grade-access.dto';
import { ACCESS_ZONE_CODES, SITE_SECTION_CODES, sortCodes } from './grade-access-codes';
import { describeGradeChanges } from './grade-changes';

const DIACRITICS_RE = /[\u0300-\u036f]/g;

/**
 * Normalisation identique a apps/web/src/data/rp-grades.ts (normalizeGradeId)
 * pour que les noms de grade envoyes par Discord/Minecraft matchent le
 * catalogue meme avec des variations d'accents/casse/tirets.
 */
export function normalizeGradeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .toLowerCase()
    .replace(/\s*-\s*/g, '-')
    .replace(/[^\w\s/.-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toAccessData(change: GradeAccessChangeDto): Prisma.GradeUpdateManyMutationInput {
  const data: Prisma.GradeUpdateManyMutationInput = {};
  if (Array.isArray(change.accessZones)) {
    data.accessZones = sortCodes(change.accessZones, ACCESS_ZONE_CODES);
  }
  if (Array.isArray(change.siteSections)) {
    data.siteSections = sortCodes(change.siteSections, SITE_SECTION_CODES);
  }
  if (Array.isArray(change.utilities)) {
    data.utilities = [...new Set(change.utilities.map((u) => u.trim()).filter(Boolean))];
  }
  if (typeof change.clearanceLevel === 'number') data.clearanceLevel = change.clearanceLevel;
  if (change.pay !== undefined) data.pay = change.pay;
  if (change.quota !== undefined) data.quota = change.quota;
  return data;
}

@Injectable()
export class GradesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  findAll(branch?: string) {
    return this.prisma.grade.findMany({
      where: branch ? { branch } : undefined,
      include: { departmentRef: true },
      orderBy: [
        { branch: 'asc' },
        { clearanceLevel: 'desc' },
        { pay: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  findOne(slug: string) {
    return this.prisma.grade.findUnique({
      where: { slug },
      include: { departmentRef: true },
    });
  }

  findById(id: string) {
    return this.prisma.grade.findUnique({
      where: { id },
      include: { departmentRef: true },
    });
  }

  create(dto: CreateGradeDto) {
    return this.prisma.grade.create({
      data: {
        ...dto,
        objectives: dto.objectives ?? [],
        utilities: dto.utilities ?? [],
        accessZones: dto.accessZones ?? [],
        siteSections: dto.siteSections ?? [],
      },
    });
  }

  update(id: string, dto: UpdateGradeDto) {
    return this.prisma.grade.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.grade.delete({ where: { id } });
  }

  /**
   * Enregistre d'un coup les acces de plusieurs grades (grille des acces).
   * Tout ou rien : si un grade a ete modifie entre-temps par quelqu'un
   * d'autre, rien n'est ecrit. Chaque grade reellement change est journalise.
   */
  async updateAccess(
    changes: GradeAccessChangeDto[],
    actor: { id: string; label: string },
  ) {
    const ids = changes.map((c) => c.id);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Le même grade apparaît deux fois dans la demande.');
    }

    const before = await this.prisma.grade.findMany({ where: { id: { in: ids } } });
    if (before.length !== ids.length) {
      throw new NotFoundException("Un des grades n'existe plus — recharge la page.");
    }
    const beforeById = new Map(before.map((g) => [g.id, g]));

    // Le serveur (Render, Oregon) est loin de la base (Supabase, Paris) :
    // compter ~150 ms par grade, d'ou un delai large.
    const updated = await this.prisma.$transaction(
      async (tx) => {
        for (const change of changes) {
          const { count } = await tx.grade.updateMany({
            where: { id: change.id, updatedAt: new Date(change.updatedAt) },
            data: { ...toAccessData(change), updatedAt: new Date() },
          });
          if (count === 0) {
            const name = beforeById.get(change.id)?.name ?? 'Un grade';
            throw new ConflictException(
              `« ${name} » a été modifié entre-temps par quelqu'un d'autre. Recharge la page pour voir sa version, puis refais tes changements.`,
            );
          }
        }
        return tx.grade.findMany({ where: { id: { in: ids } } });
      },
      { timeout: 30_000, maxWait: 10_000 },
    );

    for (const grade of updated) {
      const lines = describeGradeChanges(beforeById.get(grade.id)!, grade);
      if (!lines.length) continue;
      await this.audit.log({
        entityType: PlatformEntityType.GRADE,
        entityId: grade.id,
        action: AuditAction.UPDATED,
        actorId: actor.id,
        actorLabel: actor.label,
        summary: `Accès du grade ${grade.name} modifiés — ${lines.join(' ; ')}`,
        metadata: { changes: lines },
      });
    }

    return updated;
  }

  /**
   * Resout un nom de grade en texte libre (venant de Discord/Minecraft) vers
   * l'entree du catalogue correspondante, par correspondance normalisee.
   * Retourne null si aucun grade du catalogue ne correspond.
   */
  async findByName(name: string | null | undefined): Promise<Grade | null> {
    if (!name) return null;
    const key = normalizeGradeName(name);
    const grades = await this.prisma.grade.findMany();
    return grades.find((g) => normalizeGradeName(g.name) === key) ?? null;
  }
}
