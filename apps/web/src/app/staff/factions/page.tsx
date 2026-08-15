"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Plus, Landmark } from "lucide-react";

interface StaffFaction {
  id: string;
  slug: string;
  name: string;
  clearance: number;
  playable: boolean;
  departments: { id: string }[];
}

export default function StaffFactionsPage() {
  const [factions, setFactions] = useState<StaffFaction[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<StaffFaction[]>("/factions")
      .then(setFactions)
      .catch(() => setError("Impossible de charger les factions — API indisponible."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            GESTION DES FACTIONS — STAFF
          </p>
          <h1 className="text-4xl font-bold text-white">Factions</h1>
          <p className="mt-4 text-gray-500">
            Créez, modifiez et supprimez les factions du catalogue public.
          </p>
        </div>
        <Link
          href="/staff/factions/nouveau"
          className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30"
        >
          <Plus className="h-4 w-4" /> Nouvelle faction
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && !error && factions.length === 0 && (
        <p className="text-gray-500">Aucune faction dans le catalogue.</p>
      )}

      <div className="space-y-3">
        {factions.map((faction) => (
          <Link
            key={faction.id}
            href={`/staff/factions/${faction.id}`}
            className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
          >
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-redlake-glow" />
              <div>
                <h3 className="font-bold text-white">{faction.name}</h3>
                <p className="font-mono text-xs text-gray-600">
                  /{faction.slug} — {faction.departments.length} département{faction.departments.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-gray-500">
              {faction.playable ? "Jouable" : "Masquée"} — Niv. {faction.clearance}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
