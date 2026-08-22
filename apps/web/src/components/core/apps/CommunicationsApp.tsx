"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCoreShell } from "@/components/core/CoreShellProvider";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";
import type { PaginatedResult } from "@/lib/platform-types";

interface ApiCoreMessage {
  id: string;
  authorId: string;
  authorLabel: string;
  factionId: string | null;
  content: string;
  createdAt: string;
}

export function CommunicationsApp() {
  const { session } = useCoreShell();
  const [messages, setMessages] = useState<ApiCoreMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const load = () => {
    apiFetch<PaginatedResult<ApiCoreMessage>>("/core-messages/me?limit=50")
      .then((res) => setMessages(res.items))
      .catch(() => setMessages([]));
  };

  useEffect(load, []);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      await apiFetch("/core-messages", { method: "POST", body: JSON.stringify({ content }) });
      setDraft("");
      load();
    } catch {
      /* ignore — le message reste dans le champ, l'agent peut réessayer */
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[60vh] flex-col">
      <p className="mb-3 font-mono text-[10px] text-gray-600">
        Canal partagé — {session.vocab.network}. Visible par tout le personnel de cette faction.
      </p>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {messages === null ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-600">
            Aucune transmission pour le moment. Soyez le premier.
          </p>
        ) : (
          [...messages].reverse().map((m) => (
            <div key={m.id} className="rounded border border-metal/40 bg-black/30 px-3 py-2">
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="text-xs font-bold text-redlake-glow">{m.authorLabel}</span>
                <span className="font-mono text-[9px] text-gray-600">
                  {new Date(m.createdAt).toLocaleString("fr-FR")}
                </span>
              </div>
              <DiscordMarkdown text={m.content} className="text-sm text-gray-300" />
            </div>
          ))
        )}
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2 border-t border-metal/40 pt-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écrire une transmission…"
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
    </div>
  );
}
