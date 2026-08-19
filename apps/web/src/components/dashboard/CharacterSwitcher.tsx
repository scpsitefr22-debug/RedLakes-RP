"use client";

import { useEffect, useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getFactionTheme } from "@/lib/faction-theme";

interface Character {
  id: string;
  grade: string;
  faction: string;
  factionInfo?: { slug: string } | null;
  rpFirstName: string | null;
  rpLastName: string | null;
  createdAt: string;
  isActive: boolean;
}

export function CharacterSwitcher({ onSwitched }: { onSwitched?: () => void }) {
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    apiFetch<Character[]>("/players/me/characters")
      .then(setCharacters)
      .catch(() => setCharacters([]));
  };

  useEffect(load, []);

  const activate = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/players/me/characters/${id}/activate`, { method: "POST" });
      load();
      onSwitched?.();
    } catch {
      setError("Impossible de changer de personnage.");
    } finally {
      setBusy(false);
    }
  };

  const createCharacter = async () => {
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/players/me/characters", { method: "POST" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer un personnage.");
    } finally {
      setBusy(false);
    }
  };

  if (characters === null) return null;

  return (
    <section className="mb-8 panel-flat rounded-lg p-6">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
        <Users className="h-5 w-5 text-redlake-glow" />
        Vos personnages
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {characters.map((c) => {
          const theme = getFactionTheme(c.factionInfo?.slug);
          const name =
            [c.rpFirstName, c.rpLastName].filter(Boolean).join(" ") || "Sans identité RP";
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => !c.isActive && activate(c.id)}
              disabled={busy || c.isActive}
              className="rounded-lg border p-4 text-left transition-colors disabled:cursor-default"
              style={{
                borderColor: c.isActive ? theme.color : "var(--metal)",
                background: c.isActive ? `${theme.color}14` : "transparent",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-white">{name}</p>
                {c.isActive && (
                  <span
                    className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase"
                    style={{ borderColor: theme.color, color: theme.color }}
                  >
                    Actif
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {c.grade} — {theme.label}
              </p>
              {!c.isActive && (
                <p className="mt-2 font-mono text-[10px] text-gray-600">
                  Cliquer pour activer
                </p>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={createCharacter}
        disabled={busy || characters.length >= 5}
        className="mt-4 flex items-center gap-2 rounded border border-metal px-4 py-2 font-mono text-xs text-gray-400 transition-colors hover:border-redlake hover:text-white disabled:opacity-50"
      >
        <UserPlus className="h-3.5 w-3.5" />
        {characters.length >= 5 ? "Maximum atteint (5)" : "Créer un nouveau personnage"}
      </button>
      {error && <p className="mt-2 font-mono text-xs text-redlake-glow">{error}</p>}
      <p className="mt-3 font-mono text-[10px] text-gray-600">
        Activer un personnage change votre faction/grade partout sur le site
        (intranet, rapports, dossier). Vos autres personnages gardent leur
        propre historique.
      </p>
    </section>
  );
}
