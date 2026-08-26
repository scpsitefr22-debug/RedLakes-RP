"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { glossary, type GlossaryTerm } from "@/lib/glossary";

/**
 * Petit "?" cliquable/survolable qui affiche une définition en langage
 * courant — pour le jargon RP (grade, faction, rapport...) qui perd les
 * nouveaux joueurs. Fonctionne au clic (mobile) et au survol (desktop).
 */
export function JargonTooltip({ term }: { term: GlossaryTerm }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center align-middle">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Définition"
        className="ml-1 inline-flex text-gray-600 transition-colors hover:text-redlake-glow"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded border border-metal bg-black/95 p-2.5 text-left font-sans text-[11px] font-normal normal-case leading-snug text-gray-300 shadow-xl"
        >
          {glossary[term]}
        </span>
      )}
    </span>
  );
}
