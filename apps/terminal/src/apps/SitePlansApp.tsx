import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

interface SiteRoom {
  id: string;
  label: string;
  kind: "safe" | "restricted" | "confinement";
}

interface SiteFloor {
  id: string;
  label: string;
  rooms: SiteRoom[];
}

const SITE_FLOORS: SiteFloor[] = [
  {
    id: "basement",
    label: "Sous-sol",
    rooms: [
      { id: "archives", label: "Archives", kind: "restricted" },
      { id: "classd", label: "Chambres Class-D", kind: "restricted" },
      { id: "maintenance", label: "Salle machines", kind: "safe" },
      { id: "storage", label: "Stockage général", kind: "safe" },
    ],
  },
  {
    id: "ground",
    label: "RDC",
    rooms: [
      { id: "checkpoint", label: "Checkpoint périmètre", kind: "safe" },
      { id: "admin", label: "Aile administrative", kind: "safe" },
      { id: "bureau-directeur", label: "Bureau du Directeur", kind: "restricted" },
      { id: "cafeteria", label: "Cafétéria B", kind: "safe" },
      { id: "infirmerie", label: "Infirmerie", kind: "safe" },
    ],
  },
  {
    id: "floor1",
    label: "Étage 1",
    rooms: [
      { id: "lab-a", label: "Laboratoire A", kind: "restricted" },
      { id: "lab-b", label: "Laboratoire B — Euclid-7", kind: "restricted" },
      { id: "salle-conf-b", label: "Salle de conférence B", kind: "safe" },
      { id: "bureaux-rh", label: "Bureaux RH", kind: "safe" },
    ],
  },
  {
    id: "floor2",
    label: "Étage 2",
    rooms: [
      { id: "secteur7-a", label: "Secteur 7 — Corridor A", kind: "confinement" },
      { id: "secteur7-b", label: "Secteur 7 — Corridor B", kind: "confinement" },
      { id: "secteur7-conf", label: "Secteur 7 — Confinement", kind: "confinement" },
      { id: "salle-controle", label: "Salle de contrôle", kind: "restricted" },
    ],
  },
];

const KIND_STYLES: Record<SiteRoom["kind"], string> = {
  safe: "border-dashboard-border bg-dashboard-accent/10 text-dashboard-accent",
  restricted: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  confinement: "border-red-500/40 bg-red-500/10 text-red-300",
};

export function SitePlansApp() {
  const { gns } = useGNSRequired();
  const [floorId, setFloorId] = useState(SITE_FLOORS[1].id);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const siteAlerted = gns.world.siteStatus === "breach" || gns.world.siteStatus === "lockdown";
  const floor = useMemo(
    () => SITE_FLOORS.find((f) => f.id === floorId) ?? SITE_FLOORS[0],
    [floorId]
  );
  const room = floor.rooms.find((r) => r.id === selectedRoom) ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashboard-border px-4 py-2">
        <span className="text-[10px] uppercase tracking-wider text-metal">Plans du site — Site-12</span>
        <div className="flex gap-1">
          {SITE_FLOORS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFloorId(f.id);
                setSelectedRoom(null);
              }}
              className={`px-2 py-1 text-[9px] uppercase tracking-wide transition-colors ${
                floorId === f.id
                  ? "bg-dashboard-accent/15 text-dashboard-accent"
                  : "text-metal hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 sm:flex-row">
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
          {floor.rooms.map((r) => {
            const alerted = r.kind === "confinement" && siteAlerted;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoom(r.id === selectedRoom ? null : r.id)}
                className={`relative flex min-h-[64px] flex-col items-start justify-end gap-1 border p-2 text-left transition-colors ${
                  selectedRoom === r.id ? "border-dashboard-accent" : KIND_STYLES[r.kind]
                } ${alerted ? "animate-pulse" : ""}`}
              >
                <MapPin className="h-3 w-3 opacity-70" />
                <span className="text-[9px] leading-tight">{r.label}</span>
              </button>
            );
          })}
        </div>

        <div className="w-full shrink-0 border border-dashboard-border bg-[#0a1018] p-3 text-[10px] sm:w-56">
          {room ? (
            <>
              <p className="uppercase tracking-wider text-metal">Zone sélectionnée</p>
              <p className="mt-1 text-xs text-foreground">{room.label}</p>
              <p
                className={`mt-2 inline-block px-1.5 py-0.5 text-[9px] uppercase ${KIND_STYLES[room.kind]}`}
              >
                {room.kind === "safe"
                  ? "Zone commune"
                  : room.kind === "restricted"
                    ? "Accès restreint"
                    : "Zone de confinement"}
              </p>
              {room.kind === "confinement" && siteAlerted && (
                <p className="mt-3 text-[10px] text-red-300">
                  Alerte active — accès verrouillé jusqu'à nouvel ordre.
                </p>
              )}
            </>
          ) : (
            <p className="text-metal">Sélectionnez une pièce sur le plan pour voir le détail.</p>
          )}

          <div className="mt-4 space-y-1.5 border-t border-dashboard-border/60 pt-3">
            <p className="uppercase tracking-wider text-metal">Légende</p>
            {(
              [
                ["safe", "Zone commune"],
                ["restricted", "Accès restreint"],
                ["confinement", "Confinement"],
              ] as const
            ).map(([kind, label]) => (
              <div key={kind} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 shrink-0 border ${KIND_STYLES[kind]}`} />
                <span className="text-foreground/80">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
