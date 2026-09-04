import { useState } from "react";
import { ShieldCheck, ShieldAlert, FileText } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

interface ProtocolEntry {
  id: string;
  sector: string;
  scpClass: "Safe" | "Euclid" | "Keter";
  threshold: string;
  lastReview: string;
  anomalyFlag?: string;
}

const PROTOCOL_ENTRIES: ProtocolEntry[] = [
  {
    id: "safe-general",
    sector: "Secteurs Safe — généraux",
    scpClass: "Safe",
    threshold: "Standard — pas de surveillance renforcée",
    lastReview: "Janvier 2026",
  },
  {
    id: "euclid7",
    sector: "Secteur Euclid-7",
    scpClass: "Euclid",
    threshold: "Seuil d'alerte : +/- 5% — co-signature clearance 3+ requise pour modification",
    lastReview: "Juin 2026",
    anomalyFlag: "ch2_protocol_anomaly_found",
  },
  {
    id: "keter02",
    sector: "Secteur Keter-02",
    scpClass: "Keter",
    threshold: "Verrouillage automatique — aucune modification manuelle autorisée",
    lastReview: "Mai 2026",
  },
];

interface ProtocolsAppProps {
  onOpenDocument?: (documentId: string) => void;
}

export function ProtocolsApp({ onOpenDocument }: ProtocolsAppProps) {
  const { gns } = useGNSRequired();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-dashboard-border px-4 py-2 text-[10px] uppercase tracking-wider text-metal">
        Protocoles de confinement — Site-12
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {PROTOCOL_ENTRIES.map((protocol) => {
          const anomaly = Boolean(protocol.anomalyFlag && gns.flags[protocol.anomalyFlag]);
          const expanded = expandedId === protocol.id;
          return (
            <div
              key={protocol.id}
              className={`border p-3 transition-colors ${
                anomaly ? "border-red-500/50 bg-red-950/10" : "border-dashboard-border bg-[#0a1018]"
              }`}
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : protocol.id)}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <div className="flex items-center gap-2">
                  {anomaly ? (
                    <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 shrink-0 text-terminal" />
                  )}
                  <span className="text-xs text-foreground">{protocol.sector}</span>
                </div>
                <span
                  className={`text-[9px] uppercase tracking-wide ${
                    protocol.scpClass === "Keter"
                      ? "text-redlake"
                      : protocol.scpClass === "Euclid"
                        ? "text-amber-500"
                        : "text-terminal"
                  }`}
                >
                  {protocol.scpClass}
                </span>
              </button>

              {anomaly && (
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-red-300">
                  Anomalie détectée — modification non co-signée
                </p>
              )}

              {expanded && (
                <div className="mt-2 space-y-1 border-t border-dashboard-border/60 pt-2 text-[10px] text-metal">
                  <p>{protocol.threshold}</p>
                  <p className="text-metal/70">Dernière révision : {protocol.lastReview}</p>
                  {anomaly && onOpenDocument && (
                    <button
                      type="button"
                      onClick={() => onOpenDocument("doc-protocole-confinement-euclid")}
                      className="mt-1 flex items-center gap-1.5 border border-red-500/40 bg-red-500/10 px-2 py-1 text-[10px] text-red-300 hover:bg-red-500/20"
                    >
                      <FileText className="h-3 w-3" />
                      Voir l'historique des modifications
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
