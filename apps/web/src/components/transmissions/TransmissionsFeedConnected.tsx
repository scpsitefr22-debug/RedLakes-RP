"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { type ClearanceLevel } from "@/lib/clearance";
import { type Transmission } from "@/lib/transmissions";
import { TransmissionsFeed } from "./TransmissionsFeed";

export function TransmissionsFeedConnected({
  transmissions,
}: {
  transmissions: Transmission[];
}) {
  const [clearance, setClearance] = useState<ClearanceLevel | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const auth = await apiFetch<{ authenticated: boolean }>("/auth/me");
        if (!auth.authenticated) {
          setAuthenticated(false);
          return;
        }
        setAuthenticated(true);
        const player = await apiFetch<{ clearance: number }>("/players/me");
        setClearance(
          Math.min(Math.max(Math.round(player.clearance), 1), 5) as ClearanceLevel,
        );
      } catch {
        setAuthenticated(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      {!authenticated && (
        <div className="rounded-lg border border-metal/50 bg-metal/10 p-4 text-sm text-gray-500">
          <p>
            Connectez-vous pour afficher votre habilitation réelle (dérivée de votre grade).
          </p>
          <Link
            href="/connexion"
            className="mt-2 inline-block font-mono text-xs text-redlake-glow hover:underline"
          >
            Ouvrir le terminal d&apos;identification →
          </Link>
        </div>
      )}
      <TransmissionsFeed
        transmissions={transmissions}
        playerClearance={clearance ?? undefined}
        authenticated={authenticated}
      />
    </div>
  );
}
