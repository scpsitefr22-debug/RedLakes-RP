"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FactionEditor } from "@/components/staff/FactionEditor";
import { apiFetch } from "@/lib/api";

interface ApiFactionFull {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  history: string | null;
  color: string | null;
  playable: boolean;
  objectives: string[];
  chefId: string | null;
  deputyIds: string[];
  budget: number;
}

export default function EditFactionPage() {
  const params = useParams();
  const id = params.id as string;
  const [faction, setFaction] = useState<ApiFactionFull | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ApiFactionFull>(`/factions/by-id/${id}`)
      .then(setFaction)
      .catch(() => setError("Faction introuvable ou API indisponible — connectez-vous en staff."));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-red-400">
        {error}
      </div>
    );
  }

  if (!faction) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <FactionEditor
      mode="edit"
      factionId={id}
      initial={{
        slug: faction.slug,
        name: faction.name,
        tagline: faction.tagline ?? "",
        description: faction.description ?? "",
        history: faction.history ?? "",
        color: faction.color ?? "",
        playable: faction.playable,
        objectives: faction.objectives.join(", "),
        chefId: faction.chefId ?? "",
        deputyIds: faction.deputyIds.join(", "),
        budget: faction.budget.toString(),
      }}
    />
  );
}
