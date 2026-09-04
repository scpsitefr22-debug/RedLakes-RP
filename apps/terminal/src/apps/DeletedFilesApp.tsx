import { FileX2, RotateCcw } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

interface RecoveredFragment {
  id: string;
  label: string;
  integrity: number;
  content: string;
  flag: string;
}

const FRAGMENTS: RecoveredFragment[] = [
  {
    id: "amir-fragment",
    label: "MSG_HASSAN_A_partiel.log",
    integrity: 40,
    flag: "ch6_project_hint_found",
    content:
      "« ...Projet ████... date de gel antérieure à la fondation du Site... je ne suis pas censé savoir... »",
  },
];

export function DeletedFilesApp() {
  const { gns } = useGNSRequired();
  const digging = Boolean(gns.flags.ch6_digging);

  if (!digging) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <FileX2 className="h-8 w-8 text-metal/40" />
        <p className="text-xs text-metal">Aucune tentative de récupération en cours.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-dashboard-border px-4 py-2 text-[10px] uppercase tracking-wider text-metal">
        Fichiers supprimés — récupération partielle
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {FRAGMENTS.map((frag) => {
          const recovered = Boolean(gns.flags[frag.flag]);
          return (
            <div key={frag.id} className="border border-dashboard-border bg-[#0a1018] p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground">{frag.label}</span>
                <span className="flex items-center gap-1 text-[9px] text-metal">
                  <RotateCcw className="h-3 w-3" />
                  {recovered ? `${frag.integrity}% récupéré` : "récupération en cours…"}
                </span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden bg-background">
                <div
                  className="h-full bg-amber-500/70"
                  style={{ width: `${recovered ? frag.integrity : 10}%` }}
                />
              </div>
              {recovered ? (
                <p className="mt-3 whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-foreground/80">
                  {frag.content}
                </p>
              ) : (
                <p className="mt-3 text-[10px] italic text-metal/60">Données insuffisantes pour reconstitution.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
