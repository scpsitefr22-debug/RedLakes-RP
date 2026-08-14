import { config } from "../config.js";

export interface PlayerProfile {
  minecraftUsername: string | null;
  avatarUrl: string | null;
  discordUsername: string | null;
  grade: string;
  faction: string;
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

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${config.apiBaseUrl}${path}`;
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
    throw new ApiError(0, `API injoignable (${config.apiBaseUrl}). ${String(err)}`);
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(data.message)) message = data.message.join(", ");
      else if (data.message) message = data.message;
    } catch {
      /* garde statusText */
    }
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
