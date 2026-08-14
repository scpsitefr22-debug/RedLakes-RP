import type { GlobalNarrativeSave } from "@redlakes/narrative-core";
import { getUnlockedIncidents } from "@redlakes/narrative-core";
import { FileImage, FileText, Film } from "lucide-react";
import { DashboardWidget } from "./DashboardWidget";

interface DashboardBottomWidgetsProps {
  gns: GlobalNarrativeSave;
}

const FILE_ICONS: Record<string, typeof FileText> = {
  pdf: FileText,
  video: Film,
  image: FileImage,
};

function guessFileType(id: string): keyof typeof FILE_ICONS {
  if (id.includes("video") || id.includes("briefing")) return "video";
  if (id.includes("img") || id.includes("photo")) return "image";
  return "pdf";
}

export function DashboardBottomWidgets({ gns }: DashboardBottomWidgetsProps) {
  const incidents = getUnlockedIncidents(gns).slice(0, 4);
  const recentDocs = gns.world.documentsRead.slice(-4).reverse();
  const siteAlerted =
    gns.world.siteStatus === "breach" || gns.world.siteStatus === "lockdown";

  return (
    <div className="grid min-h-0 grid-cols-1 gap-2 lg:grid-cols-3">
      <DashboardWidget title="Journal des incidents" bodyClassName="overflow-y-auto p-2">
        {incidents.length === 0 ? (
          <p className="text-[10px] text-metal/60">Aucun incident enregistré.</p>
        ) : (
          <ul className="space-y-1.5 font-mono text-[9px]">
            {incidents.map((inc) => (
              <li key={inc.id} className="text-foreground/85">
                <span className="text-metal">[{inc.status?.toUpperCase() ?? "LOG"}]</span>{" "}
                {inc.title}
              </li>
            ))}
          </ul>
        )}
      </DashboardWidget>

      <DashboardWidget title="Fichiers récents" bodyClassName="overflow-y-auto p-2">
        {recentDocs.length === 0 ? (
          <p className="text-[10px] text-metal/60">Aucun fichier consulté.</p>
        ) : (
          <ul className="space-y-1.5">
            {recentDocs.map((id) => {
              const kind = guessFileType(id);
              const Icon = FILE_ICONS[kind];
              return (
                <li key={id} className="flex items-center gap-2 text-[10px]">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-dashboard-accent" />
                  <span className="truncate text-foreground/85">{id}</span>
                </li>
              );
            })}
          </ul>
        )}
      </DashboardWidget>

      <DashboardWidget title="Plan du site & caméras" bodyClassName="p-2">
        <div className="grid h-full grid-cols-2 gap-2">
          <div className="relative min-h-[72px] border border-dashboard-border bg-[#081018] p-1.5">
            <p className="text-[8px] uppercase text-metal">Étage 2</p>
            <div className="mt-1 grid grid-cols-3 gap-0.5">
              {["A", "B", "C", "D", "7", "E"].map((zone) => (
                <div
                  key={zone}
                  className={`flex h-5 items-center justify-center text-[7px] ${
                    zone === "7" && siteAlerted
                      ? "animate-pulse bg-red-600/40 text-red-200"
                      : "bg-dashboard-accent/10 text-dashboard-accent/80"
                  }`}
                >
                  {zone === "7" && siteAlerted ? "CONF." : zone}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-rows-3 gap-1">
            {["7A", "7B", "7C"].map((cam) => (
              <div
                key={cam}
                className="relative flex items-end justify-between border border-dashboard-border bg-[#05080c] px-1 py-0.5"
              >
                <span className="text-[7px] text-metal">{cam}</span>
                <span className="text-[7px] text-terminal">EN DIRECT</span>
                <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)]" />
              </div>
            ))}
          </div>
        </div>
      </DashboardWidget>
    </div>
  );
}
