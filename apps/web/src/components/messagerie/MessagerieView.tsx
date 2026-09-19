"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Send, User, MessageCircle, Briefcase, UserPlus, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";

type Channel = "PERSONNEL" | "PROFESSIONNEL";

const CHANNELS: { value: Channel; label: string; icon: typeof MessageCircle; hint: string }[] = [
  { value: "PERSONNEL", label: "Personnel", icon: MessageCircle, hint: "Hors-RP, entre joueurs" },
  { value: "PROFESSIONNEL", label: "Professionnel", icon: Briefcase, hint: "En personnage, voie hiérarchique" },
];

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

function ContactAvatar({ user, className = "h-9 w-9" }: { user: ApiUser; className?: string }) {
  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt={partnerName(user)}
        className={`${className} shrink-0 rounded-full border border-metal/50`}
      />
    );
  }
  return (
    <div
      className={`flex ${className} shrink-0 items-center justify-center rounded-full border border-metal/50 bg-redlake/10`}
    >
      <User className="h-4 w-4 text-gray-500" />
    </div>
  );
}

interface MessagerieViewProps {
  /** Hauteur de la zone défilante (liste + fil) — plein écran vs widget compact. */
  heightClass?: string;
  /** Appelé à chaque changement susceptible de faire évoluer le total non-lu (ouverture d'un fil, envoi). */
  onActivity?: () => void;
}

export function MessagerieView({ heightClass = "h-[65vh]", onActivity }: MessagerieViewProps) {
  const [channel, setChannel] = useState<Channel>("PERSONNEL");
  const [conversations, setConversations] = useState<ApiConversation[] | null>(null);
  const [activePartner, setActivePartner] = useState<ApiUser | null>(null);
  const [thread, setThread] = useState<ApiDmMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [contacts, setContacts] = useState<ApiUser[] | null>(null);
  const [contactFilter, setContactFilter] = useState("");

  const loadConversations = (ch: Channel = channel) => {
    apiFetch<ApiConversation[]>(`/core-dm/conversations?channel=${ch}`)
      .then(setConversations)
      .catch(() => setConversations([]));
  };

  useEffect(() => {
    setConversations(null);
    loadConversations(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  // Rafraîchissement en direct — évite de devoir fermer/rouvrir pour voir
  // arriver un message, comme une vraie messagerie. Fil actif : toutes les
  // 4s (silencieux, ne remet pas "Chargement…"). Sinon liste des
  // conversations : toutes les 12s, pour faire remonter les nouveaux fils.
  useEffect(() => {
    if (activePartner) {
      const id = setInterval(() => fetchThread(activePartner, { silent: true }), 4_000);
      return () => clearInterval(id);
    }
    const id = setInterval(() => loadConversations(), 12_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePartner, channel]);

  const switchChannel = (next: Channel) => {
    if (next === channel) return;
    setChannel(next);
    setActivePartner(null);
    setThread(null);
    setError(null);
  };

  const fetchThread = (partner: ApiUser, opts?: { silent?: boolean }) => {
    if (!opts?.silent) setThread(null);
    apiFetch<ApiDmMessage[]>(
      `/core-dm/with/${encodeURIComponent(partner.minecraftUsername)}?channel=${channel}`,
    )
      .then(setThread)
      .then(() => onActivity?.())
      .catch(() => {
        if (!opts?.silent) setThread([]);
      });
  };

  const openThread = (partner: ApiUser) => {
    setPickerOpen(false);
    setActivePartner(partner);
    setError(null);
    fetchThread(partner);
  };

  const openPicker = () => {
    setPickerOpen(true);
    setContactFilter("");
    if (contacts === null) {
      apiFetch<ApiUser[]>("/core-dm/contacts")
        .then(setContacts)
        .catch(() => setContacts([]));
    }
  };

  const filteredContacts = (contacts ?? []).filter((c) => {
    const q = contactFilter.trim().toLowerCase();
    if (!q) return true;
    return partnerName(c).toLowerCase().includes(q) || c.minecraftUsername.toLowerCase().includes(q);
  });

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !activePartner || sending) return;
    setSending(true);
    setError(null);
    try {
      await apiFetch("/core-dm", {
        method: "POST",
        body: JSON.stringify({ toUsername: activePartner.minecraftUsername, content, channel }),
      });
      setDraft("");
      fetchThread(activePartner);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setSending(false);
    }
  };

  const channelTabs = (
    <div className="mb-3 flex gap-1.5 border-b border-metal/40 pb-3">
      {CHANNELS.map((c) => {
        const Icon = c.icon;
        const active = c.value === channel;
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => switchChannel(c.value)}
            title={c.hint}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 font-mono text-xs transition-colors ${
              active
                ? "border-redlake bg-redlake/20 text-redlake-glow"
                : "border-metal/50 text-gray-500 hover:border-metal hover:text-white"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {c.label}
          </button>
        );
      })}
    </div>
  );

  // Vue fil de discussion
  if (activePartner) {
    return (
      <div className={`flex ${heightClass} flex-col`}>
        {channelTabs}
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

  // Vue sélecteur de contact — liste qu'on fait défiler, on clique sur
  // quelqu'un et son fil s'ouvre directement, plutôt que de taper un pseudo.
  if (pickerOpen) {
    return (
      <div className={`flex ${heightClass} flex-col`}>
        {channelTabs}
        <button
          type="button"
          onClick={() => setPickerOpen(false)}
          className="mb-3 flex items-center gap-1.5 font-mono text-[11px] text-gray-500 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Nouvelle discussion
        </button>
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
          <input
            value={contactFilter}
            onChange={(e) => setContactFilter(e.target.value)}
            placeholder="Filtrer un pseudo…"
            autoFocus
            className="w-full rounded border border-metal/50 bg-black/40 py-2 pl-8 pr-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake"
          />
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {contacts === null ? (
            <p className="text-sm text-gray-500">Chargement…</p>
          ) : filteredContacts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-600">Aucun agent ne correspond.</p>
          ) : (
            filteredContacts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => openThread(c)}
                className="flex w-full items-center gap-3 rounded border border-metal/40 bg-black/30 p-2.5 text-left hover:border-redlake/40"
              >
                <ContactAvatar user={c} className="h-8 w-8" />
                <p className="truncate text-sm font-medium text-white">{partnerName(c)}</p>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // Vue liste des conversations
  return (
    <div className={`flex ${heightClass} flex-col`}>
      {channelTabs}
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500">Conversations</p>
        <button
          type="button"
          onClick={openPicker}
          className="flex items-center gap-1.5 rounded border border-redlake/40 bg-redlake/10 px-2.5 py-1.5 font-mono text-[11px] text-redlake-glow transition-colors hover:bg-redlake/20"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Nouvelle discussion
        </button>
      </div>
      {error && <p className="mb-2 font-mono text-[10px] text-redlake-glow">{error}</p>}

      <div className="flex-1 space-y-2 overflow-y-auto">
        {conversations === null ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : conversations.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-600">
            Aucune conversation. Lancez-en une avec « Nouvelle discussion ».
          </p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.partner.id}
              type="button"
              onClick={() => openThread(c.partner)}
              className="flex w-full items-center gap-3 rounded border border-metal/40 bg-black/30 p-3 text-left hover:border-redlake/40"
            >
              <ContactAvatar user={c.partner} />
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
