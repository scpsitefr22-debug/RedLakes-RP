import { Injectable } from '@nestjs/common';
import { AlertLevel, PlatformEntityType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSystemStateDto } from './dto/update-system-state.dto';
import { AuditService } from '../platform/audit.service';
import { NotificationsService } from '../platform/notifications.service';

const SINGLETON_ID = 'singleton';

const ALERT_LABELS: Record<AlertLevel, string> = {
  NORMAL: 'Normal',
  VIGILANCE: 'Vigilance',
  ALERTE: 'Alerte',
  CRISE: 'Crise',
};

@Injectable()
export class SystemService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  /** Source unique de l'état serveur — remplace siteConfig.ts (web) et SERVER_OPEN (bot). */
  getStatus() {
    return this.prisma.systemState.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID },
    });
  }

  /**
   * Le niveau d'alerte est change UNIQUEMENT ici, par un ADMIN (voir
   * SystemController) — jamais de calcul automatique. Journalise via
   * AuditService pour garder une trace de qui a declare quoi, quand (voir
   * memoire "RP breach rarity" : les brèches/crises restent rares et
   * decidees par le staff).
   */
  async updateStatus(
    dto: UpdateSystemStateDto,
    actorId?: string,
    actorLabel?: string,
  ) {
    const current = await this.prisma.systemState.findUnique({
      where: { id: SINGLETON_ID },
    });
    const alertChanges =
      dto.alertLevel !== undefined && dto.alertLevel !== current?.alertLevel;

    const data = {
      ...dto,
      ...(alertChanges ? { alertUpdatedAt: new Date() } : {}),
    };

    const updated = await this.prisma.systemState.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: { id: SINGLETON_ID, ...data },
    });

    if (alertChanges) {
      await this.audit.log({
        entityType: PlatformEntityType.SYSTEM_STATE,
        entityId: SINGLETON_ID,
        action: 'STATUS_CHANGED',
        actorId,
        actorLabel,
        summary: `Niveau d'alerte changé : ${current?.alertLevel ?? 'NORMAL'} → ${updated.alertLevel}${dto.alertNote ? ` — ${dto.alertNote}` : ''}`,
        metadata: {
          previousAlertLevel: current?.alertLevel ?? 'NORMAL',
          newAlertLevel: updated.alertLevel,
          note: dto.alertNote,
        },
      });

      // Diffusion à tout le réseau — le bureau REDLAKES CORE d'un joueur
      // connecté doit refléter un vrai changement d'état décidé par le
      // staff, jamais un évènement simulé (voir memoire "RP breach rarity").
      const userIds = await this.notifications.findAllUserIds();
      await this.notifications.notifyMany(userIds, {
        title: `Niveau d'alerte : ${ALERT_LABELS[updated.alertLevel]}`,
        body:
          dto.alertNote ??
          `Le niveau d'alerte de Site-12 est passé à ${ALERT_LABELS[updated.alertLevel]}.`,
        entityType: PlatformEntityType.SYSTEM_STATE,
        entityId: SINGLETON_ID,
      });
    }

    return updated;
  }
}
