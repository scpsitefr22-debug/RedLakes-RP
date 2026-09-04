import { Lock, ShieldQuestion } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

interface AegisAccessProps {
  onOpenDocument?: (documentId: string) => void;
}

export function AegisDatabaseApp({ onOpenDocument }: AegisAccessProps) {
  const { gns } = useGNSRequired();
  const unlocked = Boolean(gns.flags.ch5_database_unlocked);

  if (!unlocked) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <Lock className="h-8 w-8 text-metal/40" />
        <p className="text-xs text-metal">
          Accès révoqué. La base A.E.G.I.S. n'est consultable que pendant un audit actif.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/5 px-4 py-2">
        <ShieldQuestion className="h-4 w-4 text-amber-400" />
        <span className="text-[10px] uppercase tracking-wider text-amber-300">
          Accès temporaire — Base A.E.G.I.S.
        </span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <button
          type="button"
          onClick={() => onOpenDocument?.("doc-aegis-dossier-site12")}
          className="block w-full border border-amber-500/30 bg-[#0a1018] p-3 text-left transition-colors hover:border-amber-500/60"
        >
          <p className="text-xs text-foreground">AEGIS_DOSSIER_SITE-12.pdf</p>
          <p className="mt-1 text-[10px] text-metal">
            Synthèse de l'audit en cours — incidents Euclid-7, Nu-7, Keter-02.
          </p>
        </button>

        <div className="border border-dashboard-border bg-[#0a1018] p-3 text-[10px] text-metal">
          <p className="uppercase tracking-wider text-metal/80">Note de procédure</p>
          <p className="mt-2 leading-relaxed">
            L'accès à cette base est journalisé en temps réel par A.E.G.I.S., pas par le Site.
            Il sera révoqué automatiquement à la clôture de l'audit.
          </p>
        </div>
      </div>
    </div>
  );
}
