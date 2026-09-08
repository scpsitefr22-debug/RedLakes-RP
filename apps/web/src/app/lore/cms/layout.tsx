"use client";

import Link from "next/link";
import { usePlayerSession } from "@/hooks/usePlayerSession";

const STAFF_ROLES = new Set(["STAFF", "ADMIN"]);

/**
 * Meme garde que /staff/layout.tsx — l'API refusait deja les mutations
 * (401/403), mais cette page vivait hors /staff/ sans aucun garde visuel,
 * seule exception parmi les outils d'admin (voir audit RP/HRP).
 */
export default function LoreCmsLayout({ children }: { children: React.ReactNode }) {
  const session = usePlayerSession();

  if (session.loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-sm text-gray-500">
        Vérification de l&apos;habilitation...
      </div>
    );
  }

  if (!session.authenticated || !STAFF_ROLES.has(session.role ?? "")) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="panel-elevated mx-auto max-w-md rounded-lg p-10">
          <p className="font-mono text-xs tracking-[0.3em] text-redlake-glow">
            NIVEAU D&apos;HABILITATION INSUFFISANT
          </p>
          <h1 className="mt-4 text-3xl font-bold text-white">ACCÈS REFUSÉ</h1>
          <p className="mt-4 text-sm text-gray-500">
            Cette section est réservée au personnel autorisé du Site-12.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded border border-metal px-4 py-2 text-sm text-gray-300 transition-colors hover:border-redlake hover:text-white"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
