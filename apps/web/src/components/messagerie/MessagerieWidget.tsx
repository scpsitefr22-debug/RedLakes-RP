"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { usePlayerSession } from "@/hooks/usePlayerSession";
import { MessagerieView } from "./MessagerieView";

/**
 * Bulle de messagerie flottante — même principe qu'un widget de chat
 * classique (Intercom, Messenger) : accessible depuis n'importe quelle
 * page sans la quitter, plutôt qu'une page /messagerie qu'il faut ouvrir
 * séparément. La page reste disponible pour un usage plein écran.
 */
export function MessagerieWidget() {
  const { authenticated } = usePlayerSession();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const refreshUnread = () => {
    apiFetch<number>("/core-dm/unread-count")
      .then(setUnread)
      .catch(() => undefined);
  };

  useEffect(() => {
    if (!authenticated) return;
    refreshUnread();
    const interval = setInterval(refreshUnread, 30_000);
    return () => clearInterval(interval);
  }, [authenticated]);

  if (!authenticated) return null;

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-[60] flex w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-lg border border-redlake/40 bg-black/95 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-metal/40 px-4 py-3">
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-redlake-glow">
              <MessageCircle className="h-3.5 w-3.5" />
              Messagerie
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-gray-500 hover:text-white"
              aria-label="Fermer la messagerie"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <MessagerieView heightClass="h-[420px]" onActivity={refreshUnread} />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) refreshUnread();
        }}
        className={`fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full border shadow-lg backdrop-blur transition-colors ${
          open
            ? "border-redlake bg-redlake/20 text-redlake-glow"
            : "border-metal bg-black/80 text-gray-300 hover:border-redlake hover:text-redlake-glow"
        }`}
        title="Messagerie"
        aria-label="Ouvrir la messagerie"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-redlake px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
    </>
  );
}
