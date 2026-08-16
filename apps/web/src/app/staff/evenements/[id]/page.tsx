"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GameEventEditor } from "@/components/staff/GameEventEditor";
import { apiFetch } from "@/lib/api";

interface ApiGameEventFull {
  slug: string;
  title: string;
  date: string;
  type: string;
  description: string;
  casualties: string | null;
  outcome: string;
  restrictedDepartmentIds: string[];
}

export default function EditGameEventPage() {
  const params = useParams();
  const id = params.id as string;
  const [event, setEvent] = useState<ApiGameEventFull | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ApiGameEventFull>(`/events/by-id/${id}`)
      .then(setEvent)
      .catch(() => setError("Événement introuvable ou API indisponible — connectez-vous en staff."));
  }, [id]);

  if (error) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-red-400">{error}</div>;
  }

  if (!event) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <GameEventEditor
      mode="edit"
      eventId={id}
      initial={{
        slug: event.slug,
        title: event.title,
        date: event.date.slice(0, 10),
        type: event.type,
        description: event.description,
        casualties: event.casualties ?? "",
        outcome: event.outcome,
        restrictedDepartmentIds: event.restrictedDepartmentIds,
      }}
    />
  );
}
