"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCoreShell } from "@/components/core/CoreShellProvider";

interface ApiRosterPlayer {
  id: string;
  grade: string;
  factionInfo: { slug: string; name: string } | null;
  teamName: string | null;
  rpFirstName: string | null;
  rpLastName: string | null;
  user: { minecraftUsername: string; avatarUrl: string | null };
}

export function PersonnelApp() {
  const { session } = useCoreShell();
  const [players, setPlayers] = useState<ApiRosterPlayer[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    apiFetch<ApiRosterPlayer[]>("/players")
      .then(setPlayers)
      .catch(() => setPlayers([]));
  }, []);

  const roster = useMemo(() => {
    if (!players) return [];
    const q = query.trim().toLowerCase();
    return players
      .filter((p) => (p.factionInfo?.slug ?? "civil") === session.factionSlug)
      .filter((p) => {
        if (!q) return true;
        const name = [p.rpFirstName, p.rpLastName].filter(Boolean).join(" ");
        return (
          name.toLowerCase().includes(q) ||
          p.user.minecraftUsername.toLowerCase().includes(q) ||
          p.grade.toLowerCase().includes(q)
        );
      });
  }, [players, query, session.factionSlug]);

  if (players === null) return <p className="text-sm text-gray-500">Chargement…</p>;

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un nom, un grade…"
        className="w-full rounded border border-metal/50 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake"
      />

      {roster.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-600">
          Aucun personnel actif référencé dans {session.vocab.network} pour le moment.
        </p>
      ) : (
        <ul className="space-y-2">
          {roster.map((p) => {
            const name = [p.rpFirstName, p.rpLastName].filter(Boolean).join(" ");
            return (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded border border-metal/40 bg-black/30 p-3"
              >
                {p.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.user.avatarUrl}
                    alt={name || p.user.minecraftUsername}
                    className="h-9 w-9 rounded-full border border-metal/50"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-metal/50 bg-redlake/10">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {name || p.user.minecraftUsername}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {p.grade}
                    {p.teamName && ` — Équipe ${p.teamName}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
