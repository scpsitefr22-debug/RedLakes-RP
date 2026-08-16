"use client";

import Link from "next/link";
import { Shield, Lock } from "lucide-react";
import { usePlayerSession } from "@/hooks/usePlayerSession";

export function ClearanceBanner() {
  const { loading, authenticated, departmentName } = usePlayerSession();

  if (loading) {
    return (
      <p className="mb-6 font-mono text-xs text-gray-600">
        Vérification de l&apos;accréditation…
      </p>
    );
  }

  return (
    <div className="mb-8 hologram-border rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {authenticated ? (
            <Shield className="h-4 w-4 text-redlake-glow" />
          ) : (
            <Lock className="h-4 w-4 text-gray-500" />
          )}
          <p className="font-mono text-sm text-gray-400">
            {authenticated ? (
              <>
                Accès —{" "}
                <span className="text-redlake-glow">
                  {departmentName ?? "Personnel sans département"}
                </span>
              </>
            ) : (
              <>
                Visiteur non identifié — contenu public uniquement.{" "}
                <Link href="/connexion" className="text-redlake-glow hover:underline">
                  Se connecter
                </Link>
              </>
            )}
          </p>
        </div>
        {authenticated && (
          <Link
            href="/intranet"
            className="font-mono text-[10px] text-gray-600 hover:text-white"
          >
            Terminal intranet →
          </Link>
        )}
      </div>
    </div>
  );
}
