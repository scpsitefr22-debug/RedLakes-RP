import { Terminal } from "lucide-react";
import { IntranetTerminal } from "@/components/intranet/IntranetTerminal";

export const metadata = {
  title: "Intranet Site-12",
  description:
    "Terminal intranet du personnel : rapports RP, habilitation et accès aux secteurs selon votre grade.",
};

export default function IntranetPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 flex items-center gap-2 font-mono text-xs tracking-widest text-redlake-glow">
          <Terminal className="h-3 w-3" />
          RÉSEAU INTERNE // SITE-12
        </p>
        <h1 className="text-4xl font-bold text-white">Terminal intranet</h1>
        <p className="mt-4 text-gray-500">
          Espace réservé au personnel enregistré. Déposez vos rapports RP, consultez votre
          habilitation et accédez aux secteurs autorisés par votre grade. Les dossiers sont
          traités par le staff en jeu.
        </p>
      </div>

      <IntranetTerminal />
    </div>
  );
}
