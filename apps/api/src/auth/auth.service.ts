import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { DiscordService } from '../sync/discord.service';
import { User } from '@prisma/client';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';

export type AuthUser = User & {
  activeCharacter?: {
    grade: string;
    faction: string;
    teamName?: string | null;
    playtime: number;
    reputation: number;
    sanctions: number;
    medals: string[];
    achievements: unknown;
    /**
     * Relations reelles (factionInfo/gradeInfo/teamInfo) — seulement
     * chargees par validateSession() pour /auth/me (utilise par REDLAKES
     * CORE pour theme/permissions en un seul appel). Les autres chemins
     * (callback Discord, dev login) ne les chargent pas : `faction`/`grade`
     * (strings libres) leur suffisent pour la sync Discord.
     */
    factionInfo?: {
      slug: string;
      name: string;
    } | null;
    gradeInfo?: {
      branch: string;
      tier: string;
      departmentRef?: { id: string; slug: string; name: string } | null;
    } | null;
    teamInfo?: { slug: string; name: string } | null;
  } | null;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private discord: DiscordService,
  ) {}

  async validateSession(token: string): Promise<AuthUser | null> {
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            activeCharacter: {
              include: {
                factionInfo: { select: { slug: true, name: true } },
                gradeInfo: {
                  select: {
                    branch: true,
                    tier: true,
                    departmentRef: { select: { id: true, slug: true, name: true } },
                  },
                },
                teamInfo: { select: { slug: true, name: true } },
              },
            },
          },
        },
      },
    });
    if (!session || session.expiresAt < new Date()) return null;
    return session.user;
  }

  async createSession(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: { userId, token, expiresAt },
    });

    return token;
  }

  async logout(token: string) {
    await this.prisma.session.deleteMany({ where: { token } });
  }

  /** Marque la creation de compte REDLAKES comme terminee (nom RP renseigne). */
  async completeOnboarding(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { onboardedAt: new Date() },
    });
    return { success: true };
  }

  getDiscordAuthUrl(): string {
    const clientId = this.config.get('DISCORD_CLIENT_ID');
    const redirectUri = encodeURIComponent(
      this.config.get('DISCORD_OAUTH_REDIRECT_URI') ?? '',
    );
    const scope = encodeURIComponent('identify');

    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&prompt=consent`;
  }

  /**
   * Garantit qu'un compte a un personnage actif — cree un personnage
   * "Civil" par defaut et le pointe comme actif si aucun n'existe encore.
   * Un compte peut avoir plusieurs personnages (Player) ; un seul est actif
   * a la fois via User.activeCharacterId.
   */
  private async ensureActiveCharacter(userId: string) {
    const character = await this.prisma.player.create({
      data: { userId, grade: 'Civil', faction: 'Civil' },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { activeCharacterId: character.id },
    });
    return character;
  }

  private async withActiveCharacter(user: User & { activeCharacter: unknown }) {
    if (user.activeCharacter) return user as AuthUser;
    await this.ensureActiveCharacter(user.id);
    return this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { activeCharacter: true },
    });
  }

  /**
   * Echange le code OAuth Discord contre le profil Discord verifie (token +
   * appartenance au serveur). Partage par les deux usages du callback :
   * lier un compte deja connecte (chemin normal desormais) et l'ancien
   * chemin login-par-Discord (repli, voir handleDiscordCallback).
   */
  private async exchangeDiscordCode(code: string): Promise<{
    discordId: string;
    displayName: string;
    discordAvatar: string;
  }> {
    const clientId = this.config.get('DISCORD_CLIENT_ID');
    const clientSecret = this.config.get('DISCORD_CLIENT_SECRET');
    const redirectUri = this.config.get('DISCORD_OAUTH_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException('DISCORD_NOT_CONFIGURED');
    }

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) {
      throw new UnauthorizedException('DISCORD_OAUTH_FAILED');
    }

    const profileRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = (await profileRes.json()) as {
      id: string;
      username: string;
      global_name?: string | null;
      avatar?: string | null;
    };

    if (!profile.id) {
      throw new UnauthorizedException('DISCORD_OAUTH_FAILED');
    }

    const isMember = await this.discord.isGuildMember(profile.id);
    if (!isMember) {
      throw new UnauthorizedException('DISCORD_NOT_GUILD_MEMBER');
    }

    const displayName = profile.global_name || profile.username;
    const discordAvatar = profile.avatar
      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${Number(profile.id) % 5}.png`;

    return { discordId: profile.id, displayName, discordAvatar };
  }

  /**
   * Chemin normal desormais : lie Discord au compte DEJA connecte (cree par
   * pseudo/mot de passe), plutot que de creer/retrouver un compte distinct
   * par discordId. Sans ca, cliquer "Lier mon compte Discord" en etant deja
   * connecte remplacait silencieusement la session par un AUTRE compte —
   * exactement le bug signale (deux comptes "Adams Wolf" separes).
   */
  async linkDiscordAccount(userId: string, code: string): Promise<AuthUser> {
    const { discordId, displayName } = await this.exchangeDiscordCode(code);

    const conflictingUser = await this.prisma.user.findUnique({
      where: { discordId },
    });
    if (conflictingUser && conflictingUser.id !== userId) {
      throw new BadRequestException('DISCORD_ALREADY_LINKED');
    }

    // avatarUrl volontairement absent du data — ne jamais ecraser un avatar deja choisi.
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        discordId,
        discordUsername: displayName,
      },
      include: { activeCharacter: true },
    });

    if (user.activeCharacter) {
      await this.discord.syncMemberProfile({
        discordId,
        minecraftUsername: user.minecraftUsername ?? displayName,
        grade: user.activeCharacter.grade,
        faction: user.activeCharacter.faction,
        teamName: user.activeCharacter.teamName,
      });
    }

    return user;
  }

  /**
   * Repli : connexion directe par Discord pour un visiteur SANS session en
   * cours (retrouve ou cree un compte par discordId). Le controleur ne
   * l'utilise que si aucun cookie de session n'est present — le chemin
   * normal est desormais linkDiscordAccount ci-dessus.
   */
  async handleDiscordCallback(code: string): Promise<AuthUser> {
    const { discordId, displayName, discordAvatar } =
      await this.exchangeDiscordCode(code);

    const user = await this.findOrCreateDiscordUser({
      discordId,
      displayName,
      discordAvatar,
    });

    if (user.activeCharacter) {
      await this.discord.syncMemberProfile({
        discordId,
        minecraftUsername: user.minecraftUsername ?? displayName,
        grade: user.activeCharacter.grade,
        faction: user.activeCharacter.faction,
        teamName: user.activeCharacter.teamName,
      });
    }

    return user;
  }

  /** Connexion Discord : retrouve le compte ou en cree un (pas de /link obligatoire). */
  private async findOrCreateDiscordUser(params: {
    discordId: string;
    displayName: string;
    discordAvatar: string;
  }): Promise<AuthUser> {
    const existing = await this.prisma.user.findUnique({
      where: { discordId: params.discordId },
      include: { activeCharacter: true },
    });

    if (existing) {
      const updated = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          discordUsername: params.displayName,
          avatarUrl: existing.avatarUrl ?? params.discordAvatar,
        },
        include: { activeCharacter: true },
      });
      return this.withActiveCharacter(updated);
    }

    const username = await this.uniqueAgentUsername(
      params.displayName,
      params.discordId,
    );

    const created = await this.prisma.user.create({
      data: {
        discordId: params.discordId,
        discordUsername: params.displayName,
        minecraftUsername: username,
        avatarUrl: params.discordAvatar,
      },
      include: { activeCharacter: true },
    });
    return this.withActiveCharacter(created);
  }

  private async uniqueAgentUsername(
    base: string,
    discordId: string,
  ): Promise<string> {
    const sanitized =
      base.replace(/[^\w]/g, '_').replace(/_+/g, '_').slice(0, 20) || 'Agent';
    const candidates = [
      sanitized,
      `${sanitized}_${discordId.slice(-4)}`,
      `agent_${discordId.slice(-8)}`,
    ];

    for (const name of candidates) {
      const taken = await this.prisma.user.findUnique({
        where: { minecraftUsername: name },
      });
      if (!taken) return name;
    }

    return `agent_${discordId}`;
  }

  async devLogin(username: string): Promise<AuthUser> {
    if (this.config.get('NODE_ENV') === 'production') {
      throw new BadRequestException('Dev login désactivé en production');
    }
    return this.upsertMinecraftUser({
      uuid: `dev-${username.toLowerCase()}`,
      username,
      avatarUrl: `https://mc-heads.net/avatar/${username}/64`,
    });
  }

  private async upsertMinecraftUser(profile: {
    uuid: string;
    username: string;
    avatarUrl: string;
  }): Promise<AuthUser> {
    const user = await this.prisma.user.upsert({
      where: { minecraftUuid: profile.uuid },
      update: {
        minecraftUsername: profile.username,
        avatarUrl: profile.avatarUrl,
      },
      create: {
        minecraftUuid: profile.uuid,
        minecraftUsername: profile.username,
        avatarUrl: profile.avatarUrl,
      },
      include: { activeCharacter: true },
    });
    return this.withActiveCharacter(user);
  }

  /**
   * Creation d'un compte REDLAKES par pseudo + mot de passe — chemin de
   * connexion principal desormais, Discord ne servant plus qu'a la liaison
   * (voir linkDiscord/createDiscordLinkCode dans SyncService). Reutilise
   * withActiveCharacter comme tous les autres chemins de creation de compte
   * (Discord, dev-login) pour que l'onboarding (/bienvenue) se declenche
   * pareil quelle que soit la methode d'inscription.
   */
  async register(username: string, password: string): Promise<AuthUser> {
    const normalized = username.toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { username: normalized },
    });
    if (existing) {
      throw new BadRequestException('Ce pseudo est deja pris');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        username: normalized,
        passwordHash,
        avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(normalized)}/64`,
      },
      include: { activeCharacter: true },
    });
    return this.withActiveCharacter(user);
  }

  /**
   * Connexion par mot de passe. Message d'erreur volontairement identique
   * (pseudo inconnu ou mot de passe incorrect) pour ne jamais reveler si un
   * pseudo existe deja — enumeration classique a eviter.
   */
  async login(username: string, password: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: { activeCharacter: true },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return this.withActiveCharacter(user);
  }

  /**
   * Permet a un compte deja connecte (typiquement via Discord/dev-login,
   * sans mot de passe) d'en definir un — chemin de migration pour les
   * comptes existants sans verrouiller personne dehors. Ces comptes n'ont
   * jamais eu de `username` (pseudo de connexion) non plus — sans lui,
   * POST /auth/login ne pourrait jamais les retrouver — donc le pseudo est
   * exige ici tant que le compte n'en a pas deja un.
   */
  async setPassword(
    userId: string,
    password: string,
    username?: string,
    currentPassword?: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { username: true, passwordHash: true },
    });

    // Changement (pas premiere definition) — exige et verifie l'ancien mot
    // de passe, pour qu'une session volee ne suffise pas a en verrouiller
    // le veritable proprietaire dehors.
    if (user.passwordHash) {
      if (!currentPassword) {
        throw new BadRequestException('Mot de passe actuel requis');
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        throw new UnauthorizedException('Mot de passe actuel incorrect');
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (!user.username) {
      if (!username) {
        throw new BadRequestException('Pseudo de connexion requis');
      }
      const normalized = username.toLowerCase();
      const existing = await this.prisma.user.findUnique({
        where: { username: normalized },
      });
      if (existing) {
        throw new BadRequestException('Ce pseudo est deja pris');
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash, username: normalized },
      });
      return;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async getMe(token: string): Promise<AuthUser | null> {
    return this.validateSession(token);
  }

  /**
   * Reponse volontairement identique que le compte existe ou non, et qu'il
   * ait Discord lie ou non — meme principe anti-enumeration que login().
   * Sans Discord lie, il n'existe aucun canal verifie pour envoyer le code
   * (pas d'email sur le site) : le compte reste silencieusement ignore.
   */
  async forgotPassword(username: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    if (!user?.discordId) return;

    const token = randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    await this.discord.sendDirectMessage(
      user.discordId,
      `🔑 **Réinitialisation de mot de passe REDLAKES**\n\nCode : \`${token}\`\nValable 15 minutes.\n\nSi tu n'es pas à l'origine de cette demande, ignore ce message.`,
    );
  }

  async resetPassword(token: string, password: string): Promise<string> {
    const reset = await this.prisma.passwordResetToken.findUnique({
      where: { token: token.toUpperCase() },
    });
    if (!reset || reset.used || reset.expiresAt < new Date()) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: reset.id },
        data: { used: true },
      }),
    ]);
    return reset.userId;
  }
}
