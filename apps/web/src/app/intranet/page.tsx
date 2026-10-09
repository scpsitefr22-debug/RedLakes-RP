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
        <p className="label-mono mb-3 flex items-center gap-2 text-redlake-glow">
          <span className="h-px w-8 bg-redlake-glow" aria-hidden />
          Terminal RP — Réseau interne
        </p>
        <h1 className="font-display text-5xl font-extrabold text-white">Terminal intranet</h1>
        <p className="mt-4 max-w-2xl text-gray-400">
          Espace réservé au personnel enregistré, adapté à votre organisation en jeu. Déposez
          vos rapports RP et consultez les outils propres à votre faction.
        </p>
      </div>

      <IntranetTerminal />
    </div>
  );
}
