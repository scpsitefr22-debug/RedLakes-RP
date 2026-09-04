import { FileWarning } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

interface CorruptedEntry {
  id: string;
  name: string;
  size: string;
  timestamp: string;
}

const ENTRIES: CorruptedEntry[] = [
  { id: "f1", name: "cam_couloir_b_2█:██.log", size: "██ Ko", timestamp: "??:??:??" },
  { id: "f2", name: "cassie_journal_backup.tmp", size: "4,2 Go", timestamp: "2019-██-██" },
  { id: "f3", name: "proc_████_watchdog.exe", size: "12 Ko", timestamp: "antérieur au Site" },
  { id: "f4", name: "site_status_mirror.cache", size: "0 octet", timestamp: "corrompu" },
];

export function CorruptedServerApp() {
  const { gns } = useGNSRequired();
  const confirmed = Boolean(gns.flags.ch8_project_confirmed);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-dashboard-border px-4 py-2 text-[10px] uppercase tracking-wider text-metal">
        Serveur — journal brut (non filtré)
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {ENTRIES.map((entry) => {
          const isProject = entry.id === "f3";
          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between border p-2.5 font-mono text-[10px] ${
                isProject && confirmed
                  ? "border-red-500/50 bg-red-950/10 text-red-200"
                  : "border-dashboard-border bg-[#0a1018] text-metal"
              }`}
            >
              <span className="flex items-center gap-2">
                <FileWarning className="h-3.5 w-3.5 shrink-0 opacity-70" />
                {entry.name}
              </span>
              <span className="shrink-0 text-metal/70">
                {entry.size} · {entry.timestamp}
              </span>
            </div>
          );
        })}
      </div>
      {confirmed && (
        <div className="border-t border-red-500/30 bg-red-950/10 px-4 py-2 text-[10px] text-red-200">
          proc_████_watchdog.exe — identifié comme lié au Projet ████. Voir Console admin.
        </div>
      )}
    </div>
  );
}
