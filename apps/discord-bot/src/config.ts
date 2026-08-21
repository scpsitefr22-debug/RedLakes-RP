import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Variable d'environnement manquante : ${name}. Verifie apps/discord-bot/.env`,
    );
  }
  return value.trim();
}

function optional(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

/** Corrige le JSON .env sous Windows (\" litteraux au lieu de guillemets) */
function normalizeJsonEnv(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("{\\") || trimmed.startsWith("[\\")) {
    return trimmed.replace(/\\"/g, '"');
  }
  return trimmed;
}

/** IDs separes par virgule/point-virgule/espace -> tableau nettoye */
function parseIdList(raw: string): string[] {
  return raw
    .split(/[,;\s]+/)
    .map((id) => id.trim())
    .filter(Boolean);
}

function parseRoleMap(raw: string): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(normalizeJsonEnv(raw)) as Record<string, string>;
  } catch {
    console.warn("[config] DISCORD_ROLE_MAP invalide (JSON attendu) — ignore");
    return {};
  }
}

/** Classification d'un salon écouté pour le flux "Transmissions de la Fondation" */
export interface ChannelClassification {
  /** Libellé RP affiché sur le site (ex. "Annonces", "Rapports d'incident") */
  label: string;
  /** Niveau d'habilitation requis sur le site (1 à 5) */
  clearance: number;
  /** Salon public : autorise l'affichage du pseudo + d'un extrait du message */
  public: boolean;
  /** Type de transmission ("message" par défaut, "announce" pour les annonces) */
  kind: "message" | "announce" | "event";
}

function parseChannelMap(raw: string): Record<string, ChannelClassification> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(normalizeJsonEnv(raw)) as Record<
      string,
      Partial<ChannelClassification>
    >;
    const out: Record<string, ChannelClassification> = {};
    for (const [id, v] of Object.entries(parsed)) {
      out[id] = {
        label: v.label?.toString() ?? "Secteur non répertorié",
        clearance: Math.min(Math.max(Number(v.clearance ?? 3), 1), 5),
        public: Boolean(v.public ?? false),
        kind: v.kind === "announce" || v.kind === "event" ? v.kind : "message",
      };
    }
    return out;
  } catch {
    console.warn("[config] DISCORD_CHANNEL_MAP invalide (JSON attendu) — ignore");
    return {};
  }
}

export const config = {
  token: required("DISCORD_BOT_TOKEN"),
  clientId: required("DISCORD_CLIENT_ID"),
  guildId: required("DISCORD_GUILD_ID"),

  apiBaseUrl: optional("API_BASE_URL", "http://localhost:3001/api"),
  syncApiKey: optional("SYNC_API_KEY"),

  /** Auto-creation des salons dans la categorie STAFF TECHNIQUE */
  setup: {
    /** true = cree/retrouve categorie + salons au demarrage */
    autoSetup: optional("DISCORD_AUTO_SETUP", "true") !== "false",
    /** test = prefixe [TEST] et salons test-* ; prod = noms finaux */
    mode: optional("DISCORD_SETUP_MODE", "test") === "prod" ? "prod" : "test",
    /** ID categorie existante (optionnel, sinon recherche/creation par nom) */
    categoryId: optional("DISCORD_CATEGORY_STAFF"),
    /** Nom categorie en mode prod (defaut : STAFF TECHNIQUE) */
    categoryName: optional("DISCORD_CATEGORY_NAME", ""),
  },

  /** Renseignes via .env ou auto-setup au demarrage */
  channels: {
    announces: optional("CHANNEL_ANNOUNCES"),
    welcome: optional("CHANNEL_WELCOME"),
    logs: optional("CHANNEL_LOGS"),
  },

  roleMap: parseRoleMap(optional("DISCORD_ROLE_MAP", "{}")),
  roleVerified: optional("ROLE_VERIFIED"),
  /**
   * IDs de roles Discord consideres "staff" en plus de la detection
   * automatique par permission (voir lib/member-roles staff sync) — utile
   * pour un role staff purement organisationnel sans vraie permission
   * Discord. Plusieurs IDs possibles, separes par virgule/espace.
   */
  roleStaffIds: parseIdList(optional("ROLE_STAFF")),

  /**
   * IDs de roles Discord nommes correspondant a chaque rang staff — sert a
   * detecter precisement le rang (au-dela du simple "a une permission
   * staff", voir roleStaffIds). Le role Discord "Fondateur" est inclus ici
   * mais ne fait jamais monter plus haut que Coordinateur Général cote site
   * automatiquement — ADMIN reste toujours decide a la main.
   */
  roleRankIds: {
    SURVEILLANT: parseIdList(optional("ROLE_RANK_SURVEILLANT")),
    OFFICIER: parseIdList(optional("ROLE_RANK_OFFICIER")),
    COORDINATEUR_GENERAL: parseIdList(optional("ROLE_RANK_COORDINATEUR_GENERAL")),
    FONDATEUR: parseIdList(optional("ROLE_RANK_FONDATEUR")),
  },

  /** Roles RP : scan, sync, creation et rangement auto */
  roles: {
    autoCreate: optional("DISCORD_AUTO_CREATE_ROLES", "false") === "true",
    /** Desactive par defaut — le rangement auto a deja casse l'ordre des roles en prod */
    autoOrganize: optional("DISCORD_AUTO_ORGANIZE_ROLES", "false") === "true",
    /** Supprime les doublons vides crees par le bot en bas de liste */
    removeDuplicates: optional("DISCORD_REMOVE_DUPLICATE_ROLES", "true") !== "false",
  },

  /** Pont Discord → Site (flux "Transmissions de la Fondation", thème SCP) */
  transmissions: {
    /** Interrupteur global du relais (true par défaut) */
    enabled: optional("DISCORD_TRANSMISSIONS", "true") !== "false",
    /** Relayer les arrivées/départs de membres */
    relayMembers: optional("DISCORD_RELAY_MEMBERS", "true") !== "false",
    /** Salons écoutés → classification RP (JSON) */
    channelMap: parseChannelMap(optional("DISCORD_CHANNEL_MAP", "{}")),
    /**
     * Active l'intent privilégié MessageContent pour inclure un extrait des
     * messages des salons PUBLICS. À n'activer QUE si l'intent est coché dans le
     * Developer Portal, sinon le bot refuse de se connecter.
     */
    enableMessageContent:
      optional("DISCORD_ENABLE_MESSAGE_CONTENT", "false") === "true",
  },

  discordInvite: optional("DISCORD_INVITE", "https://discord.gg/d5DqcZEJkn"),
  minecraftIp: optional("MINECRAFT_IP", "play.redlakes.fr"),
  serverOpen: optional("SERVER_OPEN", "false") === "true",
  siteUrl: optional("SITE_URL", "http://localhost:3000"),
};

export type BotConfig = typeof config;
