"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CharacterEditor } from "@/components/staff/CharacterEditor";
import { apiFetch } from "@/lib/api";

interface ApiCharacterFull {
  slug: string;
  name: string;
  title: string;
  faction: string;
  biography: string;
  quotes: string[];
  history: string[];
  portrait: string | null;
  clearance: number;
}

export default function EditCharacterPage() {
  const params = useParams();
  const id = params.id as string;
  const [character, setCharacter] = useState<ApiCharacterFull | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ApiCharacterFull>(`/characters/by-id/${id}`)
      .then(setCharacter)
      .catch(() => setError("Personnage introuvable ou API indisponible — connectez-vous en staff."));
  }, [id]);

  if (error) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-red-400">{error}</div>;
  }

  if (!character) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <CharacterEditor
      mode="edit"
      characterId={id}
      initial={{
        slug: character.slug,
        name: character.name,
        title: character.title,
        faction: character.faction,
        biography: character.biography,
        quotes: character.quotes.join("\n"),
        history: character.history.join("\n"),
        portrait: character.portrait ?? "",
        clearance: character.clearance.toString(),
      }}
    />
  );
}
