"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Quote, ArrowLeft } from "lucide-react";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";

interface ApiCharacter {
  name: string;
  title: string;
  faction: string;
  biography: string;
  quotes: string[];
  history: string[];
  portrait: string | null;
}

export function PersonnageDetail({ id }: { id: string }) {
  const [character, setCharacter] = useState<ApiCharacter | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    apiFetch<ApiCharacter>(`/characters/${id}`)
      .then(setCharacter)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return <p className="text-gray-500">Personnage introuvable ou accès restreint.</p>;
  }

  if (!character) {
    return <p className="text-gray-500">Chargement...</p>;
  }

  return (
    <>
      <Link
        href="/personnages"
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Personnages
      </Link>
      <div className="mb-8 flex gap-6">
        {character.portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.portrait}
            alt={character.name}
            className="h-24 w-24 shrink-0 rounded-full border border-redlake/30 object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-redlake/30 bg-redlake/10">
            <span className="font-mono text-2xl text-redlake-glow">██</span>
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-white">{character.name}</h1>
          <p className="text-gray-500">{character.title}</p>
          <p className="mt-1 text-sm text-gray-600">{character.faction}</p>
        </div>
      </div>

      <div className="space-y-6">
        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Biographie</h2>
          <DiscordMarkdown text={character.biography} className="text-gray-400" />
        </section>

        {character.quotes.length > 0 && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <Quote className="h-5 w-5 text-redlake-glow" />
              Citations
            </h2>
            {character.quotes.map((q) => (
              <blockquote
                key={q}
                className="mb-3 border-l-2 border-redlake/30 pl-4 italic text-gray-500"
              >
                &quot;{q}&quot;
              </blockquote>
            ))}
          </section>
        )}

        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Historique</h2>
          <ul className="space-y-3">
            {character.history.map((h) => (
              <li key={h} className="flex gap-2 text-gray-400">
                <span className="shrink-0 text-redlake-glow">▸</span>
                <DiscordMarkdown text={h} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
