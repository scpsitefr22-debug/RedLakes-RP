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
/** Échec passager (limite Mojang) : on ne réessaie pas tout de suite. */
const FAILURE_TTL_MS = 2 * 60 * 1000;

/** Pseudo → UUID : deux points d'accès Mojang, le second sert de secours. */
const PROFILE_LOOKUPS = [
  (name: string) =>
    `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(name)}`,
  (name: string) =>
    `https://api.minecraftservices.com/minecraft/profile/lookup/name/${encodeURIComponent(name)}`,
];

type Lookup<T> = { status: 'found'; value: T } | { status: 'missing' };

const NOT_FOUND = 'Aucun compte Minecraft officiel à ce pseudo.';
const UNAVAILABLE = 'Mojang ne répond pas pour le moment.';

/**
 * Skin Minecraft lu directement chez Mojang (pseudo → UUID → textures).
 * Les services d'avatars tiers (mc-heads, crafatar) renvoyaient le skin par
 * défaut (Steve/Alex) au lieu du vrai : on ne dépend plus d'eux. Depuis
 * l'hébergeur, Mojang limite par moments (adresse partagée) : second essai,
 * point d'accès de secours, et cache en mémoire des réussites comme des échecs.
 */
@Injectable()
export class SkinsService {
  private readonly logger = new Logger(SkinsService.name);
  private readonly cache = new Map<
    string,
    { value: MinecraftSkin | 'missing' | 'failed'; expires: number }
  >();

  async find(username: string): Promise<MinecraftSkin> {
    if (!USERNAME.test(username)) {
      throw new BadRequestException('Pseudo Minecraft invalide.');
    }
    const key = username.toLowerCase();
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return this.unwrap(cached.value);
    }

    let value: MinecraftSkin | 'missing' | 'failed';
    try {
      const found = await this.fetchFromMojang(username);
      value = found.status === 'found' ? found.value : 'missing';
    } catch (err) {
      this.logger.warn(`Skin de ${username} indisponible : ${String(err)}`);
      value = 'failed';
    }
    const ttl =
      value === 'failed'
        ? FAILURE_TTL_MS
        : value === 'missing'
          ? MISSING_TTL_MS
          : TTL_MS;
    this.cache.set(key, { value, expires: Date.now() + ttl });
    return this.unwrap(value);
  }

  private unwrap(value: MinecraftSkin | 'missing' | 'failed'): MinecraftSkin {
    if (value === 'missing') throw new NotFoundException(NOT_FOUND);
    if (value === 'failed') throw new BadGatewayException(UNAVAILABLE);
    return value;
  }

  /** GET JSON avec un second essai si Mojang limite (429) ou flanche (5xx). */
  private async getJson<T>(url: string): Promise<Lookup<T>> {
    for (let attempt = 1; ; attempt++) {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.status === 204 || res.status === 404)
        return { status: 'missing' };
      if (res.ok) return { status: 'found', value: (await res.json()) as T };
      if (attempt >= 2 || (res.status !== 429 && res.status < 500)) {
        throw new Error(`${new URL(url).host} ${res.status}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  private async findProfile(
    username: string,
  ): Promise<Lookup<{ id: string; name: string }>> {
    let lastError: unknown;
    for (const lookup of PROFILE_LOOKUPS) {
      try {
        return await this.getJson<{ id: string; name: string }>(
          lookup(username),
        );
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  }

  private async fetchFromMojang(
    username: string,
  ): Promise<Lookup<MinecraftSkin>> {
    const profile = await this.findProfile(username);
    if (profile.status === 'missing') return profile;

    const session = await this.getJson<{
      properties?: { name: string; value: string }[];
    }>(
      `https://sessionserver.mojang.com/session/minecraft/profile/${profile.value.id}`,
    );
    if (session.status === 'missing') return session;
    const encoded = session.value.properties?.find(
      (p) => p.name === 'textures',
    )?.value;
    if (!encoded) return { status: 'missing' };
    const textures = JSON.parse(
      Buffer.from(encoded, 'base64').toString('utf8'),
    ) as {
      textures?: { SKIN?: { url: string; metadata?: { model?: string } } };
    };
    const skin = textures.textures?.SKIN;
    if (!skin?.url) return { status: 'missing' };

    return {
      status: 'found',
      value: {
        username: profile.value.name,
        uuid: profile.value.id,
        skinUrl: skin.url.replace(/^http:\/\//, 'https://'),
        slim: skin.metadata?.model === 'slim',
      },
    };
  }
}
