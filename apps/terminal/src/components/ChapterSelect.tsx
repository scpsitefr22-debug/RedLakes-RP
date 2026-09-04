import { useState } from "react";
import {
  CHAPTER_MANIFESTS,
  clearAllGNSSaves,
  getChapterEntryWarning,
  getPlayerDisplayName,
  hasChapterProgress,
  hasPriorSagaProgress,
  resetChapterForReplay,
  type ChapterId,
} from "@redlakes/narrative-core";
import { Lock, Play, AlertTriangle, RotateCcw, Users } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

interface ChapterSelectProps {
  onSelect: (chapterId: number) => void;
  onChangeProfile: () => void;
}

export function ChapterSelect({ onSelect, onChangeProfile }: ChapterSelectProps) {
  const { gns, updateGNS, saveNow, offlineEventsTriggered } = useGNSRequired();
  const completed = gns.session.chaptersCompleted;
  const [replayTarget, setReplayTarget] = useState<ChapterId | null>(null);

  const chaptersWithProgress = CHAPTER_MANIFESTS.filter((ch) => hasChapterProgress(gns, ch.id));

  const handleReplay = async (chapterId: ChapterId) => {
    const confirmed = confirm(
      `Recommencer le ${chapterId === 1 ? "Chapitre I" : `Chapitre ${chapterId}`} ?\n\nVos conversations et choix de ce chapitre seront effacés. Le reste de votre saga sera conservé.`
    );
    if (!confirmed) return;
    setReplayTarget(chapterId);
    updateGNS((prev) => resetChapterForReplay(prev, chapterId));
    await saveNow();
    onSelect(chapterId);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="border-b border-panel-border bg-panel px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-lg tracking-widest text-foreground">REDLAKES TERMINAL</h1>
            <p className="mt-1 text-xs text-metal">
              Dossier {gns.saveId.slice(0, 8).toUpperCase()}
              <span className="ml-3 text-foreground">
                {getPlayerDisplayName(gns)} — Recrue
              </span>
              {gns.player.employeeId && (
                <span className="ml-2 font-mono text-metal">({gns.player.employeeId})</span>
              )}
              {hasPriorSagaProgress(gns) && (
                <span className="ml-3 text-terminal">
                  {completed.length} chapitre{completed.length > 1 ? "s" : ""} terminé
                  {completed.length > 1 ? "s" : ""}
                </span>
              )}
            </p>
            {offlineEventsTriggered > 0 && (
              <p className="mt-2 text-xs text-redlake">
                {offlineEventsTriggered} événement{offlineEventsTriggered > 1 ? "s" : ""} survenu
                {offlineEventsTriggered > 1 ? "s" : ""} pendant votre absence.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onChangeProfile}
            className="flex items-center gap-2 border border-panel-border px-3 py-2 text-[10px] text-metal transition-colors hover:border-dashboard-accent/50 hover:text-foreground"
          >
            <Users className="h-3.5 w-3.5" />
            Changer de personnage
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <p className="mb-6 max-w-2xl text-sm text-metal">
          Sélectionnez un chapitre. Chaque recrue conserve sa propre saga — vos choix suivent ce
          dossier personnel.
        </p>

        <div className="grid max-w-3xl gap-3">
          {CHAPTER_MANIFESTS.map((ch) => {
            const warning = getChapterEntryWarning(ch.id, completed);
            const isPlayable = warning?.level !== "hard";
            const isDone = completed.includes(ch.id);

            return (
              <button
                key={ch.id}
                type="button"
                disabled={!isPlayable}
                onClick={() => isPlayable && onSelect(ch.id)}
                className={`group flex items-start gap-4 border p-4 text-left transition-colors ${
                  isPlayable
                    ? "cursor-pointer border-panel-border bg-panel hover:border-redlake/50 hover:bg-classified"
                    : "cursor-not-allowed border-panel-border/50 bg-classified/50 opacity-60"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-panel-border text-xs text-metal">
                  {String(ch.id).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{ch.title}</span>
                    {isDone && (
                      <span className="text-[10px] uppercase tracking-wider text-terminal">Terminé</span>
                    )}
                    {!isPlayable && <Lock className="h-3 w-3 text-metal" />}
                  </div>
                  <p className="text-xs text-redlake/80">{ch.subtitle}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-metal">{ch.description}</p>
                  {warning && (
                    <p
                      className={`mt-2 flex items-center gap-1 text-[10px] ${
                        warning.level === "hard" ? "text-redlake" : "text-amber-500"
                      }`}
                    >
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {warning.message}
                    </p>
                  )}
                </div>
                {isPlayable && (
                  <Play className="mt-1 h-4 w-4 shrink-0 text-metal group-hover:text-terminal" />
                )}
              </button>
            );
          })}
        </div>

        {chaptersWithProgress.length > 0 && (
          <div className="mt-8 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-metal">
              Recommencer un chapitre (ce personnage)
            </p>
            <div className="flex flex-wrap gap-2">
              {chaptersWithProgress.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  disabled={replayTarget === ch.id}
                  onClick={() => void handleReplay(ch.id)}
                  className="flex items-center gap-2 border border-panel-border bg-panel px-3 py-2 text-xs text-foreground transition-colors hover:border-redlake/40 hover:bg-classified disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-metal" />
                  Chapitre {ch.id}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-panel-border px-8 py-3 text-[10px] text-metal">
        <button
          type="button"
          className="hover:text-terminal underline-offset-2 hover:underline"
          onClick={() => {
            if (
              confirm(
                "Supprimer TOUS les dossiers personnels ? Irréversible. (outil développeur)"
              )
            ) {
              clearAllGNSSaves();
              window.location.reload();
            }
          }}
        >
          Réinitialiser toutes les sauvegardes (dev)
        </button>
      </footer>
    </div>
  );
}
