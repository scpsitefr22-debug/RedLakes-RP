"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ClearanceBanner } from "@/components/clearance/ClearanceBanner";

interface ApiCharacter {
  id: string;
  slug: string;
  name: string;
  title: string;
  faction: string;
  biography: string;
  portrait: string | null;
}

export function PersonnagesCatalog() {
  const [characters, setCharacters] = useState<ApiCharacter[]>([]);
  const [query, setQuery] = useState("");
  const [factionFilter, setFactionFilter] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ApiCharacter[]>("/characters")
      .then(setCharacters)
      .catch(() => undefined);
  }, []);

  const factions = useMemo(
    () => [...new Set(characters.map((c) => c.faction).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr")),
    [characters],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return characters.filter((c) => {
      if (factionFilter && c.faction !== factionFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.biography.toLowerCase().includes(q)
      );
    });
  }, [characters, query, factionFilter]);

  return (
    <>
      <ClearanceBanner />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un nom, un titre…"
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
      </div>

      {visible.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          {characters.length === 0
            ? "Aucun personnage référencé pour le moment."
            : "Aucun personnage ne correspond à ce filtre."}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((char) => (
            <Link
              key={char.id}
              href={`/personnages/${char.slug}`}
              className="group hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
            >
              {char.portrait ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={char.portrait}
                  alt={char.name}
                  className="mb-4 h-20 w-20 rounded-full border border-redlake/30 object-cover"
                />
              ) : (
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-redlake/30 bg-redlake/10">
                  <User className="h-10 w-10 text-redlake-glow" />
                </div>
              )}
              <h2 className="mb-1 text-xl font-bold text-white group-hover:text-redlake-glow">
                {char.name}
              </h2>
              <p className="mb-2 text-sm text-gray-500">{char.title}</p>
              <p className="line-clamp-2 text-sm text-gray-600">{char.biography}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
