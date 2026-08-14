import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CHAPTER_01_DIRECTOR_OFFICE,
  CHARACTERS,
  applyChoice,
  applyNodeEnter,
  getAvailableChoices,
  resolveMessageDeliveryDelay,
  markCharacterMet,
  getNodeMessages,
  interpolateMessage,
  resolveAutoNext,
} from "@redlakes/narrative-core";
import type { DialogueChoice, DialogueMessage } from "@redlakes/narrative-core";
import { useGNSRequired } from "../context/GNSContext";
import { useAmbientAudioContext } from "../context/AmbientAudioContext";
import { Volume2, VolumeX, DoorOpen } from "lucide-react";

interface DirectorOfficeSceneProps {
  onComplete: () => void;
}

type HistoryEntry = DialogueMessage & { fromPlayer?: boolean };

export function DirectorOfficeScene({ onComplete }: DirectorOfficeSceneProps) {
  const { gns, updateGNS } = useGNSRequired();
  const scene = CHAPTER_01_DIRECTOR_OFFICE;
  const director = CHARACTERS["directeur-site"];
  const { muted, toggleMuted } = useAmbientAudioContext();

  const [nodeId, setNodeId] = useState(scene.entryNodeId);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [pending, setPending] = useState<DialogueMessage[]>(() =>
    getNodeMessages(scene.nodes[scene.entryNodeId])
  );
  const [choices, setChoices] = useState<DialogueChoice[]>([]);
  const [isDelivering, setIsDelivering] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [nodeEnterApplied, setNodeEnterApplied] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  const completionRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentNode = scene.nodes[nodeId];

  const transitionToNode = useCallback(
    (nextId: string) => {
      const node = scene.nodes[nextId];
      if (!node) return;

      updateGNS((g) => applyNodeEnter(g, node, 1));
      setNodeId(nextId);
      setPending(getNodeMessages(node));
      setChoices([]);
      setIsDelivering(false);
      setNodeEnterApplied(false);

      if (node.sceneStage === "exit") {
        setShowExit(true);
      }
    },
    [scene.nodes, updateGNS]
  );

  useEffect(() => {
    if (nodeEnterApplied || !currentNode) return;
    updateGNS((g) => applyNodeEnter(g, currentNode, 1));
    setNodeEnterApplied(true);
  }, [currentNode, nodeEnterApplied, updateGNS]);

  useEffect(() => {
    if (!pending.length || isDelivering) return;

    const [next, ...rest] = pending;
    const delay = resolveMessageDeliveryDelay(next) * 1000;

    setIsDelivering(true);
    const t = window.setTimeout(() => {
      setHistory((h) => [...h, next]);
      setPending(rest);
      setIsDelivering(false);
      if (next.sender === "character") {
        updateGNS((g) => markCharacterMet(g, scene.characterId, 1));
      }
    }, delay);

    timeoutsRef.current.push(t);
  }, [pending, isDelivering]);

  useEffect(() => {
    if (pending.length > 0 || isDelivering || choices.length > 0 || !currentNode) return;

    const nextId = resolveAutoNext(currentNode, gns, 1);
    if (nextId) {
      transitionToNode(nextId);
      return;
    }

    const available = getAvailableChoices(gns, currentNode, 1);
    if (available.length > 0) {
      setChoices(available);
      return;
    }

    if (currentNode.sceneStage === "exit" && !completionRef.current) {
      completionRef.current = true;
      setShowExit(true);
    }
  }, [
    pending,
    isDelivering,
    choices,
    currentNode,
    gns,
    transitionToNode,
  ]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [history, isDelivering, choices.length, showExit]);

  const handleChoice = (choice: DialogueChoice) => {
    const playerMsg: HistoryEntry = {
      id: `player-${Date.now()}`,
      sender: "player",
      text: choice.label,
      fromPlayer: true,
    };

    updateGNS((g) =>
      applyChoice(
        {
          gns: g,
          currentChapter: 1,
          threadId: scene.id,
          nodeId,
          siteTime: new Date(),
        },
        choice
      )
    );

    setHistory((h) => [...h, playerMsg]);
    setChoices([]);

    if (choice.nextNodeId) {
      transitionToNode(choice.nextNodeId);
    }
  };

  const handleExit = () => {
    if (!gns.flags.ch1_left_director_office) {
      updateGNS((g) => ({
        ...g,
        flags: { ...g.flags, ch1_left_director_office: true },
      }));
    }
    onComplete();
  };

  return (
    <div className="director-office relative flex h-screen flex-col overflow-hidden bg-[#080604]">
      <div className="director-office-vignette pointer-events-none absolute inset-0" />

      <header className="relative z-10 flex items-center justify-between border-b border-[#2a2018]/80 px-6 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#6b5c4a]">
            Site-12 — Aile administrative
          </p>
          <h1 className="text-sm text-[#d4c4a8]">Bureau du Directeur</h1>
        </div>
        <button
          type="button"
          onClick={toggleMuted}
          className="flex items-center gap-1.5 text-[10px] text-[#6b5c4a] transition-colors hover:text-[#d4c4a8]"
          aria-label={muted ? "Activer le son ambiant" : "Couper le son ambiant"}
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          {muted ? "Son off" : "Ambiance"}
        </button>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="hidden flex-1 flex-col justify-end p-6 md:flex md:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.2 }}
            className="mb-8 hidden max-w-md md:block"
          >
            <div className="director-silhouette h-48 w-36 opacity-90" />
            <p className="mt-3 text-[10px] uppercase tracking-wider text-[#6b5c4a]">
              {director.name}
            </p>
            <p className="text-[10px] text-[#4a4035]">{director.title}</p>
          </motion.div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col border-t border-[#2a2018]/60 md:flex-[1.2] md:border-t-0 md:border-l">
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 md:p-6"
          >
            <AnimatePresence initial={false}>
              {history.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className={
                    msg.sender === "system"
                      ? "text-center"
                      : msg.sender === "player" || msg.fromPlayer
                        ? "flex justify-end"
                        : "flex justify-start"
                  }
                >
                  {msg.sender === "system" ? (
                    <p className="max-w-lg text-xs italic leading-relaxed text-[#6b5c4a]">
                      {interpolateMessage(msg, gns).text}
                    </p>
                  ) : (
                    <div
                      className={`max-w-[90%] px-4 py-3 text-sm leading-relaxed ${
                        msg.sender === "player" || msg.fromPlayer
                          ? "bg-[#1a1510] text-[#c9b896] border border-[#3d3428]"
                          : "bg-[#0f0c09] text-[#e8dcc8] border-l-2"
                      }`}
                      style={
                        msg.sender === "character"
                          ? { borderLeftColor: director.avatarColor }
                          : undefined
                      }
                    >
                      {(msg.sender === "character" || msg.fromPlayer) && (
                        <span className="mb-1 block text-[9px] uppercase tracking-wider text-[#6b5c4a]">
                          {msg.sender === "character" ? "Directeur" : gns.player.displayName}
                        </span>
                      )}
                      <p>{interpolateMessage(msg, gns).text}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isDelivering && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-[#4a4035]"
              >
                …
              </motion.p>
            )}
          </div>

          {choices.length > 0 && (
            <div className="shrink-0 space-y-2 border-t border-[#2a2018]/60 bg-[#080604] p-4 md:px-6">
              <p className="mb-2 text-[10px] uppercase tracking-wider text-[#6b5c4a]">
                Votre réponse
              </p>
              {choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleChoice(choice)}
                  className="block w-full border border-[#3d3428] bg-[#0f0c09] px-4 py-3 text-left text-xs text-[#d4c4a8] transition-colors hover:border-[#8b0a0a]/60 hover:bg-[#1a1510]"
                >
                  {choice.label}
                </button>
              ))}
            </div>
          )}

          {showExit && choices.length === 0 && pending.length === 0 && !isDelivering && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="shrink-0 border-t border-[#2a2018]/60 bg-[#080604] p-4 md:px-6 md:pb-6"
            >
              <button
                type="button"
                onClick={handleExit}
                className="flex w-full items-center justify-center gap-2 border border-[#8b0a0a]/40 bg-[#8b0a0a]/10 px-4 py-3 text-xs uppercase tracking-wider text-[#d4c4a8] transition-colors hover:bg-[#8b0a0a]/20"
              >
                <DoorOpen className="h-4 w-4" />
                Quitter le bureau — retour au terminal
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
