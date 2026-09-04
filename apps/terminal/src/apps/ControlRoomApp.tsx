import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

interface ContainmentZone {
  id: string;
  label: string;
}

const ZONES: ContainmentZone[] = [
  { id: "keter-02", label: "Secteur Keter-02" },
  { id: "keter-adj", label: "Secteurs adjacents" },
  { id: "euclid-7", label: "Secteur Euclid-7" },
  { id: "safe-general", label: "Secteurs Safe" },
];

export function ControlRoomApp() {
  const { gns } = useGNSRequired();
  const breachActive = Boolean(gns.flags.ch7_breach_active);
  const resolved = Boolean(gns.flags.ch7_containment_resolved);

  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex items-center justify-between border-b px-4 py-2 text-[10px] uppercase tracking-wider ${
          breachActive ? "border-red-500/40 bg-red-950/20 text-red-300" : "border-dashboard-border text-metal"
        }`}
      >
        <span>Salle de contrôle — Confinement</span>
        <span>{breachActive ? "ALERTE ACTIVE" : resolved ? "Résolu" : "Nominal"}</span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {ZONES.map((zone) => {
          const critical = zone.id === "keter-02" && breachActive;
          return (
            <div
              key={zone.id}
              className={`flex items-center justify-between border p-3 ${
                critical
                  ? "animate-pulse border-red-500/50 bg-red-950/20"
                  : "border-dashboard-border bg-[#0a1018]"
              }`}
            >
              <div className="flex items-center gap-2">
                {critical ? (
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-terminal" />
                )}
                <span className="text-xs text-foreground">{zone.label}</span>
              </div>
              <span className={`text-[9px] uppercase tracking-wide ${critical ? "text-red-300" : "text-terminal"}`}>
                {critical ? "Confinement compromis" : "Scellé"}
              </span>
            </div>
          );
        })}
      </div>

      {breachActive && (
        <div className="border-t border-red-500/30 bg-red-950/10 px-4 py-2 text-[10px] text-red-200">
          Répondez aux instructions du Commandant Vance sur la messagerie — cette console est en lecture
          seule.
        </div>
      )}
    </div>
  );
}
