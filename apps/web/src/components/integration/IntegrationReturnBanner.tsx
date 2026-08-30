"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, ClipboardList } from "lucide-react";

const STORAGE_KEY = "redlakes_integration_active";

/**
 * Bandeau flottant rappelant de revenir au dossier d'intégration — affiché
 * sur toutes les pages une fois le questionnaire commencé (les indices
 * s'ouvrent dans un nouvel onglet, donc rien ne ramène naturellement les
 * joueurs vers /integration une fois partis explorer une fiche).
 */
export function IntegrationReturnBanner() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    try {
      setActive(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* stockage indisponible — pas de bandeau, tant pis */
    }
  }, [pathname]);

  if (!active || pathname === "/integration") return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full border border-redlake/40 bg-black/95 py-2 pl-4 pr-2 shadow-xl backdrop-blur">
        <ClipboardList className="h-4 w-4 shrink-0 text-redlake-glow" />
        <Link
          href="/integration"
          className="font-mono text-xs text-gray-300 hover:text-white"
        >
          ← Retour au dossier d&apos;intégration
        </Link>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch {
              /* ignore */
            }
            setActive(false);
          }}
          aria-label="Masquer"
          className="rounded-full p-1 text-gray-600 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
