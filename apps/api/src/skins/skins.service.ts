import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

export interface MinecraftSkin {
  username: string;
  uuid: string;
  /** Texture du skin (64×64), en https. */
  skinUrl: string;
  /** Modèle « Alex » (bras fins). */
  slim: boolean;
}

const USERNAME = /^[A-Za-z0-9_]{3,16}$/;
const TTL_MS = 6 * 60 * 60 * 1000;
const MISSING_TTL_MS = 30 * 60 * 1000;

/**
 * Skin Minecraft lu directement chez Mojang (pseudo → UUID → textures).
 * Les services d'avatars tiers (mc-heads, crafatar) renvoyaient le skin par
 * défaut (Steve/Alex) au lieu du vrai : on ne dépend plus d'eux. Cache en
 * mémoire pour rester loin des limites de l'API Mojang.
 */
@Injectable()
export class SkinsService {
  private readonly logger = new Logger(SkinsService.name);
  private readonly cache = new Map<
    string,
    { value: MinecraftSkin | null; expires: number }
  >();

  async find(username: string): Promise<MinecraftSkin> {
    if (!USERNAME.test(username)) {
      throw new BadRequestException('Pseudo Minecraft invalide.');
    }
    const key = username.toLowerCase();
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      if (!cached.value)
        throw new NotFoundException(
          'Aucun compte Minecraft officiel à ce pseudo.',
        );
      return cached.value;
    }

    const value = await this.fetchFromMojang(username);
    this.cache.set(key, {
      value,
      expires: Date.now() + (value ? TTL_MS : MISSING_TTL_MS),
    });
    if (!value)
      throw new NotFoundException(
        'Aucun compte Minecraft officiel à ce pseudo.',
      );
    return value;
  }

  private async fetchFromMojang(
    username: string,
  ): Promise<MinecraftSkin | null> {
    try {
      const profileRes = await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`,
        { signal: AbortSignal.timeout(8000) },
      );
      // 204/404 : pseudo inconnu (compte non officiel).
      if (profileRes.status === 204 || profileRes.status === 404) return null;
      if (!profileRes.ok) throw new Error(`profil ${profileRes.status}`);
      const profile = (await profileRes.json()) as { id: string; name: string };

      const sessionRes = await fetch(
        `https://sessionserver.mojang.com/session/minecraft/profile/${profile.id}`,
        { signal: AbortSignal.timeout(8000) },
      );
      if (!sessionRes.ok) throw new Error(`textures ${sessionRes.status}`);
      const session = (await sessionRes.json()) as {
        properties?: { name: string; value: string }[];
      };
      const encoded = session.properties?.find(
        (p) => p.name === 'textures',
      )?.value;
      if (!encoded) return null;
      const textures = JSON.parse(
        Buffer.from(encoded, 'base64').toString('utf8'),
      ) as {
        textures?: { SKIN?: { url: string; metadata?: { model?: string } } };
      };
      const skin = textures.textures?.SKIN;
      if (!skin?.url) return null;

      return {
        username: profile.name,
        uuid: profile.id,
        skinUrl: skin.url.replace(/^http:\/\//, 'https://'),
        slim: skin.metadata?.model === 'slim',
      };
    } catch (err) {
      this.logger.warn(`Skin de ${username} indisponible : ${String(err)}`);
      throw new BadGatewayException('Mojang ne répond pas pour le moment.');
    }
  }
}
