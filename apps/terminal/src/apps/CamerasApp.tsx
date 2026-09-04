import { useMemo, useState } from "react";
import { Video, VideoOff } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

interface CameraFeed {
  id: string;
  zone: string;
  floor: "Sous-sol" | "RDC" | "Étage 1" | "Étage 2";
  alertZone?: boolean;
}

const CAMERA_FEEDS: CameraFeed[] = [
  { id: "cam-7a", zone: "Secteur 7 — Corridor A", floor: "Étage 2", alertZone: true },
  { id: "cam-7b", zone: "Secteur 7 — Corridor B", floor: "Étage 2", alertZone: true },
  { id: "cam-7c", zone: "Secteur 7 — Confinement", floor: "Étage 2", alertZone: true },
  { id: "cam-euclid-a", zone: "Laboratoire A — Euclid", floor: "Étage 1" },
  { id: "cam-euclid-b", zone: "Laboratoire B — Euclid-7", floor: "Étage 1" },
  { id: "cam-admin", zone: "Aile administrative", floor: "RDC" },
  { id: "cam-bureau-directeur", zone: "Couloir — Bureau du Directeur", floor: "RDC" },
  { id: "cam-cafeteria", zone: "Cafétéria B", floor: "RDC" },
  { id: "cam-archives", zone: "Archives — Clearance 2", floor: "Sous-sol" },
  { id: "cam-classd", zone: "Chambres Class-D", floor: "Sous-sol" },
  { id: "cam-checkpoint", zone: "Checkpoint périmètre", floor: "RDC" },
  { id: "cam-maintenance", zone: "Salle machines / ventilation", floor: "Sous-sol" },
];

function CameraTile({
  feed,
  siteAlerted,
  active,
  onSelect,
}: {
  feed: CameraFeed;
  siteAlerted: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const offline = feed.alertZone && siteAlerted && feed.id === "cam-7c";
  const flagged = Boolean(feed.alertZone) && siteAlerted;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex aspect-video flex-col justify-end overflow-hidden border p-1.5 text-left transition-colors ${
        active
          ? "border-dashboard-accent"
          : flagged
            ? "border-red-500/60"
            : "border-dashboard-border hover:border-dashboard-accent/40"
      } bg-[#05080c]`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.025)_2px,rgba(255,255,255,0.025)_4px)]" />
      {flagged && (
        <div className="pointer-events-none absolute inset-0 animate-pulse bg-red-600/10" />
      )}
      <div className="relative flex items-center justify-between">
        <span className="truncate text-[8px] text-metal">{feed.id.toUpperCase()}</span>
        {offline ? (
          <span className="flex items-center gap-1 text-[7px] font-medium text-metal">
            <VideoOff className="h-2.5 w-2.5" />
            HORS LIGNE
          </span>
        ) : (
          <span
            className={`flex items-center gap-1 text-[7px] font-medium ${flagged ? "text-red-300" : "text-terminal"}`}
          >
            <Video className="h-2.5 w-2.5" />
            EN DIRECT
          </span>
        )}
      </div>
      <p className="relative mt-0.5 truncate text-[9px] text-foreground/85">{feed.zone}</p>
    </button>
  );
}

export function CamerasApp() {
  const { gns } = useGNSRequired();
  const [floor, setFloor] = useState<CameraFeed["floor"] | "Toutes">("Toutes");
  const [selected, setSelected] = useState<string | null>(null);

  const siteAlerted = gns.world.siteStatus === "breach" || gns.world.siteStatus === "lockdown";

  const floors: Array<CameraFeed["floor"] | "Toutes"> = [
    "Toutes",
    "Sous-sol",
    "RDC",
    "Étage 1",
    "Étage 2",
  ];

  const feeds = useMemo(
    () => (floor === "Toutes" ? CAMERA_FEEDS : CAMERA_FEEDS.filter((f) => f.floor === floor)),
    [floor]
  );

  const selectedFeed = CAMERA_FEEDS.find((f) => f.id === selected) ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashboard-border px-4 py-2">
        <span className="text-[10px] uppercase tracking-wider text-metal">
          Vidéosurveillance — {feeds.length} caméra{feeds.length > 1 ? "s" : ""}
        </span>
        <div className="flex gap-1">
          {floors.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFloor(f)}
              className={`px-2 py-1 text-[9px] uppercase tracking-wide transition-colors ${
                floor === f
                  ? "bg-dashboard-accent/15 text-dashboard-accent"
                  : "text-metal hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {selectedFeed && (
        <div className="border-b border-dashboard-border p-3">
          <div className="relative flex aspect-[16/6] items-end overflow-hidden border border-dashboard-accent/50 bg-[#05080c] p-2">
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />
            {siteAlerted && selectedFeed.alertZone && (
              <div className="pointer-events-none absolute inset-0 animate-pulse bg-red-600/10" />
            )}
            <div className="relative flex w-full items-center justify-between text-[10px] text-metal">
              <span>{selectedFeed.zone}</span>
              <span className="font-mono">{selectedFeed.id.toUpperCase()} — {selectedFeed.floor}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {feeds.map((feed) => (
            <CameraTile
              key={feed.id}
              feed={feed}
              siteAlerted={siteAlerted}
              active={selected === feed.id}
              onSelect={() => setSelected(feed.id === selected ? null : feed.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
