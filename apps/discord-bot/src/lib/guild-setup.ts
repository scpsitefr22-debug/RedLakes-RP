import {
  CategoryChannel,
  ChannelType,
  Guild,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { config, type ChannelClassification } from "../config.js";

const CATEGORY_PROD = "🛡 | 【🛠 STAFF TECHNIQUE】";
const CATEGORY_TEST = "[TEST] 🛡 | 【🛠 STAFF TECHNIQUE】";

interface ChannelSpec {
  slug: string;
  configKey: "logs" | "welcome" | "announces" | null;
  topic: string;
  channelMap?: ChannelClassification;
}

const CHANNEL_SPECS: ChannelSpec[] = [
  {
    slug: "logs-bot",
    configKey: "logs",
    topic: "Logs automatiques du bot REDLAKES (liaisons, erreurs).",
  },
  {
    slug: "bienvenue",
    configKey: "welcome",
    topic: "Accueil des nouveaux agents de la Fondation.",
  },
  {
    slug: "annonces-fondation",
    configKey: "announces",
    topic: "Communiques et promotions relayes vers le site.",
    channelMap: {
      label: "Annonces Fondation",
      clearance: 1,
      public: true,
      kind: "announce",
    },
  },
  {
    slug: "transmissions-site",
    configKey: null,
    topic: "Flux Discord -> Site (Transmissions de la Fondation).",
    channelMap: {
      label: "Transmissions Site-12",
      clearance: 2,
      public: false,
      kind: "message",
    },
  },
];

function resolveCategoryName(): string {
  if (config.setup.mode === "test") return CATEGORY_TEST;
  return config.setup.categoryName || CATEGORY_PROD;
}

function channelSlug(slug: string): string {
  if (config.setup.mode === "test") return `test-${slug}`;
  return slug;
}

function findTextChannel(
  guild: Guild,
  parentId: string,
  name: string,
): TextChannel | undefined {
  const found = guild.channels.cache.find(
    (c) =>
      c.type === ChannelType.GuildText &&
      c.parentId === parentId &&
      c.name === name,
  );
  return found instanceof TextChannel ? found : undefined;
}

async function resolveCategory(
  guild: Guild,
  categoryName: string,
): Promise<CategoryChannel | null> {
  if (config.setup.categoryId) {
    const existing = await guild.channels.fetch(config.setup.categoryId);
    if (existing?.type === ChannelType.GuildCategory) {
      console.log(
        `[setup] Categorie existante : ${existing.name} (${existing.id})`,
      );
      return existing;
    }
    console.warn(
      `[setup] DISCORD_CATEGORY_STAFF invalide (${config.setup.categoryId})`,
    );
  }

  const cached = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && c.name === categoryName,
  );
  if (cached instanceof CategoryChannel) return cached;

  const me = guild.members.me;
  if (!me?.permissions.has(PermissionFlagsBits.ManageChannels)) {
    console.warn(
      '[setup] Permission "Gerer les salons" manquante — impossible de creer la categorie.',
    );
    return null;
  }

  const created = await guild.channels.create({
    name: categoryName,
    type: ChannelType.GuildCategory,
    reason: "REDLAKES bot — auto-setup STAFF TECHNIQUE",
  });
  console.log(`[setup] Categorie creee : ${categoryName} (${created.id})`);
  return created;
}

/** Range les salons du bot dans un ordre logique au sein de la categorie */
async function organizeCategoryChannels(
  guild: Guild,
  category: CategoryChannel,
): Promise<void> {
  const me = guild.members.me;
  if (!me?.permissions.has(PermissionFlagsBits.ManageChannels)) return;

  const orderedSlugs = CHANNEL_SPECS.map((s) => channelSlug(s.slug));
  const channels: TextChannel[] = [];

  for (const name of orderedSlugs) {
    const ch = findTextChannel(guild, category.id, name);
    if (ch) channels.push(ch);
  }

  for (let i = 0; i < channels.length; i++) {
    await channels[i]
      .setPosition(i, { reason: "Ordre salons REDLAKES" })
      .catch(() => undefined);
  }

  if (channels.length) {
    console.log(`[setup] ${channels.length} salon(s) ranges dans ${category.name}`);
  }
}

/**
 * Cree (ou retrouve) la categorie STAFF TECHNIQUE et les salons du bot.
 * En mode test : prefixe [TEST] sur la categorie et test- sur les salons.
 * Les IDs deja renseignes dans .env ne sont pas ecrases.
 */
export async function setupGuildChannels(guild: Guild): Promise<void> {
  if (!config.setup.autoSetup) return;

  const categoryName = resolveCategoryName();
  if (config.setup.categoryId) {
    console.log(
      `[setup] Mode ${config.setup.mode} — categorie ID ${config.setup.categoryId}`,
    );
  } else {
    console.log(`[setup] Mode ${config.setup.mode} — categorie cible : ${categoryName}`);
  }

  const category = await resolveCategory(guild, categoryName);
  if (!category) return;

  const me = guild.members.me;
  const canManage = me?.permissions.has(PermissionFlagsBits.ManageChannels);

  for (const spec of CHANNEL_SPECS) {
    const name = channelSlug(spec.slug);

    if (spec.configKey && config.channels[spec.configKey]) {
      const existingId = config.channels[spec.configKey];
      if (existingId) {
        if (spec.channelMap && !config.transmissions.channelMap[existingId]) {
          config.transmissions.channelMap[existingId] = spec.channelMap;
        }
        continue;
      }
    }

    let channel = findTextChannel(guild, category.id, name);

    if (!channel && canManage) {
      channel = await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        parent: category.id,
        topic: spec.topic,
        reason: `REDLAKES bot — auto-setup (${config.setup.mode})`,
      });
      console.log(`[setup] Salon cree : #${name} (${channel.id})`);
    } else if (!channel) {
      console.warn(`[setup] Salon #${name} introuvable et creation impossible.`);
      continue;
    } else {
      console.log(`[setup] Salon existant : #${name} (${channel.id})`);
    }

    if (spec.configKey) {
      config.channels[spec.configKey] = channel.id;
    }
    if (spec.channelMap) {
      config.transmissions.channelMap[channel.id] = spec.channelMap;
    }
  }

  await organizeCategoryChannels(guild, category);

  console.log("[setup] Configuration active :");
  console.log("  CHANNEL_LOGS      :", config.channels.logs || "(vide)");
  console.log("  CHANNEL_WELCOME   :", config.channels.welcome || "(vide)");
  console.log("  CHANNEL_ANNOUNCES :", config.channels.announces || "(vide)");
  console.log(
    "  DISCORD_CHANNEL_MAP :",
    Object.keys(config.transmissions.channelMap).length,
    "salon(s)",
  );
}
