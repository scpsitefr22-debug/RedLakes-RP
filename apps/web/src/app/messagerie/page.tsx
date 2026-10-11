import { Suspense } from "react";
import { Terminal } from "lucide-react";
import { MessagerieView } from "@/components/messagerie/MessagerieView";

export const metadata = { title: "Messagerie" };

export default function MessageriePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="label-mono mb-3 flex items-center gap-2 text-redlake-glow">
          <Terminal className="h-3.5 w-3.5" />
          Terminal — Messagerie
        </p>
        <h1 className="font-display text-5xl font-extrabold text-white">Messagerie</h1>
        <p className="mt-4 max-w-2xl text-gray-400">
          Correspondance directe entre agents : <span className="text-gray-200">Personnel</span> pour le
          hors-RP entre joueurs, <span className="text-gray-200">Professionnel</span> pour les échanges en
          personnage, dans la voie hiérarchique.
        </p>
      </div>

      <div className="panel-elevated overflow-hidden">
        {/* MessagerieView lit ?dm= (useSearchParams) : sans Suspense, le build
            de production échoue sur cette page (prerender impossible). */}
        <Suspense fallback={<p className="p-6 text-sm text-gray-500">Chargement de la messagerie…</p>}>
          <MessagerieView heightClass="h-[70vh] min-h-[520px]" />
        </Suspense>
      </div>
    </div>
  );
}
