import { useState } from "react";
import { Waypoints, TriangleAlert } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

interface TunnelNode {
  id: string;
  label: string;
  charted: boolean;
  ritual?: boolean;
}

const TUNNEL_NODES: TunnelNode[] = [
  { id: "access-a", label: "Accès A — sous Site-12", charted: true },
  { id: "access-b", label: "Accès B — Vieux port", charted: true },
  { id: "junction-1", label: "Jonction principale", charted: true },
  { id: "ritual-site", label: "Site rituel — non répertorié", charted: false, ritual: true },
  { id: "unknown-1", label: "Galerie inconnue", charted: false },
  { id: "unknown-2", label: "Galerie inconnue", charted: false },
];

export function SewerSchematicsApp() {
  const { gns } = useGNSRequired();
  const [selected, setSelected] = useState<string | null>(null);
  const reportDone = Boolean(gns.flags.ch4_report_done);
  const node = TUNNEL_NODES.find((n) => n.id === selected) ?? null;

  return (
    <div className="flex h-full">
      <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto p-3 sm:grid-cols-3">
        {TUNNEL_NODES.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setSelected(n.id)}
            className={`relative flex min-h-[70px] flex-col items-start justify-end gap-1 border p-2 text-left transition-colors ${
              selected === n.id
                ? "border-dashboard-accent"
                : n.ritual
                  ? "border-amber-500/50 bg-amber-500/5"
                  : n.charted
                    ? "border-dashboard-border bg-[#0a1018]"
                    : "border-dashboard-border/50 bg-[#05080c] text-metal/70"
            }`}
          >
            {n.ritual && (
              <TriangleAlert className="absolute right-2 top-2 h-3.5 w-3.5 text-amber-400" />
            )}
            <Waypoints className="h-3 w-3 opacity-70" />
            <span className="text-[10px] leading-tight">{n.label}</span>
          </button>
        ))}
      </div>

      <div className="w-64 shrink-0 border-l border-dashboard-border bg-[#0a1018] p-3 text-[10px]">
        <p className="uppercase tracking-wider text-metal">Réseau souterrain — REDLAKES</p>
        {node ? (
          <>
            <p className="mt-3 text-xs text-foreground">{node.label}</p>
            <p className="mt-2 leading-relaxed text-metal">
              {node.charted
                ? "Zone balisée et sécurisée."
                : "Hors balisage — origine antérieure à la cartographie municipale."}
            </p>
            {node.ritual && (
              <p className="mt-3 text-amber-400">
                {reportDone
                  ? "Rapport clos — voir Base SCP et Journal des incidents pour les suites."
                  : "Zone active lors de l'incident de juin. Statut actuel non confirmé."}
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 text-metal">Sélectionnez une galerie sur le schéma.</p>
        )}
      </div>
    </div>
  );
}
