"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Send, User, MessageCircle, Briefcase, UserPlus, Search, MessagesSquare } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { cn } from "@/lib/utils";

type Channel = "PERSONNEL" | "PROFESSIONNEL";

const CHANNELS: { value: Channel; label: string; icon: typeof MessageCircle; hint: string }[] = [
  { value: "PERSONNEL", label: "Personnel", icon: MessageCircle, hint: "Hors-RP, entre joueurs" },
  { value: "PROFESSIONNEL", label: "Professionnel", icon: Briefcase, hint: "En personnage, voie hiérarchique" },
];

interface ApiUser {
  id: string;
  minecraftUsername: string | null;
  username: string | null;
  discordUsername: string | null;
  avatarUrl: string | null;
  activeCharacter: { rpFirstName: string | null; rpLastName: string | null; grade: string } | null;
}

/** Identifiant à envoyer à l'API pour viser ce compte — pseudo Minecraft, ou pseudo de connexion s'il n'a pas encore lié Minecraft. */
function identifierOf(u: ApiUser) {
  return u.minecraftUsername ?? u.username ?? "";
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

/**
 * En Professionnel (RP, voie hiérarchique) on adresse le personnage — nom
 * RP, éventuellement son grade en dessous. En Personnel (hors-RP) on
 * adresse le compte (Discord/Minecraft) : jamais l'identité RP hors-RP.
 */
function partnerName(u: ApiUser, channel: Channel) {
  if (channel === "PROFESSIONNEL" && u.activeCharacter) {
    const rp = [u.activeCharacter.rpFirstName, u.activeCharacter.rpLastName].filter(Boolean).join(" ");
    if (rp) return rp;
  }
  return u.discordUsername ?? u.minecraftUsername ?? u.username ?? "Agent";
}

function partnerGrade(u: ApiUser, channel: Channel) {
  return channel === "PROFESSIONNEL" ? (u.activeCharacter?.grade ?? null) : null;
}

/** Heure si c'est aujourd'hui, sinon la date courte. */
function shortTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date().toDateString() === d.toDateString();
  return new Intl.DateTimeFormat("fr-FR", today ? { hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "short" }).format(d);
}

function dayLabel(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));
}

