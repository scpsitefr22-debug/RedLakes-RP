import { config } from "../config.js";

export interface GradeInfo {
  id: string;
  slug: string;
  name: string;
  branch: string;
  tier: string;
  pay: number | null;
  quota: number | null;
  clearance: number;
  departmentRef?: { id: string; slug: string; name: string } | null;
}

export interface FactionInfo {
  id: string;
  slug: string;
  name: string;
  color: string | null;
}

export interface FactionSummary {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  color: string | null;
  clearance: number;
  departments: { id: string; name: string }[];
}

export interface FactionDetail extends FactionSummary {
  description: string | null;
  objectives: string[];
}

export interface DepartmentSummary {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  clearance: number;
  faction: { slug: string; name: string; color: string | null } | null;
  _count: { grades: number; teams: number };
}

export interface DepartmentDetail {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  clearance: number;
  omegaTier: string | null;
  utilities: string[];
  objectives: string[];
  faction: { slug: string; name: string; color: string | null } | null;
  grades: { name: string; pay: number | null }[];
  teams: { name: string; category: string }[];
}

export interface PlayerProfile {
  minecraftUsername: string | null;
  avatarUrl: string | null;
  discordUsername: string | null;
  grade: string;
  gradeInfo?: GradeInfo | null;
  faction: string;
  factionInfo?: FactionInfo | null;
  teamName: string | null;
  rpFirstName: string | null;
  rpLastName: string | null;
  playtime: number;
  reputation: number;
  sanctions: number;
  clearance: number;
  medals: string[];
  roleUpdatedAt: string;
  seniority: string;
}

export interface TransmissionItem {
  id: string;
  type: "MESSAGE" | "ANNOUNCE" | "MEMBER_JOIN" | "MEMBER_LEAVE" | "EVENT" | "BOOST";
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

export interface DiscordEventPayload {
  type: "MESSAGE" | "ANNOUNCE" | "MEMBER_JOIN" | "MEMBER_LEAVE" | "EVENT" | "BOOST";
  discordMessageId?: string;
  channelId?: string;
  channelLabel?: string;
  clearance?: number;
  isPublic?: boolean;
  authorId?: string;
  authorDisplay?: string;
  contentExcerpt?: string;
  occurredAt?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Messages d'erreur toujours presentables a un joueur Discord — jamais d'URL
 * interne, de stack JS ou de code HTTP brut. Le detail technique (endpoint,
 * statut, duree) part uniquement en console, jamais dans l'embed.
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${config.apiBaseUrl}${path}`;
  const startedAt = Date.now();
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Redlakes-Sync-Key": config.syncApiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.warn(`[api] ${method} ${path} injoignable apres ${Date.now() - startedAt}ms :`, err);
    throw new ApiError(
      0,
      "⚠️ Impossible de contacter REDLAKES CORE. Le service semble indisponible — réessaie dans quelques instants.",
    );
  }

  if (!res.ok) {
    let message: string | undefined;
    try {
      const data = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(data.message)) message = data.message.join(", ");
      else if (data.message) message = data.message;
    } catch {
      /* pas de corps JSON exploitable */
    }
    if (!message) {
      message =
        res.status >= 500
          ? "⚠️ REDLAKES CORE rencontre un problème technique — réessaie dans quelques instants."
          : res.status === 401 || res.status === 403
            ? "Accès refusé par REDLAKES CORE."
            : res.statusText || "Erreur inconnue.";
    }
    console.warn(`[api] ${method} ${path} -> ${res.status} apres ${Date.now() - startedAt}ms : ${message}`);
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  /** Lie un compte Discord a un compte Minecraft via un code genere sur le site */
  linkDiscord(params: {
    code: string;
    discordId: string;
    discordUsername?: string;
  }) {
    return request<{ success: boolean; minecraftUsername: string }>(
      "POST",
      "/sync/discord/link",
      params,
    );
  },

  unlinkDiscord(discordId: string) {
    return request<{ success: boolean; minecraftUsername: string | null }>(
      "POST",
      "/sync/discord/unlink",
      { discordId },
    );
  },

  getProfileByDiscord(discordId: string) {
    return request<PlayerProfile>(
      "GET",
      `/sync/discord/${encodeURIComponent(discordId)}`,
    );
  },

  /** Fiche publique d'un joueur par pseudo Minecraft (recherche staff) */
  getPlayer(username: string) {
    return request<PlayerProfile>("GET", `/players/${encodeURIComponent(username)}`);
  },

  /** Dernieres transmissions publiques (flux "Transmissions de la Fondation") */
  getTransmissions(limit = 5) {
    return request<TransmissionItem[]>("GET", `/transmissions?limit=${limit}`);
  },

  /** Catalogue complet des grades Site-12 -- source de verite CORE (public) */
  getGrades() {
    return request<GradeInfo[]>("GET", "/grades");
  },

  /** Catalogue des factions -- source de verite CORE (public) */
  getFactions() {
    return request<FactionSummary[]>("GET", "/factions");
  },

  getFaction(slug: string) {
    return request<FactionDetail>("GET", `/factions/${encodeURIComponent(slug)}`);
  },

  /** Catalogue des departements -- source de verite CORE (public) */
  getDepartments(factionSlug?: string) {
    const qs = factionSlug ? `?faction=${encodeURIComponent(factionSlug)}` : "";
    return request<DepartmentSummary[]>("GET", `/departments${qs}`);
  },

  getDepartment(slug: string) {
    return request<DepartmentDetail>("GET", `/departments/${encodeURIComponent(slug)}`);
  },

  /** Relaie un évènement Discord à l'API (flux RP "Transmissions de la Fondation") */
  sendDiscordEvent(payload: DiscordEventPayload) {
    return request<{ success: boolean; id?: string }>(
      "POST",
      "/sync/discord/event",
      payload,
    );
  },

  /** Met a jour le grade sur le site quand le role Discord change */
  syncGradeFromDiscord(params: {
    discordId: string;
    grade: string;
    discordRoleName?: string;
  }) {
    return request<{
      success: boolean;
      grade: string;
      previousGrade?: string;
      minecraftUsername: string | null;
      unchanged?: boolean;
    }>("POST", "/sync/discord/grade", params);
  },

  /** Promeut STAFF sur le site quand le role Discord "Staff" est detecte (jamais de retrogradation) */
  syncStaffRoleFromDiscord(params: {
    discordId: string;
    hasStaffRole: boolean;
    staffRank?: "SURVEILLANT" | "OFFICIER" | "COORDINATEUR_GENERAL";
  }) {
    return request<{
      success: boolean;
      unchanged: boolean;
      role: string;
      staffRank?: string | null;
      previousRole?: string;
      previousRank?: string | null;
      minecraftUsername?: string | null;
    }>("POST", "/sync/discord/staff-role", params);
  },

  updateRpIdentity(params: {
    discordId: string;
    rpFirstName?: string;
    rpLastName?: string;
  }) {
    return request<{
      success: boolean;
      rpFirstName: string | null;
      rpLastName: string | null;
      discordSynced: boolean;
    }>("PATCH", "/sync/discord/identity", params);
  },

  listPendingReports() {
    return request<
      {
        id: string;
        type: string;
        subject: string;
        content: string;
        createdAt: string;
        user: {
          minecraftUsername: string | null;
          player?: {
            grade: string;
            rpFirstName?: string | null;
            rpLastName?: string | null;
          };
        };
      }[]
    >("GET", "/sync/reports/pending");
  },

  async isOnline(): Promise<boolean> {
    try {
      const res = await fetch(`${config.apiBaseUrl}/players`, {
        signal: AbortSignal.timeout(4000),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
