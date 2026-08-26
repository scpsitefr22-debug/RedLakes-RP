"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Send, User } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";

interface ApiUser {
  id: string;
  minecraftUsername: string;
  discordUsername: string | null;
  avatarUrl: string | null;
}

interface ApiConversation {
  partner: ApiUser;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
}

interface ApiDmMessage {
  id: string;
  senderId: string;
  senderLabel: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

function partnerName(u: ApiUser) {
  return u.discordUsername ?? u.minecraftUsername;
}

export function MessagerieApp() {
  const [conversations, setConversations] = useState<ApiConversation[] | null>(null);
  const [activePartner, setActivePartner] = useState<ApiUser | null>(null);
  const [thread, setThread] = useState<ApiDmMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const loadConversations = () => {
    apiFetch<ApiConversation[]>("/core-dm/conversations")
      .then(setConversations)
      .catch(() => setConversations([]));
  };

  useEffect(loadConversations, []);

  const openThread = (partner: ApiUser) => {
    setActivePartner(partner);
    setThread(null);
    setError(null);
    apiFetch<ApiDmMessage[]>(`/core-dm/with/${encodeURIComponent(partner.minecraftUsername)}`)
      .then(setThread)
      .catch(() => setThread([]));
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    const toUsername = activePartner?.minecraftUsername ?? newRecipient.trim();
    if (!content || !toUsername || sending) return;
    setSending(true);
    setError(null);
    try {
      await apiFetch("/core-dm", {
        method: "POST",
        body: JSON.stringify({ toUsername, content }),
      });
      setDraft("");
      if (activePartner) {
        openThread(activePartner);
      } else {
        setNewRecipient("");
        loadConversations();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setSending(false);
    }
  };

  // Vue fil de discussion
  if (activePartner) {
    return (
      <div className="flex h-[55vh] flex-col">
        <button
          type="button"
          onClick={() => {
            setActivePartner(null);
            loadConversations();
          }}
          className="mb-3 flex items-center gap-1.5 font-mono text-[11px] text-gray-500 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {partnerName(activePartner)}
        </button>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {thread === null ? (
            <p className="text-sm text-gray-500">Chargement…</p>
          ) : thread.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-600">
              Aucun message échangé pour le moment.
            </p>
          ) : (
            thread.map((m) => (
              <div key={m.id} className="rounded border border-metal/40 bg-black/30 px-3 py-2">
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-redlake-glow">{m.senderLabel}</span>
                  <span className="font-mono text-[9px] text-gray-600">
                    {new Date(m.createdAt).toLocaleString("fr-FR")}
                  </span>
                </div>
                <DiscordMarkdown text={m.content} className="text-sm text-gray-300" />
              </div>
            ))
          )}
        </div>

        <form onSubmit={sendMessage} className="mt-3 flex gap-2 border-t border-metal/40 pt-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Écrire à ${partnerName(activePartner)}…`}
            maxLength={2000}
            className="flex-1 rounded border border-metal/50 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="rounded border border-redlake bg-redlake/20 px-4 py-2 text-redlake-glow transition-colors hover:bg-redlake/30 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        {error && <p className="mt-1 font-mono text-[10px] text-redlake-glow">{error}</p>}
      </div>
    );
  }

  // Vue liste des conversations
  return (
    <div className="flex h-[55vh] flex-col">
      <form onSubmit={sendMessage} className="mb-3 flex gap-2">
        <input
          value={newRecipient}
          onChange={(e) => setNewRecipient(e.target.value)}
          placeholder="Pseudo Minecraft du destinataire…"
          className="flex-1 rounded border border-metal/50 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake"
        />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message…"
          maxLength={2000}
          className="flex-1 rounded border border-metal/50 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim() || !newRecipient.trim()}
          className="rounded border border-redlake bg-redlake/20 px-3 py-2 text-redlake-glow transition-colors hover:bg-redlake/30 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      {error && <p className="mb-2 font-mono text-[10px] text-redlake-glow">{error}</p>}

      <div className="flex-1 space-y-2 overflow-y-auto">
        {conversations === null ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : conversations.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-600">
            Aucune conversation. Écrivez à un pseudo ci-dessus pour commencer.
          </p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.partner.id}
              type="button"
              onClick={() => openThread(c.partner)}
              className="flex w-full items-center gap-3 rounded border border-metal/40 bg-black/30 p-3 text-left hover:border-redlake/40"
            >
              {c.partner.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.partner.avatarUrl}
                  alt={partnerName(c.partner)}
                  className="h-9 w-9 rounded-full border border-metal/50"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-metal/50 bg-redlake/10">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-white">{partnerName(c.partner)}</p>
                  {c.unreadCount > 0 && (
                    <span className="rounded-full bg-redlake px-1.5 py-0.5 text-[9px] font-bold text-white">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-gray-500">{c.lastMessage}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
