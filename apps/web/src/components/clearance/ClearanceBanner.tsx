"use client";

import Link from "next/link";
import { Shield, Lock } from "lucide-react";
import { usePlayerSession } from "@/hooks/usePlayerSession";

/** Ce que le lecteur peut lire : contenu public, ou dossiers de son département. */
export function ClearanceBanner() {
  const { loading, authenticated, departmentName } = usePlayerSession();

  if (loading) {
    return <p className="label-mono mb-6 text-[10px] text-gray-500">Vérification de l&apos;accréditation…</p>;
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border border-line bg-black/30 px-4 py-3">
      <p className="flex items-center gap-2 text-sm text-gray-300">
        {authenticated ? <Shield className="h-4 w-4 text-redlake-glow" /> : <Lock className="h-4 w-4 text-gray-500" />}
        {authenticated ? (
          <>
            Accès : <span className="text-white">{departmentName ?? "personnel sans département"}</span>
          </>
        ) : (
          <>
            Visiteur : contenu public uniquement.
            <Link href="/connexion" className="text-redlake-glow hover:underline">
              Se connecter
            </Link>
          </>
        )}
      </p>
      {authenticated && (
        <Link href="/intranet" className="label-mono text-[10px] text-gray-500 hover:text-white">
          Terminal intranet →
        </Link>
      )}
    </div>
  );
}
