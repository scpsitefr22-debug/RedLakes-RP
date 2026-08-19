import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Req,
  Body,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { UseGuards } from '@nestjs/common';
import { SyncService } from '../sync/sync.service';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
    private sync: SyncService,
  ) {}

  @Get('minecraft')
  minecraftLogin(@Res() res: Response) {
    const clientId = this.config.get('MICROSOFT_CLIENT_ID');
    if (!clientId) {
      return res.redirect(
        `${this.config.get('WEB_URL')}/connexion?error=oauth_not_configured`,
      );
    }
    return res.redirect(this.auth.getMicrosoftAuthUrl());
  }

  @Get('discord')
  discordLogin(@Res() res: Response) {
    const clientId = this.config.get('DISCORD_CLIENT_ID');
    const clientSecret = this.config.get('DISCORD_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      return res.redirect(
        `${this.config.get('WEB_URL')}/connexion?error=discord_not_configured`,
      );
    }
    return res.redirect(this.auth.getDiscordAuthUrl());
  }

  @Get('discord/callback')
  async discordCallback(
    @Query('code') code: string,
    @Query('error') oauthError: string,
    @Res() res: Response,
  ) {
    const webUrl = this.config.get('WEB_URL') ?? 'http://localhost:3000';

    if (oauthError || !code) {
      return res.redirect(`${webUrl}/connexion?error=discord_oauth_denied`);
    }

    try {
      const user = await this.auth.handleDiscordCallback(code);
      const token = await this.auth.createSession(user.id);
      this.setSessionCookie(res, token);
      return res.redirect(`${webUrl}/dashboard`);
    } catch (err) {
      const msg =
        err instanceof BadRequestException ||
        err instanceof UnauthorizedException
          ? err.message
          : 'DISCORD_OAUTH_FAILED';

      const code = msg.includes('DISCORD_NOT_GUILD_MEMBER')
        ? 'discord_not_member'
        : msg.includes('DISCORD_NOT_LINKED')
          ? 'discord_not_linked'
          : msg.includes('DISCORD_NOT_CONFIGURED')
            ? 'discord_not_configured'
            : msg.includes('DISCORD_OAUTH_FAILED')
              ? 'discord_oauth_failed'
              : 'discord_oauth_failed';

      return res.redirect(`${webUrl}/connexion?error=${code}`);
    }
  }

  @Get('microsoft/callback')
  async microsoftCallback(@Query('code') code: string, @Res() res: Response) {
    const webUrl = this.config.get('WEB_URL') ?? 'http://localhost:3000';
    const user = await this.auth.handleMicrosoftCallback(code);
    const token = await this.auth.createSession(user.id);
    this.setSessionCookie(res, token);
    return res.redirect(`${webUrl}/dashboard`);
  }

  @Post('dev-login')
  async devLogin(
    @Body('username') username: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!username?.trim()) {
      throw new UnauthorizedException('Pseudo Minecraft requis');
    }
    const user = await this.auth.devLogin(username.trim());
    const token = await this.auth.createSession(user.id);
    this.setSessionCookie(res, token);
    return { success: true, user: { username: user.minecraftUsername } };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const token = req.cookies?.['redlakes_token'];
    if (!token) return { authenticated: false };
    const user = await this.auth.getMe(token);
    if (!user) return { authenticated: false };
    return {
      authenticated: true,
      user: {
        id: user.id,
        username: user.minecraftUsername,
        displayName: user.discordUsername ?? user.minecraftUsername,
        uuid: user.minecraftUuid,
        avatarUrl: user.avatarUrl,
        role: user.role,
        discordLinked: !!user.discordId,
        discordUsername: user.discordUsername,
        activeCharacter: user.activeCharacter,
      },
    };
  }

  @Post('discord/code')
  @UseGuards(AuthGuard)
  async discordLinkCode(@Req() req: Request & { user: { id: string } }) {
    return this.sync.createDiscordLinkCode(req.user.id);
  }

  @Post('discord/unlink')
  @UseGuards(AuthGuard)
  async discordUnlink(@Req() req: Request & { user: { id: string } }) {
    return this.sync.unlinkDiscord(req.user.id);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.['redlakes_token'];
    if (token) await this.auth.logout(token);
    res.clearCookie('redlakes_token');
    return { success: true };
  }

  private setSessionCookie(res: Response, token: string) {
    res.cookie('redlakes_token', token, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
