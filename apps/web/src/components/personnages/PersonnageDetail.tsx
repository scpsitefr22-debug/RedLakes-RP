"use client";

import Link from "next/link";
import { characters } from "@/data/lore";
import { Badge } from "@/components/ui/Badge";
import { CLEARANCE_LABELS } from "@/lib/clearance";
import { Quote, Lock, ArrowLeft } from "lucide-react";
import { usePlayerSession, canViewClearance } from "@/hooks/usePlayerSession";

export function PersonnageDetail({ id }: { id: string }) {
  const { clearance, authenticated } = usePlayerSession();
  const character = characters.find((c) => c.id === id);

  if (!character) {
    return <p className="text-gray-500">Personnage introuvable.</p>;
  }

  const accessible = canViewClearance(character.clearance, clearance);

  return (
    <>
      <Link
        href="/personnages"
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Personnages
      </Link>
      <div className="mb-8 flex gap-6">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-redlake/30 bg-redlake/10">
          {accessible ? (
            <span className="font-mono text-2xl text-redlake-glow">██</span>
          ) : (
            <Lock className="h-8 w-8 text-red-400/70" />
          )}
        </div>
        <div>
          <Badge variant="classified" className="mb-2">
            {CLEARANCE_LABELS[character.clearance]}
          </Badge>
          <h1 className="text-3xl font-bold text-white">
            {accessible ? character.name : "████████ — ACCÈS REFUSÉ"}
          </h1>
          <p className="text-gray-500">
            {accessible ? character.title : "Dossier classifié"}
          </p>
          {accessible && (
            <p className="mt-1 text-sm text-gray-600">{character.faction}</p>
          )}
        </div>
      </div>

      {accessible ? (
        <div className="space-y-6">
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Biographie</h2>
            <p className="text-gray-400">{character.biography}</p>
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
            <ul className="space-y-2">
              {character.history.map((h) => (
                <li key={h} className="text-gray-400">▸ {h}</li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <div className="hologram-border rounded-lg p-8 text-center">
          <p className="font-mono text-red-400/70">
            [DONNÉES EXPURGÉES] Habilitation niveau {character.clearance} requise
            (vous : niveau {clearance}).
          </p>
          {!authenticated && (
            <Link
              href="/connexion"
              className="mt-4 inline-block text-sm text-redlake-glow hover:underline"
            >
              Se connecter pour vérifier votre habilitation
            </Link>
          )}
        </div>
      )}
    </>
  );
}
