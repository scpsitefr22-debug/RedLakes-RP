"use client";

import Link from "next/link";
import { useCoreSession } from "@/hooks/useCoreSession";
import { CoreShellProvider } from "@/components/core/CoreShellProvider";

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  const session = useCoreSession();

  if (session.loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-center text-sm text-gray-500">
        Connexion au réseau REDLAKES CORE…
      </div>
    );
  }

  if (!session.authenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black px-4 text-center">
        <div className="panel-elevated mx-auto max-w-md rounded-lg p-10">
          <p className="font-mono text-xs tracking-[0.3em] text-redlake-glow">
            AUTHENTIFICATION REQUISE
          </p>
          <h1 className="mt-4 text-3xl font-bold text-white">ACCÈS REFUSÉ</h1>
          <p className="mt-4 text-sm text-gray-500">
            REDLAKES CORE est réservé aux agents connectés.
          </p>
          <Link
            href="/connexion"
            className="mt-8 inline-block rounded border border-metal px-4 py-2 text-sm text-gray-300 transition-colors hover:border-redlake hover:text-white"
          >
            Se connecter
          </Link>
          <Link
            href="/"
            className="mt-3 block font-mono text-[10px] text-gray-600 hover:text-white"
          >
            ← Retour au site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CoreShellProvider session={session}>
      <div className="h-screen w-screen overflow-hidden">{children}</div>
    </CoreShellProvider>
  );
}
