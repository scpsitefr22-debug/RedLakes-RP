"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ClearanceBanner } from "@/components/clearance/ClearanceBanner";

interface ApiCharacter {
  id: string;
  slug: string;
  name: string;
  title: string;
  biography: string;
}

export function PersonnagesCatalog() {
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
        {characters.map((char) => (
          <Link
            key={char.id}
            href={`/personnages/${char.slug}`}
            className="group hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-redlake/30 bg-redlake/10">
              <User className="h-10 w-10 text-redlake-glow" />
            </div>
            <h2 className="mb-1 text-xl font-bold text-white group-hover:text-redlake-glow">
              {char.name}
            </h2>
            <p className="mb-2 text-sm text-gray-500">{char.title}</p>
            <p className="line-clamp-2 text-sm text-gray-600">{char.biography}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
