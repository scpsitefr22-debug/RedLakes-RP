"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ClearanceBanner } from "@/components/clearance/ClearanceBanner";
import { usePlayerSession, canViewClearance } from "@/hooks/usePlayerSession";
import { Badge } from "@/components/ui/Badge";

interface ApiCharacter {
  id: string;
  slug: string;
  name: string;
  title: string;
  biography: string;
  clearance: number;
}

export function PersonnagesCatalog() {
  const { clearance } = usePlayerSession();
  const [characters, setCharacters] = useState<ApiCharacter[]>([]);

  useEffect(() => {
    apiFetch<ApiCharacter[]>("/characters")
      .then(setCharacters)
      .catch(() => undefined);
  }, []);

  return (
    <>
      <ClearanceBanner />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {characters.map((char) => {
          const accessible = canViewClearance(char.clearance, clearance);
          return (
            <Link
              key={char.id}
              href={`/personnages/${char.slug}`}
              className="group hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-redlake/30 bg-redlake/10">
                {accessible ? (
                  <User className="h-10 w-10 text-redlake-glow" />
                ) : (
                  <Lock className="h-8 w-8 text-red-400/70" />
                )}
              </div>
              <h2 className="mb-1 text-xl font-bold text-white group-hover:text-redlake-glow">
                {accessible ? char.name : "████████"}
              </h2>
              <p className="mb-2 text-sm text-gray-500">
                {accessible ? char.title : "Dossier classifié"}
              </p>
              <p className="line-clamp-2 text-sm text-gray-600">
                {accessible ? char.biography : "[Identité expurgée]"}
              </p>
              <Badge className="mt-2">Niv. {char.clearance}</Badge>
            </Link>
          );
        })}
      </div>
    </>
  );
}
