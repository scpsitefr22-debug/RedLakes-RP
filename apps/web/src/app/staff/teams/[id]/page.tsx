"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TeamEditor } from "@/components/staff/TeamEditor";
import { apiFetch } from "@/lib/api";

interface ApiTeamFull {
  slug: string;
  name: string;
  departmentId: string;
  category: string;
  composition: string[];
  hasMedic: boolean;
  customizableBy: string | null;
  chefId: string | null;
  quota: number | null;
  description: string | null;
}

export default function EditTeamPage() {
  const params = useParams();
  const id = params.id as string;
  const [team, setTeam] = useState<ApiTeamFull | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ApiTeamFull>(`/teams/by-id/${id}`)
      .then(setTeam)
      .catch(() => setError("Équipe introuvable ou API indisponible — connectez-vous en staff."));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-red-400">
        {error}
      </div>
    );
  }

  if (!team) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <TeamEditor
      mode="edit"
      teamId={id}
      initial={{
        slug: team.slug,
        name: team.name,
        departmentId: team.departmentId,
        category: team.category,
        composition: team.composition.join(", "),
        hasMedic: team.hasMedic,
        customizableBy: team.customizableBy ?? "",
        chefId: team.chefId ?? "",
        quota: team.quota?.toString() ?? "",
        description: team.description ?? "",
      }}
    />
  );
}
