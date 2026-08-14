import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChapterId, DialogueChoice, DialogueMessage, DialogueNode, MessageThread } from "@redlakes/narrative-core";
import {
  CHARACTERS,
  applyChoice,
  applyNodeEnter,
  getAvailableChoices,
  resolveMessageDeliveryDelay,
  getChapterThreads,
  getNodeMessages,
  hasCompletedChapter,
  interpolateMessage,
  isThreadAtRest,
  isThreadUnlocked,
  getMessageThreadsForChapter,
  markCharacterMet,
  recordDocumentRead,
  resolveAutoNext,
  resolveEntryNodeId,
  restoreThreadUIState,
  saveChapterThread,
  threadStateToPersisted,
} from "@redlakes/narrative-core";
import { Check, CheckCheck, Hash, Mic, Paperclip, Phone, Search, Send, Video } from "lucide-react";
import type { GlobalNarrativeSave } from "@redlakes/narrative-core";
import { useGNSRequired, useCompleteChapter } from "../context/GNSContext";
import { useMessageSfx } from "../hooks/useMessageSfx";
import {
  DEPARTMENTS,
  getCharacterDepartment,
  getContactStatus,
  STATUS_DOT_COLORS,
  type Department,
} from "../lib/workstation";

type HistoryMessage = DialogueMessage & { fromPlayer?: boolean; deliveredAt?: string };

interface ThreadUIState {
  threadId: string;
  characterId: string;
  currentNodeId: string;
  history: HistoryMessage[];
  pendingMessages: DialogueMessage[];
  choices: DialogueChoice[];
  isTyping: boolean;
  unread: number;
  started: boolean;
  nodeEnterApplied: boolean;
}

function buildInitialThreadStates(
  gns: GlobalNarrativeSave,
  chapterId: ChapterId,
  allThreads: MessageThread[]
): Record<string, ThreadUIState> {
  const saved = getChapterThreads(gns, chapterId);
  const states: Record<string, ThreadUIState> = {};

  for (const [threadId, persisted] of Object.entries(saved)) {
    if (!persisted.started) continue;
    const thread = allThreads.find((t) => t.id === threadId);
    if (!thread) continue;
    states[threadId] = restoreThreadUIState(persisted, thread, gns, chapterId);
  }

  return states;
}

