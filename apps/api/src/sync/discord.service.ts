import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ensureGradeRoleViaApi,
  getManagedRoleIds,
  refreshRoleRegistryFromApi,
  resolveGradeRoleId,
} from './discord-role-registry';
import { formatRpNickname } from './format-rp-nickname';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(private config: ConfigService) {}

  private getRoleMap(): Record<string, string> {
    const raw = this.config.get<string>('DISCORD_ROLE_MAP');
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, string>;
    } catch {
      this.logger.warn('DISCORD_ROLE_MAP invalide — JSON attendu');
      return {};
    }
  }

  /** Annonce un changement de grade dans un salon Discord (webhook — pas de bot requis) */
  async notifyRoleChange(params: {
    minecraftUsername: string;
    grade: string;
    previousGrade?: string;
    faction: string;
    teamName?: string | null;
  }): Promise<void> {
    const webhookUrl = this.config.get<string>('DISCORD_WEBHOOK_URL');
    if (!webhookUrl) return;

    const isPromotion =
      params.previousGrade && params.previousGrade !== params.grade;
    const title = isPromotion
      ? 'Promotion Site-12'
      : 'Mise à jour du personnel';

    const fields = [
      { name: 'Joueur', value: params.minecraftUsername, inline: true },
      { name: 'Grade', value: params.grade, inline: true },
      { name: 'Faction', value: params.faction, inline: true },
    ];

    if (params.previousGrade && params.previousGrade !== params.grade) {
      fields.unshift({
        name: 'Ancien grade',
        value: params.previousGrade,
        inline: true,
      });
    }
    if (params.teamName) {
      fields.push({ name: 'Équipe', value: params.teamName, inline: true });
    }

    await this.postWebhook(webhookUrl, {
      username: 'REDLAKES — Site-12',
      avatar_url: 'https://mc-heads.net/avatar/MHF_Question/64',
      embeds: [
        {
          title,
          color: 0x8b0a0a,
          fields,
          footer: { text: 'Synchronisé avec le site REDLAKES RP' },
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }

  /** Annonce qu'un compte Minecraft a été lié (optionnel, second webhook) */
  async notifyAccountLinked(params: {
    minecraftUsername: string;
    discordUsername?: string;
  }): Promise<void> {
    const webhookUrl =
      this.config.get<string>('DISCORD_WEBHOOK_LINK') ??
      this.config.get<string>('DISCORD_WEBHOOK_URL');
    if (!webhookUrl) return;

    await this.postWebhook(webhookUrl, {
      username: 'REDLAKES — Liaison',
      embeds: [
        {
          title: 'Compte lié',
          color: 0x5865f2,
          description: `**${params.minecraftUsername}** est maintenant relié au site.${
            params.discordUsername
              ? `\nDiscord : ${params.discordUsername}`
              : ''
          }`,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }

  /** Nouveau rapport RP déposé sur l'intranet Site-12 */
  async notifyPersonnelReport(params: {
    type: string;
    subject: string;
    content: string;
    minecraftUsername: string;
    grade: string;
    rpName?: string | null;
    clearance: number;
    reportId: string;
  }): Promise<void> {
    const webhookUrl =
      this.config.get<string>('DISCORD_WEBHOOK_STAFF') ??
      this.config.get<string>('DISCORD_WEBHOOK_URL');
    if (!webhookUrl) return;

    const typeLabels: Record<string, string> = {
      INCIDENT: "Rapport d'incident",
      AUTHORIZATION: "Demande d'autorisation",
      MEMO: 'Mémo interne',
      EQUIPMENT: 'Réquisition matériel',
    };

    const agent = params.rpName
      ? `${params.rpName} (${params.minecraftUsername})`
      : params.minecraftUsername;

    await this.postWebhook(webhookUrl, {
      username: 'REDLAKES — Intranet Site-12',
      embeds: [
        {
          title: `${typeLabels[params.type] ?? params.type} — en attente`,
          color: 0xf59e0b,
          fields: [
            { name: 'Agent', value: agent, inline: true },
            { name: 'Grade', value: params.grade, inline: true },
            {
              name: 'Habilitation',
              value: `Niveau ${params.clearance}`,
              inline: true,
            },
            { name: 'Objet', value: params.subject.slice(0, 256) },
            {
              name: 'Contenu',
              value:
                params.content.slice(0, 900) +
                (params.content.length > 900 ? '…' : ''),
            },
          ],
          footer: {
            text: `Traiter sur le site (/staff) — Réf. ${params.reportId.slice(0, 8)}`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }

  /** Nouvelle candidature déposée sur le site */
  async notifyApplication(params: {
    type: string;
    minecraftUsername: string;
    motivation: string;
    applicationId: string;
  }): Promise<void> {
    const webhookUrl =
      this.config.get<string>('DISCORD_WEBHOOK_STAFF') ??
      this.config.get<string>('DISCORD_WEBHOOK_URL');
    if (!webhookUrl) return;

    await this.postWebhook(webhookUrl, {
      username: 'REDLAKES — Candidatures',
      embeds: [
        {
          title: `Candidature ${params.type} — en attente`,
          color: 0x8b5cf6,
          fields: [
            { name: 'Joueur', value: params.minecraftUsername, inline: true },
            { name: 'Type', value: params.type, inline: true },
            {
              name: 'Motivation',
              value:
                params.motivation.slice(0, 900) +
                (params.motivation.length > 900 ? '…' : ''),
            },
          ],
          footer: {
            text: `Réf. ${params.applicationId.slice(0, 8)} — /staff sur le site`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }

  /** Rapport RP traité par le staff */
  async notifyPersonnelReportReviewed(params: {
    subject: string;
    status: string;
    staffNote?: string | null;
    minecraftUsername: string;
  }): Promise<void> {
    const webhookUrl =
      this.config.get<string>('DISCORD_WEBHOOK_STAFF') ??
      this.config.get<string>('DISCORD_WEBHOOK_URL');
    if (!webhookUrl) return;

    await this.postWebhook(webhookUrl, {
      username: 'REDLAKES — Intranet Site-12',
      embeds: [
        {
          title: `Rapport traité — ${params.subject.slice(0, 80)}`,
          color: params.status === 'REVIEWED' ? 0x22c55e : 0x6b7280,
          description: `Agent : **${params.minecraftUsername}**\nStatut : **${params.status}**${
            params.staffNote ? `\nNote staff : ${params.staffNote}` : ''
          }`,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }

  private async postWebhook(
    url: string,
    body: Record<string, unknown>,
  ): Promise<void> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        this.logger.warn(`Webhook Discord échoué (${res.status}): ${text}`);
      }
    } catch (err) {
      this.logger.warn(`Webhook Discord échoué: ${err}`);
    }
  }

  /** Met à jour pseudo + rôles RP Discord (grade in-game) sans toucher staff / joueur de base */
  async syncMemberProfile(params: {
    discordId: string;
    minecraftUsername: string;
    grade: string;
    faction: string;
    teamName?: string | null;
    rpFirstName?: string | null;
    rpLastName?: string | null;
  }): Promise<void> {
    const token = this.config.get<string>('DISCORD_BOT_TOKEN');
    const guildId = this.config.get<string>('DISCORD_GUILD_ID');
    if (!token || !guildId) return;

    const nickname = formatRpNickname({
      grade: params.grade,
      rpFirstName: params.rpFirstName,
      rpLastName: params.rpLastName,
      teamName: params.teamName,
    });

    const roleMap = this.getRoleMap();
    const roleVerified = this.config.get<string>('ROLE_VERIFIED');

    try {
      await refreshRoleRegistryFromApi({
        token,
        guildId,
        roleMap,
        roleVerified,
      });
    } catch (err) {
      this.logger.warn(`Scan roles RP Discord échoué: ${err}`);
    }

    const autoCreate =
      this.config.get<string>('DISCORD_AUTO_CREATE_ROLES', 'false') === 'true';

    const managedRoleIds = getManagedRoleIds();
    let gradeRoleId = resolveGradeRoleId(params.grade, roleMap);
    if (!gradeRoleId && autoCreate) {
      gradeRoleId = await ensureGradeRoleViaApi({
        token,
        guildId,
        grade: params.grade,
        autoCreate,
      });
    }

    let currentRoleIds: string[] = [];
    try {
      const memberRes = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${params.discordId}`,
        { headers: { Authorization: `Bot ${token}` } },
      );
      if (memberRes.ok) {
        const member = (await memberRes.json()) as { roles?: string[] };
        currentRoleIds = member.roles ?? [];
      }
    } catch (err) {
      this.logger.warn(`Lecture membre Discord échouée: ${err}`);
    }

    const nextRoles = currentRoleIds.filter((id) => !managedRoleIds.has(id));
    if (gradeRoleId) nextRoles.push(gradeRoleId);
    if (roleVerified) nextRoles.push(roleVerified);

    try {
      const res = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${params.discordId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bot ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nick: nickname,
            roles: [...new Set(nextRoles)],
          }),
        },
      );
      if (!res.ok) {
        const body = await res.text();
        this.logger.warn(`Sync Discord échouée (${res.status}): ${body}`);
      }
    } catch (err) {
      this.logger.warn(`Sync Discord échouée: ${err}`);
    }
  }
}
