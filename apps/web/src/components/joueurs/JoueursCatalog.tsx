"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Award } from "lucide-react";

interface ApiPlayer {
  id: string;
  grade: string;
  faction: string;
  teamName?: string | null;
  rpFirstName?: string | null;
  rpLastName?: string | null;
  reputation: number;
  medals: string[];
  roleUpdatedAt?: string;
  user: { minecraftUsername: string; avatarUrl: string };
}

type SortMode = "recent" | "reputation" | "name";

const SORT_LABELS: Record<SortMode, string> = {
  recent: "Activité récente",
  reputation: "Réputation",
  name: "Nom",
};

export function JoueursCatalog({ players }: { players: ApiPlayer[] }) {
  const [query, setQuery] = useState("");
  const [factionFilter, setFactionFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("recent");

  const factions = useMemo(
    () => [...new Set(players.map((p) => p.faction).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr")),
    [players],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = players.filter((p) => {
      if (factionFilter && p.faction !== factionFilter) return false;
      if (!q) return true;
      const name = [p.rpFirstName, p.rpLastName].filter(Boolean).join(" ");
      return (
        name.toLowerCase().includes(q) ||
        p.user.minecraftUsername.toLowerCase().includes(q) ||
        p.grade.toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) => {
      if (sort === "reputation") return b.reputation - a.reputation;
      if (sort === "name") {
        const nameA = [a.rpFirstName, a.rpLastName].filter(Boolean).join(" ") || a.user.minecraftUsername;
        const nameB = [b.rpFirstName, b.rpLastName].filter(Boolean).join(" ") || b.user.minecraftUsername;
        return nameA.localeCompare(nameB, "fr");
      }
      return new Date(b.roleUpdatedAt ?? 0).getTime() - new Date(a.roleUpdatedAt ?? 0).getTime();
    });
    return list;
  }, [players, query, factionFilter, sort]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un nom, un pseudo, un grade…"
          className="min-w-[240px] flex-1 rounded border border-metal/50 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-redlake"
        />
        {factions.length > 1 && (
          <select
            value={factionFilter ?? ""}
            onChange={(e) => setFactionFilter(e.target.value || null)}
            className="rounded border border-metal/50 bg-black/40 px-3 py-2 font-mono text-xs uppercase tracking-wider text-gray-400 outline-none focus:border-redlake"
          >
            <option value="">Toutes les factions</option>
            {factions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        )}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="rounded border border-metal/50 bg-black/40 px-3 py-2 font-mono text-xs uppercase tracking-wider text-gray-400 outline-none focus:border-redlake"
        >
          {(Object.entries(SORT_LABELS) as [SortMode, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              Trier : {label}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          Aucun joueur ne correspond à ce filtre.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((player) => (
            <Link
              key={player.id}
              href={`/joueurs/${encodeURIComponent(player.user.minecraftUsername)}`}
              className="hologram-border block rounded-lg p-5 transition-colors hover:border-redlake/40"
            >
              <div className="mb-4 flex items-center gap-3">
                {player.user.avatarUrl ? (
                  <Image
                    src={player.user.avatarUrl}
                    alt={player.user.minecraftUsername}
                    width={48}
                    height={48}
                    className="rounded-full border border-redlake/30"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-redlake/30 bg-redlake/10">
                    <User className="h-6 w-6 text-redlake-glow" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white">
                    {[player.rpFirstName, player.rpLastName].filter(Boolean).join(" ") ||
                      player.user.minecraftUsername}
                  </h3>
                  <p className="text-xs text-gray-500">{player.grade}</p>
                  {(player.rpFirstName || player.rpLastName) && (
                    <p className="font-mono text-[10px] text-gray-600">
                      MC : {player.user.minecraftUsername}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1 font-mono text-xs text-gray-600">
                <p>Faction : <span className="text-gray-400">{player.faction}</span></p>
                {player.teamName && (
                  <p>Équipe : <span className="text-gray-400">{player.teamName}</span></p>
                )}
                <p>Réputation : <span className="text-gray-400">{player.reputation}/100</span></p>
                <p className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {player.medals.length} médaille(s)
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
