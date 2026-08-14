"use client";

import { useState } from "react";
import { mapLocations, locationTypeLabels } from "@/data/map";
import { Badge } from "@/components/ui/Badge";
import { MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  site: "bg-redlake/20 border-redlake/40",
  surface: "bg-blue-400/10 border-blue-400/30",
  ville: "bg-green-400/10 border-green-400/30",
  egouts: "bg-purple-400/10 border-purple-400/30",
  criminel: "bg-orange-400/10 border-orange-400/30",
  labo: "bg-yellow-400/10 border-yellow-400/30",
  scp: "bg-red-400/10 border-red-400/30",
  portail: "bg-pink-400/10 border-pink-400/30",
  ennemi: "bg-gray-400/10 border-gray-400/30",
};

export default function CartePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const location = mapLocations.find((l) => l.id === selected);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          CARTOGRAPHIE SITE-12
        </p>
        <h1 className="text-4xl font-bold text-white">Carte Interactive</h1>
        <p className="mt-4 text-gray-500">
          Cliquez sur un lieu pour afficher son histoire et sa description.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="relative lg:col-span-2">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-redlake/30 bg-black">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(139,10,10,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(139,10,10,0.1) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />
            {mapLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelected(loc.id)}
                className={cn(
                  "absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-all hover:scale-125",
                  typeColors[loc.type],
                  selected === loc.id && "scale-125 ring-2 ring-redlake-glow"
                )}
                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                title={loc.name}
              >
                <MapPin className="h-4 w-4" />
              </button>
            ))}
            <div className="absolute bottom-4 left-4 rounded border border-metal/50 bg-black/80 px-3 py-2 font-mono text-xs text-gray-500">
              REDLAKES — SECTEUR ████
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(locationTypeLabels).map(([type, label]) => (
              <Badge key={type} className={cn("border", typeColors[type])}>
                {label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="hologram-border rounded-lg p-6">
          {location ? (
            <>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <Badge className={cn("mb-2 border", typeColors[location.type])}>
                    {locationTypeLabels[location.type]}
                  </Badge>
                  <h2 className="text-xl font-bold text-white">{location.name}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-4 text-sm text-gray-400">{location.description}</p>
              <div className="mb-4">
                <p className="mb-1 font-mono text-xs text-redlake-glow">HISTORIQUE</p>
                <p className="text-sm text-gray-500">{location.history}</p>
              </div>
              <div className="flex gap-4 font-mono text-xs">
                <span className="text-gray-600">
                  Danger : <span className="text-white">{location.danger}/5</span>
                </span>
                {location.faction && (
                  <span className="text-gray-600">
                    Faction : <span className="text-white">{location.faction}</span>
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center text-center">
              <div>
                <MapPin className="mx-auto mb-4 h-8 w-8 text-gray-700" />
                <p className="text-gray-600">Sélectionnez un point sur la carte</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
