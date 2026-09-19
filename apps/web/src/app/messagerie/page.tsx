import { Terminal } from "lucide-react";
import { MessagerieView } from "@/components/messagerie/MessagerieView";

export const metadata = { title: "Messagerie" };

export default function MessageriePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 flex items-center gap-2 font-mono text-xs tracking-widest text-gray-500">
          <Terminal className="h-3 w-3" />
          TERMINAL — MESSAGERIE
        </p>
        <h1 className="text-4xl font-bold text-white">Messagerie</h1>
        <p className="mt-4 text-gray-500">
          Correspondance directe entre agents. Personnel pour le hors-RP entre joueurs,
          Professionnel pour les échanges en personnage dans la voie hiérarchique.
        </p>
      </div>

      <div className="hologram-border rounded-lg p-6">
        <MessagerieView />
      </div>
    </div>
  );
}
