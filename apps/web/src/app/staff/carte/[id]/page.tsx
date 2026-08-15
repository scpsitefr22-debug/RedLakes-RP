"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapLocationEditor } from "@/components/staff/MapLocationEditor";
import { apiFetch } from "@/lib/api";

interface ApiMapLocationFull {
  slug: string;
  name: string;
  type: string;
  x: number;
  y: number;
  description: string;
  history: string;
  danger: number;
  faction: string | null;
}

export default function EditMapLocationPage() {
  const params = useParams();
  const id = params.id as string;
  const [location, setLocation] = useState<ApiMapLocationFull | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ApiMapLocationFull>(`/map/by-id/${id}`)
      .then(setLocation)
      .catch(() => setError("Emplacement introuvable ou API indisponible — connectez-vous en staff."));
  }, [id]);

  if (error) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-red-400">{error}</div>;
  }

  if (!location) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <MapLocationEditor
      mode="edit"
      locationId={id}
      initial={{
        slug: location.slug,
        name: location.name,
        type: location.type,
        x: location.x.toString(),
        y: location.y.toString(),
        description: location.description,
        history: location.history,
        danger: location.danger.toString(),
        faction: location.faction ?? "",
      }}
    />
  );
}
