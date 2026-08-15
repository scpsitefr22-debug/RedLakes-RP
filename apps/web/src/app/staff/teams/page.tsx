"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Plus, Users } from "lucide-react";

interface StaffTeam {
  id: string;
  slug: string;
  name: string;
  category: string;
  department: { id: string; name: string } | null;
}

export default function StaffTeamsPage() {
  const [teams, setTeams] = useState<StaffTeam[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<StaffTeam[]>("/teams")
      .then(setTeams)
      .catch(() => setError("Impossible de charger les équipes — API indisponible."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            GESTION DES ÉQUIPES — STAFF
          </p>
          <h1 className="text-4xl font-bold text-white">Équipes</h1>
          <p className="mt-4 text-gray-500">
            Créez, modifiez et supprimez les équipes rattachées aux départements.
          </p>
        </div>
        <Link
          href="/staff/teams/nouveau"
          className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30"
        >
          <Plus className="h-4 w-4" /> Nouvelle équipe
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && !error && teams.length === 0 && (
        <p className="text-gray-500">Aucune équipe dans le catalogue.</p>
      )}

      <div className="space-y-3">
        {teams.map((team) => (
          <Link
            key={team.id}
            href={`/staff/teams/${team.id}`}
            className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-redlake-glow" />
              <div>
                <h3 className="font-bold text-white">{team.name}</h3>
                <p className="font-mono text-xs text-gray-600">
                  /{team.slug} — {team.category}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-gray-500">{team.department?.name ?? "Sans département"}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
