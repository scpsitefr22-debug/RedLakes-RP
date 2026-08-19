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
      include: { user: { include: { activeCharacter: true } } },
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

  getMicrosoftAuthUrl(): string {
    const clientId = this.config.get('MICROSOFT_CLIENT_ID');
    const redirectUri = encodeURIComponent(
      this.config.get('MICROSOFT_REDIRECT_URI') ?? '',
    );
    const scope = encodeURIComponent('XboxLive.signin offline_access');

    return `https://login.live.com/oauth20_authorize.srf?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}`;
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

  async handleDiscordCallback(code: string): Promise<AuthUser> {
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

    const user = await this.findOrCreateDiscordUser({
      discordId: profile.id,
      displayName,
      discordAvatar,
    });

    if (user.activeCharacter) {
      await this.discord.syncMemberProfile({
        discordId: profile.id,
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

  async handleMicrosoftCallback(code: string): Promise<AuthUser> {
    const clientId = this.config.get('MICROSOFT_CLIENT_ID');
    const clientSecret = this.config.get('MICROSOFT_CLIENT_SECRET');
    const redirectUri = this.config.get('MICROSOFT_REDIRECT_URI');

    if (!clientId || !clientSecret) {
      throw new BadRequestException(
        'Microsoft OAuth non configuré. Utilisez /auth/dev-login en développement.',
      );
    }

    const tokenRes = await fetch('https://login.live.com/oauth20_token.srf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri ?? '',
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      throw new UnauthorizedException('Échec authentification Microsoft');
    }

    const mcProfile = await this.fetchMinecraftProfile(tokens.access_token);
    return this.upsertMinecraftUser(mcProfile);
  }

  private async fetchMinecraftProfile(accessToken: string) {
    const xblRes = await fetch(
      'https://user.auth.xboxlive.com/user/authenticate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          Properties: {
            AuthMethod: 'RPS',
            SiteName: 'user.auth.xboxlive.com',
            RpsTicket: `d=${accessToken}`,
          },
          RelyingParty: 'http://auth.xboxlive.com',
          TokenType: 'JWT',
        }),
      },
    );
    const xbl = await xblRes.json();
    const xblToken = xbl.Token;
    if (!xblToken) throw new UnauthorizedException('Échec Xbox Live');

    const xstsRes = await fetch(
      'https://xsts.auth.xboxlive.com/xsts/authorize',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          Properties: { SandboxId: 'RETAIL', UserTokens: [xblToken] },
          RelyingParty: 'rp://api.minecraftservices.com/',
          TokenType: 'JWT',
        }),
      },
    );
    const xsts = await xstsRes.json();
    const xstsToken = xsts.Token;
    const userHash = xsts.DisplayClaims?.xui?.[0]?.uhs;
    if (!xstsToken || !userHash) throw new UnauthorizedException('Échec XSTS');

    const mcRes = await fetch(
      'https://api.minecraftservices.com/authentication/login_with_xbox',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identityToken: `XBL3.0 x=${userHash};${xstsToken}`,
        }),
      },
    );
    const mc = await mcRes.json();
    if (!mc.access_token) throw new UnauthorizedException('Échec Minecraft');

    const profileRes = await fetch(
      'https://api.minecraftservices.com/minecraft/profile',
      {
        headers: { Authorization: `Bearer ${mc.access_token}` },
      },
    );
    const profile = await profileRes.json();

    return {
      uuid: profile.id,
      username: profile.name,
      avatarUrl: `https://crafatar.com/avatars/${profile.id}?overlay`,
    };
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

  async getMe(token: string): Promise<AuthUser | null> {
    return this.validateSession(token);
  }
}
