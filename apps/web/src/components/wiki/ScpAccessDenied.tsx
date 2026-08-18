import Link from "next/link";

export function ScpAccessDenied() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="panel-elevated mx-auto max-w-md rounded-lg p-10">
        <p className="font-mono text-xs tracking-[0.3em] text-redlake-glow">
          NIVEAU D&apos;HABILITATION INSUFFISANT
        </p>
        <h1 className="mt-4 text-3xl font-bold text-white">ACCÈS REFUSÉ</h1>
        <p className="mt-4 text-sm text-gray-500">
          Ce dossier est classifié et réservé à un département spécifique du Site-12.
          Votre habilitation actuelle ne permet pas la consultation de cette fiche.
        </p>
        <Link
          href="/wiki"
          className="mt-8 inline-block rounded border border-metal px-4 py-2 text-sm text-gray-300 transition-colors hover:border-redlake hover:text-white"
        >
          Retour au Wiki SCP
        </Link>
      </div>
    </div>
  );
}
