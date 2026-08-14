export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export type PlatformEntityType =
  | "PERSONNEL_REPORT"
  | "APPLICATION"
  | "LORE_ARTICLE"
  | "PLAYER"
  | "USER";

export type AuditAction =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "ARCHIVED"
  | "RESTORED"
  | "REVIEWED"
  | "STATUS_CHANGED"
  | "COMMENT_ADDED"
  | "CLEARANCE_CHANGED"
  | "ROLE_CHANGED";

export interface AuditLogEntry {
  id: string;
  entityType: PlatformEntityType;
  entityId: string;
  action: AuditAction;
  actorId?: string | null;
  actorLabel?: string | null;
  summary: string;
  metadata?: Record<string, unknown> | null;
  clearance: number;
  createdAt: string;
  actor?: {
    minecraftUsername: string | null;
    discordUsername: string | null;
  } | null;
}

export interface PlatformComment {
  id: string;
  entityType: PlatformEntityType;
  entityId: string;
  body: string;
  internal: boolean;
  createdAt: string;
  author: {
    minecraftUsername: string | null;
    discordUsername: string | null;
    role: string;
  };
}

export interface PlatformNotification {
  id: string;
  title: string;
  body: string;
  entityType?: PlatformEntityType | null;
  entityId?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationsPage extends PaginatedResult<PlatformNotification> {
  unreadCount: number;
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      q.set(key, String(value));
    }
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATED: "Création",
  UPDATED: "Mise à jour",
  DELETED: "Suppression",
  ARCHIVED: "Archivage",
  RESTORED: "Restauration",
  REVIEWED: "Traitement",
  STATUS_CHANGED: "Changement de statut",
  COMMENT_ADDED: "Commentaire",
  CLEARANCE_CHANGED: "Habilitation modifiée",
  ROLE_CHANGED: "Rôle modifié",
};
