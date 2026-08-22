"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCoreShell } from "@/components/core/CoreShellProvider";

interface ApiTeam {
  id: string;
  slug: string;
  name: string;
  category: string;
  composition: string[];
  quota: number | null;
  description: string | null;
}

export function EquipesApp() {
  const { session } = useCoreShell();
  const departmentSlug = session.character?.gradeInfo?.departmentRef?.slug ?? null;
  const [teams, setTeams] = useState<ApiTeam[] | null>(null);

  useEffect(() => {
    if (!departmentSlug) {
      setTeams([]);
      return;
    }
    apiFetch<ApiTeam[]>(`/teams?department=${encodeURIComponent(departmentSlug)}`)
      .then(setTeams)
      .catch(() => setTeams([]));
  }, [departmentSlug]);

  if (!departmentSlug) {
    return (
      <p className="py-8 text-center text-sm text-gray-600">
        Aucun département associé à votre grade actuel — pas d&apos;équipes à afficher.
      </p>
    );
  }

  if (teams === null) return <p className="text-sm text-gray-500">Chargement…</p>;

  if (teams.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-600">
        Aucune équipe référencée dans votre département pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {teams.map((t) => (
        <div key={t.id} className="rounded-lg border border-metal/40 bg-black/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-redlake-glow" />
            <h3 className="font-bold text-white">{t.name}</h3>
            <span className="font-mono text-[10px] uppercase text-gray-600">{t.category}</span>
          </div>
          {t.description && <p className="mb-2 text-sm text-gray-400">{t.description}</p>}
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-gray-600">
            {t.composition.length > 0 && <span>{t.composition.join(", ")}</span>}
            {t.quota != null && <span>Quota : {t.quota}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
