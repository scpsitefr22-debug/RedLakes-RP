"use client";

import { useEffect, useState } from "react";
import { History, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface CharacterRevision {
  id: string;
  name: string;
  title: string;
  faction: string;
  biography: string;
  quotes: string[];
  history: string[];
  portrait: string | null;
  editedByLabel: string | null;
  createdAt: string;
}

export function CharacterRevisionHistory({ characterId }: { characterId: string }) {
  const [revisions, setRevisions] = useState<CharacterRevision[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<CharacterRevision[]>(`/characters/${characterId}/revisions`)
      .then(setRevisions)
      .catch(() => setRevisions([]));
  }, [characterId]);

  return (
    <section className="mt-8 hologram-border rounded-lg p-6">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
        <History className="h-5 w-5 text-redlake-glow" /> Historique des révisions
      </h2>

      {revisions === null ? (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </p>
      ) : revisions.length === 0 ? (
        <p className="text-sm text-gray-600">
          Aucune révision — ce personnage n&apos;a pas encore été modifié depuis sa création.
        </p>
      ) : (
        <div className="space-y-2">
          {revisions.map((r, i) => {
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className="rounded border border-metal/40">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left"
                >
                  <span className="text-sm text-white">
                    Version avant modification n°{revisions.length - i}
                    {r.editedByLabel ? ` — par ${r.editedByLabel}` : ""}
                  </span>
                  <span className="flex items-center gap-2 font-mono text-[10px] text-gray-600">
                    {new Date(r.createdAt).toLocaleString("fr-FR")}
                    {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="space-y-2 border-t border-metal/30 px-3 py-3 text-sm">
                    <p className="text-white">{r.name} — {r.title} ({r.faction})</p>
                    <div>
                      <p className="font-mono text-[10px] uppercase text-gray-600">Biographie</p>
                      <p className="whitespace-pre-wrap text-gray-400">{r.biography || "—"}</p>
                    </div>
                    {r.quotes.length > 0 && (
                      <div>
                        <p className="font-mono text-[10px] uppercase text-gray-600">Citations</p>
                        <p className="whitespace-pre-wrap text-gray-400">{r.quotes.join("\n")}</p>
                      </div>
                    )}
                    {r.history.length > 0 && (
                      <div>
                        <p className="font-mono text-[10px] uppercase text-gray-600">Historique</p>
                        <p className="whitespace-pre-wrap text-gray-400">{r.history.join("\n")}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-4 font-mono text-xs text-gray-600">
        Chaque sauvegarde archive l&apos;état précédent de la fiche — rien n&apos;est jamais écrasé silencieusement.
      </p>
    </section>
  );
}
