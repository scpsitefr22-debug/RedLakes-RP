"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Plus, User } from "lucide-react";

interface StaffCharacter {
  id: string;
  slug: string;
  name: string;
  title: string;
  faction: string;
}

export default function StaffPersonnagesPage() {
  const [characters, setCharacters] = useState<StaffCharacter[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<StaffCharacter[]>("/characters/cms")
      .then(setCharacters)
      .catch(() => setError("Impossible de charger les personnages — API indisponible."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            GESTION DES PERSONNAGES — STAFF
          </p>
          <h1 className="text-4xl font-bold text-white">Personnages</h1>
          <p className="mt-4 text-gray-500">
            Créez, modifiez et supprimez les fiches de personnages importants.
          </p>
        </div>
        <Link
          href="/staff/personnages/nouveau"
          className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30"
        >
          <Plus className="h-4 w-4" /> Nouveau personnage
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && !error && characters.length === 0 && (
        <p className="text-gray-500">Aucun personnage enregistré.</p>
      )}

      <div className="space-y-3">
        {characters.map((c) => (
          <Link
            key={c.id}
            href={`/staff/personnages/${c.id}`}
            className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-redlake-glow" />
              <div>
                <h3 className="font-bold text-white">{c.name}</h3>
                <p className="font-mono text-xs text-gray-600">{c.title} — {c.faction}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
