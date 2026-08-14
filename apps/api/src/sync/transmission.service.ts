import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import type { TransmissionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DiscordEventDto } from './dto/discord-event.dto';

/** Désignations RP utilisées pour codifier les pseudos Discord (anonymisation). */
const DESIGNATIONS = [
  'Agent',
  'Opérateur',
  'Chercheur',
  'Garde',
  'Technicien',
  'Observateur',
  'Vecteur',
  'Sentinelle',
  'Archiviste',
  'Témoin',
];

export interface PublicTransmission {
  id: string;
  type: TransmissionType;
  channelLabel: string;
  clearance: number;
  isPublic: boolean;
  codename: string;
  authorDisplay: string | null;
  title: string;
  body: string;
  excerpt: string | null;
  occurredAt: string;
}

@Injectable()
export class TransmissionService {
  private readonly logger = new Logger(TransmissionService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  /** Génère un nom de code RP déterministe (stable pour un même auteur) et non réversible. */
  private codename(authorId?: string): { codename: string; hash?: string } {
    if (!authorId) return { codename: 'Entité ███' };
    const salt =
      this.config.get<string>('TRANSMISSION_SALT') ?? 'redlakes-site12';
    const digest = createHash('sha256')
      .update(`${salt}:${authorId}`)
      .digest('hex');
    const idx = parseInt(digest.slice(0, 2), 16) % DESIGNATIONS.length;
    const code = digest.slice(2, 6).toUpperCase();
    return {
      codename: `${DESIGNATIONS[idx]}-${code}`,
      hash: digest.slice(0, 16),
    };
  }

  /** Construit le titre + corps RP (style Fondation) selon le type d'évènement. */
  private render(
    dto: DiscordEventDto,
    codename: string,
  ): { title: string; body: string; excerpt: string | null } {
    const label = dto.channelLabel?.trim() || 'Secteur non répertorié';
    const isPublic = dto.isPublic ?? false;
    const excerpt =
      isPublic && dto.contentExcerpt ? dto.contentExcerpt.trim() : null;

    switch (dto.type) {
      case 'ANNOUNCE':
        return {
          title: `Directive officielle — ${label}`,
          body: excerpt
            ? `Communiqué diffusé par le commandement du Site-12 via le canal « ${label} ».`
            : `Une directive a été émise sur le canal « ${label} ». Détails réservés au personnel habilité.`,
          excerpt,
        };
      case 'MESSAGE':
        return {
          title: isPublic
            ? `Transmission — ${label}`
            : `Transmission interceptée — ${label}`,
          body: isPublic
            ? `Communication enregistrée dans le secteur « ${label} » par ${codename}.`
            : `Communication chiffrée enregistrée dans le secteur « ${label} ». Contenu soumis à habilitation.`,
          excerpt,
        };
      case 'MEMBER_JOIN':
        return {
          title: 'Nouvelle accréditation détectée',
          body: `Un nouvel élément, désigné ${codename}, a franchi le point de contrôle du Site-12. Procédure d'enregistrement en cours.`,
          excerpt: null,
        };
      case 'MEMBER_LEAVE':
        return {
          title: 'Cessation d’accréditation',
          body: `L'accréditation de ${codename} a été révoquée. L'élément ne figure plus dans le périmètre du Site-12.`,
          excerpt: null,
        };
      case 'BOOST':
        return {
          title: 'Renfort énergétique du Site',
          body: `${codename} a renforcé les systèmes du Site-12. Stabilité du périmètre améliorée.`,
          excerpt: null,
        };
      case 'EVENT':
      default:
        return {
          title: `Évènement consigné — ${label}`,
          body: excerpt
            ? `Évènement enregistré dans le secteur « ${label} ».`
            : `Un évènement a été consigné dans le secteur « ${label} ».`,
          excerpt,
        };
    }
  }

  /** Niveau d'habilitation par défaut selon le type si non fourni par le bot. */
  private defaultClearance(type: TransmissionType): number {
    switch (type) {
      case 'MEMBER_JOIN':
      case 'MEMBER_LEAVE':
      case 'ANNOUNCE':
      case 'BOOST':
        return 1;
      default:
        return 3;
    }
  }

  async ingest(
    dto: DiscordEventDto,
  ): Promise<{ success: boolean; id?: string }> {
    const { codename, hash } = this.codename(dto.authorId);
    const { title, body, excerpt } = this.render(dto, codename);
    const type = dto.type;
    const clearance = dto.clearance ?? this.defaultClearance(type);
    const occurredAt = dto.occurredAt ? new Date(dto.occurredAt) : new Date();

    try {
      // Anti-doublon pour les messages (le bot peut renvoyer le même message).
      if (dto.discordMessageId) {
        const existing = await this.prisma.discordTransmission.findUnique({
          where: { discordMessageId: dto.discordMessageId },
        });
        if (existing) return { success: true, id: existing.id };
      }

      const created = await this.prisma.discordTransmission.create({
        data: {
          type,
          discordMessageId: dto.discordMessageId,
          channelId: dto.channelId,
          channelLabel: dto.channelLabel?.trim() || 'Secteur non répertorié',
          clearance,
          isPublic: dto.isPublic ?? false,
          codename,
          authorHash: hash,
          authorDisplay: dto.isPublic ? (dto.authorDisplay ?? null) : null,
          title,
          body,
          excerpt,
          occurredAt: Number.isNaN(occurredAt.getTime())
            ? new Date()
            : occurredAt,
        },
      });
      return { success: true, id: created.id };
    } catch (err) {
      this.logger.warn(`Ingestion transmission échouée: ${err}`);
      return { success: false };
    }
  }

  /** Flux public consommé par le site (lecture seule, sans clé). */
  async list(limit = 60): Promise<PublicTransmission[]> {
    const take = Math.min(Math.max(limit, 1), 100);
    const rows = await this.prisma.discordTransmission.findMany({
      orderBy: { occurredAt: 'desc' },
      take,
    });

    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      channelLabel: r.channelLabel,
      clearance: r.clearance,
      isPublic: r.isPublic,
      codename: r.codename,
      authorDisplay: r.authorDisplay,
      title: r.title,
      body: r.body,
      excerpt: r.excerpt,
      occurredAt: r.occurredAt.toISOString(),
    }));
  }
}