function formatMessageTime(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function getAlertFeed(gns: GlobalNarrativeSave): Array<{ time: string; text: string }> {
  const items: Array<{ time: string; text: string }> = [
    { time: "06:00", text: "Site-12 — statut opérationnel STABLE. Aucune alerte active." },
  ];
  if (gns.flags.ch1_site_rumor_spread) {
    items.unshift({
      time: "10:12",
      text: "Rumeur interne non confirmée — présence AEGIS. Ne pas relayer.",
    });
  }
  if (gns.flags.ch1_aegis_noted) {
    items.unshift({
      time: "08:05",
      text: "Briefing 08h00 — mention surveillance externe enregistrée.",
    });
  }
  if (gns.flags.ch1_briefing_attended) {
    const name = gns.player.displayName.trim() || "Personnel";
    items.unshift({
      time: "08:45",
      text: `Briefing sécurité — présence ${name} validée par badge.`,
    });
  }
  return items.slice(0, 4);
}

interface MessengerAppProps {
  chapterId: ChapterId;
  variant?: "default" | "dashboard";
  onChapterComplete?: () => void;
  onOpenDocument?: (documentId: string) => void;
  onNewContact?: (label: string) => void;
}

export function MessengerApp({
  chapterId,
  variant = "default",
  onChapterComplete,
  onOpenDocument,
  onNewContact,
}: MessengerAppProps) {
  const { gns, updateGNS } = useGNSRequired();
  const completeChapter = useCompleteChapter(chapterId);
  const allThreads = useMemo(() => getMessageThreadsForChapter(chapterId), [chapterId]);
  const unlockedThreads = useMemo(
    () => allThreads.filter((t) => isThreadUnlocked(gns, t, chapterId)),
    [allThreads, gns, chapterId]
  );

  const [activeThreadId, setActiveThreadId] = useState(unlockedThreads[0]?.id ?? "");
  const [threadStates, setThreadStates] = useState<Record<string, ThreadUIState>>(() =>
    buildInitialThreadStates(gns, chapterId, allThreads)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);
  const [contactTab, setContactTab] = useState<"all" | "unread" | "groups">("all");
  const timeoutsRef = useRef<number[]>([]);
  const completionFiredRef = useRef(false);
  const hydratedRef = useRef(Object.keys(getChapterThreads(gns, chapterId)).length > 0);
  const { playReceive, playSend, playNotify } = useMessageSfx();
  const playReceiveRef = useRef(playReceive);
  const playSendRef = useRef(playSend);
  const playNotifyRef = useRef(playNotify);
  playReceiveRef.current = playReceive;
  playSendRef.current = playSend;
  playNotifyRef.current = playNotify;

  const alertFeed = useMemo(() => getAlertFeed(gns), [gns]);

  useEffect(() => {
    if (hasCompletedChapter(gns, chapterId)) {
      completionFiredRef.current = true;
    }
  }, [gns, chapterId]);

  const initThread = useCallback(
    (threadId: string, delayMs = 0) => {
      const thread = allThreads.find((t) => t.id === threadId);
      if (!thread || !isThreadUnlocked(gns, thread, chapterId)) return;

      const start = () => {
        setThreadStates((prev) => {
          if (prev[threadId]?.started) return prev;
          if (getChapterThreads(gns, chapterId)[threadId]?.started) return prev;

          const entryId = resolveEntryNodeId(thread, gns, chapterId);
          const node = thread.nodes[entryId];
          if (!node) return prev;

          onNewContact?.(CHARACTERS[thread.characterId]?.name ?? thread.label);
          playNotifyRef.current();

          return {
            ...prev,
            [threadId]: {
              threadId,
              characterId: thread.characterId,
              currentNodeId: entryId,
              history: [],
              pendingMessages: getNodeMessages(node),
              choices: [],
              isTyping: false,
              unread: getNodeMessages(node).length,
              started: true,
              nodeEnterApplied: false,
            },
          };
        });
      };

      if (delayMs > 0) {
        const t = window.setTimeout(start, delayMs);
        timeoutsRef.current.push(t);
      } else {
        start();
      }
    },
    [allThreads, gns, chapterId, onNewContact]
  );

  useEffect(() => {
    const initial = allThreads.filter(
      (t) => !t.unlockRequires && !getChapterThreads(gns, chapterId)[t.id]?.started
    );
    initial.forEach((t, i) => initThread(t.id, hydratedRef.current ? 0 : i * 500));
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, [allThreads, initThread, gns, chapterId]);

  useEffect(() => {
    const locked = unlockedThreads.filter(
      (t) =>
        t.unlockRequires &&
        !threadStates[t.id]?.started &&
        !getChapterThreads(gns, chapterId)[t.id]?.started
    );
    locked.forEach((t, i) => {
      const delay = (t.initialDelaySeconds ?? 1.5) * 1000 + i * 400;
      initThread(t.id, delay);
    });
  }, [unlockedThreads, threadStates, initThread, gns, chapterId]);

  useEffect(() => {
    const started = Object.values(threadStates).filter((s) => s.started);
    if (!started.length) return;

    const timeout = window.setTimeout(() => {
      updateGNS((g) => {
        let next = g;
        for (const state of started) {
          const thread = allThreads.find((t) => t.id === state.threadId);
          if (!thread) continue;
          const node = thread.nodes[state.currentNodeId];
          const complete = isThreadAtRest(node, next, chapterId, state);
          next = saveChapterThread(
            next,
            chapterId,
            threadStateToPersisted(state, complete)
          );
        }
        return next;
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [threadStates, allThreads, chapterId, updateGNS]);

  useEffect(() => {
    if (unlockedThreads.length && !unlockedThreads.find((t) => t.id === activeThreadId)) {
      setActiveThreadId(unlockedThreads[0].id);
    }
  }, [unlockedThreads, activeThreadId]);

  const isDashboard = variant === "dashboard";
  const borderCls = isDashboard ? "border-dashboard-border" : "border-panel-border";
  const panelCls = isDashboard ? "bg-[#0a1018]" : "bg-classified";
  const subtleCls = isDashboard ? "bg-[#060a10]" : "bg-panel";

  const flatThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return unlockedThreads.filter((thread) => {
      if (contactTab === "unread") {
        const unread = threadStates[thread.id]?.unread ?? 0;
        if (unread <= 0) return false;
      }
      if (!q) return true;
      const char = CHARACTERS[thread.characterId];
      const haystack = [char?.name, char?.title, thread.label]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [unlockedThreads, searchQuery, contactTab, threadStates]);

  const groupedThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = unlockedThreads.filter((thread) => {
      if (!q) return true;
      const char = CHARACTERS[thread.characterId];
      const haystack = [char?.name, char?.title, thread.label, getCharacterDepartment(thread.characterId)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    const groups: Partial<Record<Department, typeof filtered>> = {};
    for (const dept of DEPARTMENTS) {
      const items = filtered.filter((t) => getCharacterDepartment(t.characterId) === dept);
      if (items.length) groups[dept] = items;
    }
    return groups;
  }, [unlockedThreads, searchQuery]);

  const transitionToNode = useCallback(
    (threadId: string, nodeId: string, node: DialogueNode) => {
      updateGNS((g) => applyNodeEnter(g, node, chapterId));
      setThreadStates((prev) => ({
        ...prev,
        [threadId]: {
          ...prev[threadId],
          currentNodeId: nodeId,
          pendingMessages: getNodeMessages(node),
          choices: [],
          isTyping: false,
          nodeEnterApplied: true,
        },
      }));
    },
    [chapterId, updateGNS]
  );

  const tryCompleteChapter = useCallback(
    async (node: DialogueNode, choice?: DialogueChoice) => {
      if (completionFiredRef.current || hasCompletedChapter(gns, chapterId)) return;
      if (!node.completeChapter && !choice?.completeChapter) return;
      completionFiredRef.current = true;
      await completeChapter();
      onChapterComplete?.();
    },
    [completeChapter, onChapterComplete, gns, chapterId]
  );

  useEffect(() => {
    const state = threadStates[activeThreadId];
    if (!state || state.nodeEnterApplied) return;
    const thread = allThreads.find((t) => t.id === activeThreadId);
    const node = thread?.nodes[state.currentNodeId];
    if (!node) return;

    updateGNS((g) => applyNodeEnter(g, node, chapterId));
    setThreadStates((prev) => ({
      ...prev,
      [activeThreadId]: { ...prev[activeThreadId], nodeEnterApplied: true },
    }));
  }, [threadStates, activeThreadId, allThreads, chapterId, updateGNS]);

  useEffect(() => {
    const state = threadStates[activeThreadId];
    if (!state?.pendingMessages.length || state.isTyping) return;

    const [next, ...rest] = state.pendingMessages;
    const delay = resolveMessageDeliveryDelay(next) * 1000;
    const characterId = state.characterId;

    setThreadStates((prev) => ({
      ...prev,
      [activeThreadId]: {
        ...prev[activeThreadId],
        isTyping: true,
        pendingMessages: rest,
      },
    }));

    const t = window.setTimeout(() => {
      const deliveredAt = new Date().toISOString();

      setThreadStates((prev) => {
        const s = prev[activeThreadId];
        if (!s) return prev;
        return {
          ...prev,
          [activeThreadId]: {
            ...s,
            history: [...s.history, { ...next, deliveredAt }],
            isTyping: false,
          },
        };
      });

      if (next.sender === "character") {
        playReceiveRef.current();
      }

      updateGNS((g) => {
        let updated = g;
        if (next.sender === "character" && characterId) {
          updated = markCharacterMet(updated, characterId, chapterId);
        }
        if (next.attachment?.type === "document") {
          updated = recordDocumentRead(updated, next.attachment.id);
        }
        return updated;
      });
    }, delay);

    timeoutsRef.current.push(t);
  }, [threadStates, activeThreadId, updateGNS]);

  useEffect(() => {
    const state = threadStates[activeThreadId];
    if (!state || state.pendingMessages.length > 0 || state.isTyping || state.choices.length > 0)
      return;

    const thread = allThreads.find((t) => t.id === activeThreadId);
    if (!thread) return;
    const node = thread.nodes[state.currentNodeId];
    if (!node) return;

    const nextId = resolveAutoNext(node, gns, chapterId);
    if (nextId) {
      const nextNode = thread.nodes[nextId];
      if (nextNode) transitionToNode(activeThreadId, nextId, nextNode);
      return;
    }

    const choices = getAvailableChoices(gns, node, chapterId);
    if (choices.length > 0) {
      setThreadStates((prev) => ({
        ...prev,
        [activeThreadId]: { ...prev[activeThreadId], choices },
      }));
      return;
    }

    void tryCompleteChapter(node);
  }, [
    threadStates,
    activeThreadId,
    allThreads,
    gns,
    chapterId,
    transitionToNode,
    tryCompleteChapter,
  ]);

  const handleChoice = (choice: DialogueChoice) => {
    const thread = allThreads.find((t) => t.id === activeThreadId);
    const state = threadStates[activeThreadId];
    if (!thread || !state) return;

    playSendRef.current();

    const playerMsg: HistoryMessage = {
      id: `player-${Date.now()}`,
      sender: "player",
      text: choice.label,
      fromPlayer: true,
      deliveredAt: new Date().toISOString(),
    };

    updateGNS((g) =>
      applyChoice(
        {
          gns: g,
          currentChapter: chapterId,
          threadId: activeThreadId,
          nodeId: state.currentNodeId,
          siteTime: new Date(),
        },
        choice
      )
    );

    const nextNodeId = choice.nextNodeId;
    const nextNode = nextNodeId ? thread.nodes[nextNodeId] : undefined;

    setThreadStates((prev) => ({
      ...prev,
      [activeThreadId]: {
        ...prev[activeThreadId],
        history: [...prev[activeThreadId].history, playerMsg],
        choices: [],
        currentNodeId: nextNodeId ?? state.currentNodeId,
        pendingMessages: nextNode ? getNodeMessages(nextNode) : [],
        isTyping: false,
        nodeEnterApplied: !nextNode,
      },
    }));

    if (nextNode) {
      updateGNS((g) => applyNodeEnter(g, nextNode, chapterId));
      setThreadStates((prev) => ({
        ...prev,
        [activeThreadId]: { ...prev[activeThreadId], nodeEnterApplied: true },
      }));
    } else {
      void tryCompleteChapter(thread.nodes[state.currentNodeId], choice);
    }
  };

  const selectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setShowAlerts(false);
    initThread(threadId);
    setThreadStates((prev) => {
      const s = prev[threadId];
      if (!s) return prev;
      return { ...prev, [threadId]: { ...s, unread: 0 } };
    });
  };

  const activeState = threadStates[activeThreadId];
  const activeChar = activeState ? CHARACTERS[activeState.characterId] : null;
  const totalUnread = Object.values(threadStates).reduce((s, t) => s + (t.unread || 0), 0);
  const activeStatus = activeState
    ? getContactStatus(activeState.started, activeState.isTyping, activeThreadId === activeThreadId)
    : "offline";

  const renderContactButton = (thread: MessageThread) => {
    const char = CHARACTERS[thread.characterId];
    const state = threadStates[thread.id];
    const isActive = !showAlerts && activeThreadId === thread.id;
    const status = getContactStatus(Boolean(state?.started), Boolean(state?.isTyping), isActive);
    const lastTime = state?.history[state.history.length - 1]?.deliveredAt;
    const unread = state?.unread ?? 0;

    return (
      <button
        key={thread.id}
        type="button"
        onClick={() => selectThread(thread.id)}
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
          isActive
            ? isDashboard
              ? "bg-dashboard-accent/15 text-foreground"
              : "bg-redlake/10 text-foreground"
            : isDashboard
              ? "text-metal hover:bg-dashboard-accent/5"
              : "text-metal hover:bg-panel"
        }`}
      >
        <div className="relative shrink-0">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: char?.avatarColor ?? "#5c5c5c" }}
          >
            {char?.name.charAt(0) ?? "?"}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 ${isDashboard ? "border-[#0a1018]" : "border-classified"} ${STATUS_DOT_COLORS[status]}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-foreground">
            {(char?.name ?? thread.label).toUpperCase()}
          </div>
          <div className="truncate text-[10px] text-metal">
            {state?.isTyping && !isActive ? (
              <span className="text-terminal">écrit…</span>
            ) : isDashboard ? (
              status === "online" ? (
                <span className="text-terminal">En ligne</span>
              ) : (
                char?.title
              )
            ) : (
              char?.title
            )}
          </div>
        </div>
        {isDashboard && (
          <span className="shrink-0 font-mono text-[9px] text-metal">
            {lastTime ? formatMessageTime(lastTime) : "—"}
          </span>
        )}
        {unread > 0 && (
          <span
            className={`flex shrink-0 items-center justify-center rounded-full bg-red-500 text-white ${
              isDashboard ? "h-4 min-w-4 px-1 text-[9px] font-bold" : "h-2 w-2"
            }`}
          >
            {isDashboard ? unread : null}
          </span>
        )}
      </button>
    );
  };

  const contactListEmpty =
    unlockedThreads.length === 0 ? (
      <div className="px-3 py-6 text-center text-[10px] leading-relaxed text-metal">
        {!gns.flags.ch1_left_director_office ? (
          <>
            <p className="mb-1 text-foreground/80">Convocation en cours</p>
            <p>Terminez l&apos;entretien avec le Directeur pour activer vos contacts.</p>
          </>
        ) : (
          <p>Les convocations arrivent progressivement. Patientez quelques instants.</p>
        )}
      </div>
    ) : isDashboard && contactTab !== "groups" ? (
      flatThreads.length === 0 ? (
        <div className="px-3 py-6 text-center text-[10px] text-metal">Aucun message non lu.</div>
      ) : (
        flatThreads.map(renderContactButton)
      )
    ) : Object.keys(groupedThreads).length === 0 ? (
      <div className="px-3 py-6 text-center text-[10px] text-metal">
        Aucun contact ne correspond à « {searchQuery} ».
      </div>
    ) : (
      DEPARTMENTS.map((dept) => {
        const threads = groupedThreads[dept];
        if (!threads?.length) return null;
        return (
          <div key={dept}>
            <div
              className={`sticky top-0 px-3 py-1.5 text-[9px] font-medium uppercase tracking-wider text-metal/80 ${panelCls}`}
            >
              {dept}
            </div>
            {threads.map(renderContactButton)}
          </div>
        );
      })
    );

  return (
    <div className="flex h-full min-h-0">
      <div className={`flex w-[220px] shrink-0 flex-col border-r ${borderCls} ${panelCls}`}>
        {!isDashboard && (
          <div className={`border-b ${borderCls} px-3 py-2`}>
            <p className="text-[10px] uppercase tracking-wider text-metal">Messagerie inter-sites</p>
            <p className="text-[9px] text-metal/70">Site-12 — Clearance 1</p>
          </div>
        )}

        {!isDashboard && (
          <button
            type="button"
            onClick={() => {
              setShowAlerts(true);
              setActiveThreadId("");
            }}
            className={`flex w-full items-start gap-2 border-b ${borderCls} px-3 py-2.5 text-left transition-colors ${
              showAlerts ? "bg-redlake/10" : "hover:bg-panel"
            }`}
          >
            <Hash className="mt-0.5 h-3.5 w-3.5 shrink-0 text-terminal" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-foreground">#alertes-site12</div>
              <div className="truncate text-[9px] text-metal">Canal lecture seule — ops</div>
            </div>
          </button>
        )}

        <div className={`border-b ${borderCls} px-2 py-2`}>
          <div className={`flex items-center gap-2 border ${borderCls} ${subtleCls} px-2 py-1.5`}>
            <Search className="h-3 w-3 shrink-0 text-metal" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isDashboard ? "Rechercher un contact..." : "Filtrer contacts…"}
              className="w-full bg-transparent text-[10px] text-foreground outline-none placeholder:text-metal/60"
            />
          </div>
        </div>

        {isDashboard ? (
          <div className={`flex border-b ${borderCls} text-[9px] uppercase tracking-wider`}>
            {(
              [
                ["all", "Tous"],
                ["unread", `Non lus${totalUnread > 0 ? ` (${totalUnread})` : ""}`],
                ["groups", "Groupes"],
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setContactTab(tab)}
                className={`flex-1 px-1 py-2 transition-colors ${
                  contactTab === tab
                    ? "border-b-2 border-dashboard-accent text-dashboard-accent"
                    : "text-metal hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <div
            className={`flex items-center justify-between border-b ${borderCls} px-3 py-1.5 text-[9px] uppercase tracking-wider text-metal`}
          >
            <span>Contacts</span>
            {totalUnread > 0 && <span className="text-redlake">({totalUnread})</span>}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">{contactListEmpty}</div>

        {isDashboard && (
          <button
            type="button"
            disabled
            className={`m-2 border border-dashboard-border/60 py-2 text-[9px] uppercase tracking-wider text-metal/50`}
          >
            Nouveau message
          </button>
        )}
      </div>

      <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${isDashboard ? "bg-[#060a10]" : ""}`}>
        {showAlerts ? (
          <>
            <div className={`flex items-center gap-2 border-b ${borderCls} px-4 py-2`}>
              <Hash className="h-3.5 w-3.5 text-terminal" />
              <span className="text-xs text-foreground">#alertes-site12</span>
              <span className="text-[10px] text-metal">— lecture seule</span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {alertFeed.map((item, i) => (
                <div
                  key={i}
                  className={`border-l-2 border-terminal ${subtleCls} px-3 py-2 text-xs text-foreground/90`}
                >
                  <span className="font-mono text-[10px] text-metal">{item.time}</span>
                  <p className="mt-1 whitespace-pre-wrap">{item.text}</p>
                </div>
              ))}
            </div>
          </>
        ) : activeChar && activeState ? (
          <>
            <div className={`flex items-center gap-2 border-b ${borderCls} px-4 py-2`}>
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[activeStatus]}`} />
              <span className="text-xs font-medium text-foreground">
                {isDashboard ? activeChar.name.toUpperCase() : activeChar.name}
              </span>
              <span className="text-[10px] text-metal">
                {isDashboard
                  ? activeStatus === "online"
                    ? "— En ligne"
                    : `— ${getCharacterDepartment(activeState.characterId)}`
                  : `— ${getCharacterDepartment(activeState.characterId)} · ${activeChar.faction}`}
              </span>
              {isDashboard && (
                <div className="ml-auto flex items-center gap-2 text-metal/60">
                  <Phone className="h-3.5 w-3.5" />
                  <Video className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {activeState.history.length === 0 && !activeState.isTyping && (
                <div className="flex h-full min-h-[80px] items-center justify-center text-center text-[10px] text-metal">
                  Conversation vide — en attente de messages entrants.
                </div>
              )}
              {activeState.history.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  variant={variant}
                  message={interpolateMessage(msg, gns)}
                  deliveredAt={msg.deliveredAt}
                  charColor={activeChar.avatarColor}
                  playerName={gns.player.displayName}
                  onOpenDocument={onOpenDocument}
                />
              ))}
              {activeState.isTyping && (
                <TypingIndicator
                  name={activeChar.name}
                  color={activeChar.avatarColor}
                  dashboard={isDashboard}
                />
              )}
            </div>

            {activeState.choices.length > 0 ? (
              <div className={`space-y-2 border-t ${borderCls} ${panelCls} p-3`}>
                {activeState.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => handleChoice(choice)}
                    className={`block w-full border ${borderCls} px-3 py-2 text-left text-xs text-foreground transition-colors ${
                      isDashboard
                        ? "hover:border-dashboard-accent/50 hover:bg-dashboard-accent/10"
                        : "hover:border-redlake/50 hover:bg-panel"
                    }`}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            ) : (
              isDashboard && (
                <div className={`flex items-center gap-2 border-t ${borderCls} ${panelCls} px-3 py-2`}>
                  <input
                    readOnly
                    placeholder="Écrire un message sécurisé..."
                    className="min-w-0 flex-1 bg-transparent text-[11px] text-foreground outline-none placeholder:text-metal/50"
                  />
                  <Paperclip className="h-4 w-4 shrink-0 text-metal/50" />
                  <Mic className="h-4 w-4 shrink-0 text-metal/50" />
                  <Send className="h-4 w-4 shrink-0 text-dashboard-accent/50" />
                </div>
              )
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <MessageSquarePlaceholder />
            <p className="text-xs text-metal">
              {isDashboard
                ? "Sélectionnez un contact dans la liste"
                : "Sélectionnez un contact ou consultez #alertes-site12"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageSquarePlaceholder() {
  return (
    <div className="flex h-12 w-12 items-center justify-center border border-panel-border bg-classified text-metal">
      <Hash className="h-5 w-5 opacity-40" />
    </div>
  );
}

function MessageBubble({
  message,
  deliveredAt,
  charColor,
  playerName,
  onOpenDocument,
  variant = "default",
}: {
  message: DialogueMessage & { fromPlayer?: boolean };
  deliveredAt?: string;
  charColor?: string;
  playerName?: string;
  onOpenDocument?: (id: string) => void;
  variant?: "default" | "dashboard";
}) {
  const isDashboard = variant === "dashboard";
  const isPlayer = message.sender === "player" || message.fromPlayer;
  const isSystem = message.sender === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center py-1">
        <p className="text-center text-[10px] italic text-metal">{message.text}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isPlayer ? "items-end" : "items-start"}`}>
      {isPlayer && playerName && !isDashboard && (
        <span className="mb-1 text-[9px] text-metal">{playerName}</span>
      )}
      <div className={`flex ${isPlayer ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[85%] rounded-sm px-3 py-2 text-xs ${
            isPlayer
              ? isDashboard
                ? "bg-[#1a3d66] text-foreground"
                : "bg-redlake/20 text-foreground"
              : isDashboard
                ? "bg-[#1a1f28] text-foreground"
                : "bg-panel text-foreground"
          }`}
          style={
            !isPlayer && !isDashboard
              ? { borderLeft: `2px solid ${charColor ?? "#5c5c5c"}` }
              : undefined
          }
        >
          <p className="whitespace-pre-wrap">{message.text}</p>
          {message.attachment && (
            <button
              type="button"
              onClick={() =>
                message.attachment?.type === "document" &&
                onOpenDocument?.(message.attachment.id)
              }
              className="mt-2 flex w-full items-center gap-1 border border-panel-border bg-classified px-2 py-1 text-left text-[10px] text-terminal hover:border-terminal/40"
            >
              📎 {message.attachment.label}
            </button>
          )}
          <div className="mt-1.5 flex items-center justify-between gap-3">
            {deliveredAt && (
              <span className="font-mono text-[9px] text-metal">{formatMessageTime(deliveredAt)}</span>
            )}
            {message.edited && <span className="text-[9px] text-metal">modifié</span>}
            {isPlayer && <CheckCheck className="h-3 w-3 text-terminal opacity-60" />}
            {!isPlayer && !message.fromPlayer && (
              <Check className="h-3 w-3 text-metal opacity-40" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({
  name,
  color,
  dashboard = false,
}: {
  name: string;
  color?: string;
  dashboard?: boolean;
}) {
  return (
    <div className="flex justify-start">
      <div
        className={`flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] ${
          dashboard ? "bg-[#1a1f28]" : "bg-panel"
        }`}
        style={!dashboard ? { borderLeft: `2px solid ${color ?? "#5c5c5c"}` } : undefined}
      >
        <span className="text-foreground">{name}</span>
        <span className="text-metal">est en train d'écrire</span>
        <span className="ml-0.5 flex gap-0.5">
          <span className="typing-dot h-1 w-1 rounded-full bg-metal" />
          <span className="typing-dot h-1 w-1 rounded-full bg-metal" />
          <span className="typing-dot h-1 w-1 rounded-full bg-metal" />
        </span>
      </div>
    </div>
  );
}
