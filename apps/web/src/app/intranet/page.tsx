import { Terminal } from "lucide-react";
import { IntranetTerminal } from "@/components/intranet/IntranetTerminal";

export const metadata = {
  title: "Intranet Site-12",
  description:
    "Terminal intranet RP, adapté à la faction et au grade du joueur connecté.",
};

export default function IntranetPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 flex items-center gap-2 font-mono text-xs tracking-widest text-gray-500">
          <Terminal className="h-3 w-3" />
          TERMINAL RP
        </p>
        <h1 className="text-4xl font-bold text-white">Terminal intranet</h1>
        <p className="mt-4 text-gray-500">
          Espace réservé au personnel enregistré, adapté à votre organisation en jeu. Déposez
          vos rapports RP et consultez les outils propres à votre faction.
        </p>
      </div>

      <IntranetTerminal />
    </div>
  );
}
