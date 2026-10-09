"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-20">
      <div className="hologram-border relative overflow-hidden p-8 sm:p-12">
        <div className="hazard-stripes absolute inset-x-0 top-0 h-1.5" aria-hidden />
        <p className="label-mono flex items-center gap-2 text-hazard">
          <TriangleAlert className="h-4 w-4" />
          Incident technique
        </p>
        <h1 className="font-display mt-5 text-5xl font-extrabold text-white sm:text-6xl">
          Cette page n&apos;a pas pu s&apos;afficher
        </h1>
        <p className="mt-5 max-w-xl leading-relaxed text-gray-400">
          Le serveur a rencontré un problème en préparant cette page. Réessayez : s&apos;il vient de
          démarrer, quelques secondes suffisent souvent.
        </p>
        {error.digest && (
          <p className="label-mono mt-3 text-[10px] text-gray-600">Référence : {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="font-display flex items-center gap-2 bg-redlake-glow px-6 py-3 text-base font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#ff4a3f]"
          >
            <RotateCcw className="h-4 w-4" />
            Réessayer
          </button>
          <Link
            href="/"
            className="font-display flex items-center gap-2 border border-line-strong px-6 py-3 text-base font-bold uppercase tracking-[0.12em] text-gray-200 transition-colors hover:border-white hover:text-white"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