function ContactAvatar({ user, channel, className = "h-10 w-10" }: { user: ApiUser; channel: Channel; className?: string }) {
  if (user.avatarUrl || user.minecraftUsername) {
    return (
      <PlayerAvatar
        avatarUrl={user.avatarUrl}
        minecraftUsername={user.minecraftUsername}
        alt={partnerName(user, channel)}
        className={`${className} shrink-0 border border-line-strong`}
      />
    );
  }
  return (
    <div className={`flex ${className} shrink-0 items-center justify-center border border-line-strong bg-black/40`}>
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

/**
 * Messagerie entre agents. Assez large (page), elle montre la liste et le
 * fil côte à côte ; étroite (téléphone, fenêtre flottante), un seul volet à
 * la fois — d'où les requêtes de conteneur (@3xl).
 */
export function MessagerieView({ heightClass = "h-[65vh]", onActivity }: MessagerieViewProps) {
  const searchParams = useSearchParams();
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
  const [myId, setMyId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<{ user?: { id: string } }>("/auth/me")
      .then((res) => setMyId(res.user?.id ?? null))
      .catch(() => setMyId(null));
  }, []);

  const loadConversations = (ch: Channel = channel) => {
    apiFetch<ApiConversation[]>(`/core-dm/conversations?channel=${ch}`)
      .then(setConversations)
      .catch(() => setConversations([]));
  };

  // Le canal est passé explicitement : juste après un changement de canal
  // (lien depuis une notification), l'état `channel` n'est pas encore à jour.
  const fetchThread = (partner: ApiUser, opts?: { silent?: boolean; channel?: Channel }) => {
    if (!opts?.silent) setThread(null);
    const ch = opts?.channel ?? channel;
    apiFetch<ApiDmMessage[]>(`/core-dm/with/${encodeURIComponent(identifierOf(partner))}?channel=${ch}`)
      .then(setThread)
      .then(() => onActivity?.())
      .catch(() => {
        if (!opts?.silent) setThread([]);
      });
  };

  const openThread = (partner: ApiUser, ch: Channel = channel) => {
    setPickerOpen(false);
    setActivePartner(partner);
    setError(null);
    fetchThread(partner, { channel: ch });
  };

  useEffect(() => {
    setConversations(null);
    loadConversations(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  // Rafraîchissement en direct — évite de devoir fermer/rouvrir pour voir
  // arriver un message, comme une vraie messagerie. Fil actif : toutes les
  // 4s (silencieux, ne remet pas "Chargement…"). Liste des conversations :
  // toutes les 12s, pour faire remonter les nouveaux fils.
  useEffect(() => {
    if (activePartner) {
      const id = setInterval(() => fetchThread(activePartner, { silent: true }), 4_000);
      return () => clearInterval(id);
    }
    const id = setInterval(() => loadConversations(), 12_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePartner, channel]);

  // Le fil s'ouvre sur le dernier message.
  const lastMessageId = thread?.[thread.length - 1]?.id;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lastMessageId]);

  const switchChannel = (next: Channel) => {
    if (next === channel) return;
    setChannel(next);
    setActivePartner(null);
    setThread(null);
    setError(null);
  };

  // Arrivée depuis une notification (?dm=<messageId>) — ouvre directement le
  // fil concerné au lieu de la liste des conversations. Une seule fois au
  // montage : le param ne doit pas rouvrir le fil si l'utilisateur navigue
  // ailleurs dans la messagerie ensuite.
  useEffect(() => {
    const dm = searchParams.get("dm");
    if (!dm) return;
    apiFetch<{ channel: Channel; partner: ApiUser }>(`/core-dm/message/${dm}`)
      .then(({ channel: dmChannel, partner }) => {
        setChannel(dmChannel);
        openThread(partner, dmChannel);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    return partnerName(c, channel).toLowerCase().includes(q) || identifierOf(c).toLowerCase().includes(q);
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
        body: JSON.stringify({ toUsername: identifierOf(activePartner), content, channel }),
      });
      setDraft("");
      fetchThread(activePartner, { silent: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setSending(false);
    }
  };

  const channelTabs = (
    <div className="grid grid-cols-2 border-b border-line" role="tablist" aria-label="Canal">
      {CHANNELS.map((c) => {
        const Icon = c.icon;
        const active = c.value === channel;
        return (
          <button
            key={c.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => switchChannel(c.value)}
            title={c.hint}
            className={cn(
              "font-display -mb-px flex flex-col items-center gap-0.5 border-b-2 px-2 py-2.5 transition-colors",
              active ? "border-redlake-glow text-white" : "border-transparent text-gray-500 hover:text-gray-200",
            )}
          >
            <span className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.1em]">
              <Icon className="h-3.5 w-3.5" />
              {c.label}
            </span>
            <span className="font-sans text-[10px] normal-case tracking-normal text-gray-500">{c.hint}</span>
          </button>
        );
      })}
    </div>
  );

  // Volet gauche : liste des conversations, ou choix d'un contact.
  const leftPane = pickerOpen ? (
    <>
      <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
        <button type="button" onClick={() => setPickerOpen(false)} className="p-1 text-gray-400 hover:text-white" aria-label="Retour aux conversations">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="label-mono text-[11px] text-gray-300">Nouvelle discussion</p>
      </div>
      <div className="relative border-b border-line p-3">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
        <input
          value={contactFilter}
          onChange={(e) => setContactFilter(e.target.value)}
          placeholder="Chercher un agent…"
          aria-label="Chercher un agent"
          autoFocus
          className="w-full border border-line bg-black/40 py-2 pl-8 pr-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake-glow"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {contacts === null ? (
          <p className="p-4 text-sm text-gray-500">Chargement…</p>
        ) : filteredContacts.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">Aucun agent ne correspond.</p>
        ) : (
          filteredContacts.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => openThread(c)}
              className="flex w-full items-center gap-3 border-b border-line/60 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
            >
              <ContactAvatar user={c} channel={channel} className="h-9 w-9" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{partnerName(c, channel)}</span>
                {partnerGrade(c, channel) && <span className="block truncate text-xs text-gray-500">{partnerGrade(c, channel)}</span>}
              </span>
            </button>
          ))
        )}
      </div>
    </>
  ) : (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
        <p className="label-mono text-[11px] text-gray-400">Conversations</p>
        <button
          type="button"
          onClick={openPicker}
          className="font-display flex items-center gap-1.5 bg-redlake-glow px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#ff4a3f]"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Nouvelle
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {conversations === null ? (
          <p className="p-4 text-sm text-gray-500">Chargement…</p>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-gray-500">
            <MessagesSquare className="h-6 w-6" />
            Aucune conversation. Lancez-en une avec « Nouvelle ».
          </div>
        ) : (
          conversations.map((c) => {
            const active = activePartner?.id === c.partner.id;
            return (
              <button
                key={c.partner.id}
                type="button"
                onClick={() => openThread(c.partner)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-line/60 px-3 py-3 text-left transition-colors",
                  active ? "bg-white/[0.06] shadow-[inset_3px_0_0_#e5392f]" : "hover:bg-white/[0.03]",
                )}
              >
                <ContactAvatar user={c.partner} channel={channel} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={cn("truncate text-sm text-white", c.unreadCount > 0 ? "font-bold" : "font-semibold")}>
                      {partnerName(c.partner, channel)}
                    </span>
                    <span className="label-mono shrink-0 text-[9px] text-gray-500">{shortTime(c.lastAt)}</span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2">
                    <span className={cn("truncate text-xs", c.unreadCount > 0 ? "text-gray-200" : "text-gray-500")}>{c.lastMessage}</span>
                    {c.unreadCount > 0 && (
                      <span className="shrink-0 bg-redlake-glow px-1.5 text-[10px] font-bold tabular-nums text-white">{c.unreadCount}</span>
                    )}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </>
  );

  // Volet droit : le fil de discussion.
  const threadPane = activePartner ? (
    <>
      <div className="flex items-center gap-3 border-b border-line px-3 py-2.5">
        <button
          type="button"
          onClick={() => {
            setActivePartner(null);
            loadConversations();
          }}
          className="p-1 text-gray-400 hover:text-white @3xl:hidden"
          aria-label="Retour aux conversations"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <ContactAvatar user={activePartner} channel={channel} className="h-9 w-9" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{partnerName(activePartner, channel)}</p>
          <p className="truncate text-xs text-gray-500">
            {partnerGrade(activePartner, channel) ?? (channel === "PERSONNEL" ? "Hors-RP" : "En personnage")}
          </p>
        </div>
        <span className="label-mono hidden border border-line-strong px-1.5 py-0.5 text-[9px] text-gray-300 sm:inline">
          {channel === "PERSONNEL" ? "Personnel" : "Professionnel"}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4 @3xl:px-6">
        {thread === null ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : thread.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">Aucun message échangé pour le moment.</p>
        ) : (
          thread.map((m, i) => {
            const mine = myId !== null && m.senderId === myId;
            const previous = thread[i - 1];
            const newDay = !previous || new Date(previous.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
            const grouped = !newDay && previous?.senderId === m.senderId;
            return (
              <div key={m.id}>
                {newDay && (
                  <p className="label-mono my-4 flex items-center gap-3 text-[10px] text-gray-500">
                    <span className="h-px flex-1 bg-line" aria-hidden />
                    {dayLabel(m.createdAt)}
                    <span className="h-px flex-1 bg-line" aria-hidden />
                  </p>
                )}
                <div className={cn("flex", mine ? "justify-end" : "justify-start", !grouped && "mt-3")}>
                  <div className={cn("max-w-[80%]", mine && "text-right")}>
                    {!grouped && !mine && <p className="mb-1 text-xs font-semibold text-gray-300">{m.senderLabel}</p>}
                    <div
                      className={cn(
                        "inline-block border px-3 py-2 text-left",
                        mine ? "border-redlake-glow/40 bg-redlake-glow/15" : "border-line bg-white/[0.04]",
                      )}
                    >
                      <DiscordMarkdown text={m.content} className="text-sm leading-relaxed text-gray-100" />
                    </div>
                    <p className="label-mono mt-0.5 text-[9px] text-gray-600">
                      {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(m.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t border-line p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Écrire à ${partnerName(activePartner, channel)}…`}
          aria-label="Votre message"
          maxLength={2000}
          className="min-w-0 flex-1 border border-line bg-black/40 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake-glow"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Envoyer"
          className="flex items-center gap-2 bg-redlake-glow px-4 text-white transition-colors hover:bg-[#ff4a3f] disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      {error && <p className="px-3 pb-2 text-xs text-red-300">{error}</p>}
    </>
  ) : (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <MessagesSquare className="h-10 w-10 text-gray-600" />
      <p className="font-display text-xl font-bold uppercase text-gray-300">Choisissez une conversation</p>
      <p className="max-w-xs text-sm text-gray-500">Ou lancez-en une nouvelle avec un agent.</p>
    </div>
  );

  return (
    <div className={cn("@container", heightClass)}>
      <div className="flex h-full flex-col @3xl:grid @3xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className={cn("flex min-h-0 flex-1 flex-col @3xl:border-r @3xl:border-line", activePartner && "hidden @3xl:flex")}>
          {channelTabs}
          {leftPane}
        </div>
        <div className={cn("min-h-0 flex-1 flex-col", activePartner ? "flex" : "hidden @3xl:flex")}>{threadPane}</div>
      </div>
    </div>
  );
}
