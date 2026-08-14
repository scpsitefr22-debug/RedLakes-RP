import { Injectable } from '@nestjs/common';
import { Grade } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  findAll(branch?: string) {
    return this.prisma.grade.findMany({
      where: branch ? { branch } : undefined,
      include: { departmentRef: true },
      orderBy: [{ branch: 'asc' }, { clearance: 'desc' }, { name: 'asc' }],
    });
  }

  findOne(slug: string) {
    return this.prisma.grade.findUnique({
      where: { slug },
      include: { departmentRef: true },
    });
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
