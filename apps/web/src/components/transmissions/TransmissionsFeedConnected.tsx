"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { type ClearanceLevel } from "@/lib/clearance";
import { type Transmission } from "@/lib/transmissions";
import { TransmissionsFeed } from "./TransmissionsFeed";

function clampClearance(n: number): ClearanceLevel {
  return Math.min(Math.max(Math.round(n), 1), 5) as ClearanceLevel;
}

export function TransmissionsFeedConnected({ transmissions }: { transmissions: Transmission[] }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [clearance, setClearance] = useState<ClearanceLevel>(1);

  useEffect(() => {
    (async () => {
      try {
        const auth = await apiFetch<{ authenticated: boolean }>("/auth/me");
        setAuthenticated(auth.authenticated);
        if (auth.authenticated) {
          // Habilitation reelle du personnage actif (resolue cote API), pas
          // une valeur simulee — voir la regle "clearance toujours verifiee
          // cote API" du spec CORE.
          const player = await apiFetch<{ clearanceLevel: number }>("/players/me");
          setClearance(clampClearance(player.clearanceLevel));
        }
      } catch {
        setAuthenticated(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      {!authenticated && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-black/30 p-4 text-sm text-gray-300">
          <p>Connectez-vous pour lire les transmissions selon votre vraie habilitation.</p>
          <Link href="/connexion" className="font-display text-sm font-bold uppercase tracking-[0.12em] text-redlake-glow hover:text-white">
            Se connecter →
          </Link>
        </div>
      )}
      <TransmissionsFeed transmissions={transmissions} playerClearance={authenticated ? clearance : undefined} authenticated={authenticated} />
    </div>
  );
}
