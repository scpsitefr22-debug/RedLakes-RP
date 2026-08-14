"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquare, Send, Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  type PaginatedResult,
  type PlatformComment,
  type PlatformEntityType,
  buildQueryString,
} from "@/lib/platform-types";
import { cn } from "@/lib/utils";

interface EntityCommentsProps {
  entityType: PlatformEntityType;
  entityId: string;
  canPost?: boolean;
  canPostInternal?: boolean;
  className?: string;
}

export function EntityComments({
  entityType,
  entityId,
  canPost = true,
  canPostInternal = false,
  className,
}: EntityCommentsProps) {
  const [comments, setComments] = useState<PlatformComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<PaginatedResult<PlatformComment>>(
        `/platform/comments/${entityType}/${entityId}${buildQueryString({ limit: 50 })}`,
      );
      setComments(res.items);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/platform/comments", {
        method: "POST",
        body: JSON.stringify({
          entityType,
          entityId,
          body: body.trim(),
          internal: canPostInternal && internal,
        }),
      });
      setBody("");
      setInternal(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("rounded border border-metal/30 bg-black/20 p-4", className)}>
      <h4 className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase text-gray-500">
        <MessageSquare className="h-3.5 w-3.5" />
        Commentaires ({comments.length})
      </h4>

      {loading ? (
        <p className="flex items-center gap-2 text-xs text-gray-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          Chargement…
        </p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-600">Aucun commentaire pour le moment.</p>
      ) : (
        <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto">
          {comments.map((c) => (
            <li
              key={c.id}
              className={cn(
                "rounded border px-3 py-2 text-xs",
                c.internal
                  ? "border-yellow-400/20 bg-yellow-400/5"
                  : "border-metal/30 bg-black/30",
              )}
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-medium text-white">
                  {c.author.minecraftUsername ??
                    c.author.discordUsername ??
                    "Agent"}
                </span>
                {c.internal && (
                  <span className="flex items-center gap-0.5 font-mono text-[9px] text-yellow-400">
                    <Lock className="h-2.5 w-2.5" />
                    Interne staff
                  </span>
                )}
                <span className="ml-auto font-mono text-[9px] text-gray-600">
                  {new Date(c.createdAt).toLocaleString("fr-FR")}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-gray-400">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {canPost && (
        <form onSubmit={submit} className="space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            maxLength={4000}
            placeholder="Ajouter un commentaire…"
            className="w-full rounded border border-metal bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-redlake/50"
          />
          {canPostInternal && (
            <label className="flex items-center gap-2 font-mono text-[10px] text-gray-500">
              <input
                type="checkbox"
                checked={internal}
                onChange={(e) => setInternal(e.target.checked)}
                className="rounded border-metal"
              />
              Commentaire interne (staff uniquement)
            </label>
          )}
          {error && <p className="text-[10px] text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="flex items-center gap-1 rounded border border-redlake/30 px-3 py-1.5 font-mono text-[10px] text-redlake-glow hover:text-white disabled:opacity-40"
          >
            <Send className="h-3 w-3" />
            {submitting ? "Envoi…" : "Publier"}
          </button>
        </form>
      )}
    </div>
  );
}
