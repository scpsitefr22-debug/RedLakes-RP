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
import {
  ACCESS_ZONE_CODES,
  FOUNDATION_BRANCH_LABELS,
  SITE_SECTION_CODES,
  branchLabel,
  sortCodes,
} from './grade-access-codes';
import { describeGradeChanges, movedInOrder, rank } from './grade-changes';

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

function toAccessData(change: GradeAccessChangeDto): Prisma.GradeUncheckedUpdateManyInput {
  const data: Prisma.GradeUncheckedUpdateManyInput = {};
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
  if (typeof change.sortOrder === 'number') data.sortOrder = change.sortOrder;
  return data;
}

/** Ordre actif d'une branche (ids), du plus haut au plus bas. */
function activeOrder(grades: Grade[], branch: string): string[] {
  return grades
    .filter((g) => g.branch === branch && !g.archivedAt)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'fr'))
    .map((g) => g.id);
}

/**
 * Departement le plus courant parmi les grades actifs de chaque branche :
 * un grade deplace vers une autre branche prend le departement de celle-ci
 * (c'est lui qui ouvre les documents restreints au departement).
 */
function departmentByBranch(grades: Grade[]) {
  const counts = new Map<string, Map<string, { departmentId: string | null; departmentRefId: string | null; n: number }>>();
  for (const g of grades) {
    if (g.archivedAt) continue;
    const key = `${g.departmentId ?? ''}|${g.departmentRefId ?? ''}`;
    const perBranch = counts.get(g.branch) ?? new Map();
    const entry = perBranch.get(key) ?? { departmentId: g.departmentId, departmentRefId: g.departmentRefId, n: 0 };
    entry.n += 1;
    perBranch.set(key, entry);
    counts.set(g.branch, perBranch);
  }
  const result = new Map<string, { departmentId: string | null; departmentRefId: string | null }>();
  for (const [branch, perBranch] of counts) {
    const best = [...perBranch.values()].sort((a, b) => b.n - a.n)[0];
    result.set(branch, { departmentId: best.departmentId, departmentRefId: best.departmentRefId });
  }
  return result;
}

@Injectable()
export class GradesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  /** Grades en service (les metiers retires n'apparaissent plus), dans l'ordre de la hierarchie. */
  findAll(branch?: string) {
    return this.prisma.grade.findMany({
      where: { archivedAt: null, ...(branch ? { branch } : {}) },
      include: { departmentRef: true },
      orderBy: [{ branch: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  /** Pour la grille staff : tous les grades, retires compris, avec le nombre de personnages qui les ont. */
  findForManagement() {
    return this.prisma.grade.findMany({
      include: { _count: { select: { players: true } } },
      orderBy: [{ branch: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
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

  async create(dto: CreateGradeDto) {
    // Un nouveau grade arrive en bas de sa branche ; on le remonte ensuite dans la grille.
    const last = await this.prisma.grade.aggregate({
      where: { branch: dto.branch },
      _max: { sortOrder: true },
    });
    return this.prisma.grade.create({
      data: {
        ...dto,
        sortOrder: (last._max.sortOrder ?? 0) + 1,
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
   * Enregistre d'un coup plusieurs grades depuis la grille staff : acces,
   * habilitation, salaire, place dans la hierarchie, branche, retrait.
   * Tout ou rien : si un grade a ete modifie entre-temps par quelqu'un
   * d'autre, rien n'est ecrit. Chaque grade change est journalise, et chaque
   * branche dont la hierarchie a bouge l'est une fois.
   */
  async updateAccess(
    changes: GradeAccessChangeDto[],
    actor: { id: string; label: string },
  ) {
    const ids = changes.map((c) => c.id);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Le même grade apparaît deux fois dans la demande.');
    }

    // Tout le catalogue : branches existantes, departement de chacune, et
    // ordre complet des branches touchees pour le journal.
    const before = await this.prisma.grade.findMany();
    const beforeById = new Map(before.map((g) => [g.id, g]));
    if (ids.some((id) => !beforeById.has(id))) {
      throw new NotFoundException("Un des grades n'existe plus — recharge la page.");
    }
    const knownBranches = new Set([
      ...Object.keys(FOUNDATION_BRANCH_LABELS),
      ...before.map((g) => g.branch),
    ]);
    for (const change of changes) {
      if (change.branch !== undefined && !knownBranches.has(change.branch)) {
        throw new BadRequestException(`Branche inconnue : « ${change.branch} ».`);
      }
    }
    const departments = departmentByBranch(before);

    // Le serveur (Render, Oregon) est loin de la base (Supabase, Paris) :
    // compter ~150 ms par grade, d'ou un delai large.
    const after = await this.prisma.$transaction(
      async (tx) => {
        for (const change of changes) {
          const current = beforeById.get(change.id)!;
          const data: Prisma.GradeUncheckedUpdateManyInput = {
            ...toAccessData(change),
            updatedAt: new Date(),
          };
          if (change.branch !== undefined && change.branch !== current.branch) {
            data.branch = change.branch;
            const department = departments.get(change.branch);
            if (department) {
              data.departmentId = department.departmentId;
              data.departmentRefId = department.departmentRefId;
            }
          }
          if (change.archived !== undefined && change.archived !== Boolean(current.archivedAt)) {
            data.archivedAt = change.archived ? new Date() : null;
          }
          const { count } = await tx.grade.updateMany({
            where: { id: change.id, updatedAt: new Date(change.updatedAt) },
            data,
          });
          if (count === 0) {
            throw new ConflictException(
              `« ${current.name} » a été modifié entre-temps par quelqu'un d'autre. Recharge la page pour voir sa version, puis refais tes changements.`,
            );
          }
        }
        return tx.grade.findMany();
      },
      { timeout: 30_000, maxWait: 10_000 },
    );
    const afterById = new Map(after.map((g) => [g.id, g]));

    for (const id of ids) {
      const grade = afterById.get(id)!;
      const lines = describeGradeChanges(beforeById.get(id)!, grade);
      if (!lines.length) continue;
      await this.audit.log({
        entityType: PlatformEntityType.GRADE,
        entityId: grade.id,
        action: AuditAction.UPDATED,
        actorId: actor.id,
        actorLabel: actor.label,
        summary: `Grade ${grade.name} — ${lines.join(' ; ')}`,
        metadata: { changes: lines },
      });
    }

    const touchedBranches = new Set(
      ids.flatMap((id) => [beforeById.get(id)!.branch, afterById.get(id)!.branch]),
    );
    for (const branch of touchedBranches) {
      const beforeOrder = activeOrder(before, branch);
      const afterOrder = activeOrder(after, branch);
      const moved = movedInOrder(beforeOrder, afterOrder);
      if (!moved.length) continue;
      const lines = moved.map(
        (id) =>
          `${afterById.get(id)!.name} : ${rank(beforeOrder.indexOf(id) + 1)} → ${rank(afterOrder.indexOf(id) + 1)}`,
      );
      await this.audit.log({
        entityType: PlatformEntityType.GRADE,
        entityId: `branche:${branch}`,
        action: AuditAction.UPDATED,
        actorId: actor.id,
        actorLabel: actor.label,
        summary: `Hiérarchie ${branchLabel(branch)} réorganisée — ${lines.join(' ; ')}`,
        metadata: { branch, order: afterOrder.map((id) => afterById.get(id)!.name) },
      });
    }

    return ids.map((id) => afterById.get(id)!);
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
