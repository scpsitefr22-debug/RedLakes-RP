"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { type ClearanceLevel } from "@/lib/clearance";
import { type Transmission } from "@/lib/transmissions";
import { TransmissionsFeed } from "./TransmissionsFeed";

const FULL_CLEARANCE = 5 as ClearanceLevel;

export function TransmissionsFeedConnected({
  transmissions,
}: {
  transmissions: Transmission[];
}) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const auth = await apiFetch<{ authenticated: boolean }>("/auth/me");
        setAuthenticated(auth.authenticated);
      } catch {
        setAuthenticated(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      {!authenticated && (
        <div className="rounded-lg border border-metal/50 bg-metal/10 p-4 text-sm text-gray-500">
          <p>Connectez-vous pour accéder à l&apos;ensemble des transmissions.</p>
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
        playerClearance={authenticated ? FULL_CLEARANCE : undefined}
        authenticated={authenticated}
      />
    </div>
  );
}
