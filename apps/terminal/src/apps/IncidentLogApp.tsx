import { getUnlockedIncidents } from "@redlakes/narrative-core";
import { useGNSRequired } from "../context/GNSContext";

export function IncidentLogApp() {
  const { gns } = useGNSRequired();
  const incidents = getUnlockedIncidents(gns);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-panel-border px-4 py-2 text-[10px] uppercase tracking-wider text-metal">
        Journal des incidents — Site-12 ({incidents.length})
      </div>
      <div className="flex-1 overflow-y-auto">
        {incidents.length === 0 ? (
          <p className="p-4 text-xs text-metal">Aucun incident accessible à votre clearance.</p>
        ) : (
          incidents.map((inc) => (
            <div key={inc.id} className="border-b border-panel-border/50 px-4 py-3">
              <div className="flex justify-between text-[10px]">
                <span className="text-metal">{inc.date}</span>
                <span className="text-terminal">{inc.status}</span>
              </div>
              <div className="mt-1 text-xs text-foreground">{inc.title}</div>
              <p className="mt-1 text-[10px] text-metal">{inc.detail}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
