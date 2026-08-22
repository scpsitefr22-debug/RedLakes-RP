"use client";

import { useEffect, useState } from "react";
import { locationTypeLabels } from "@/data/map";
import { Badge } from "@/components/ui/Badge";
import { MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";
import { SiteMapBackground } from "@/components/carte/SiteMapBackground";

interface ApiMapLocation {
  id: string;
  slug: string;
  name: string;
  type: string;
  x: number;
  y: number;
  description: string;
  history: string;
  danger: number;
  faction: string | null;
}

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

export function CarteApp() {
  const [locations, setLocations] = useState<ApiMapLocation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ApiMapLocation[]>("/map")
      .then(setLocations)
      .catch(() => undefined);
  }, []);

  const location = locations.find((l) => l.id === selected);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-redlake/30 bg-black">
        <SiteMapBackground />
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setSelected(loc.id)}
            className={cn(
              "absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-all hover:scale-125",
              typeColors[loc.type],
              selected === loc.id && "scale-125 ring-2 ring-redlake-glow",
            )}
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            title={loc.name}
          >
            <MapPin className="h-3 w-3" />
          </button>
        ))}
      </div>

      {location ? (
        <div className="rounded-lg border border-metal/40 bg-black/30 p-4">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <Badge className={cn("mb-2 border", typeColors[location.type])}>
                {locationTypeLabels[location.type as keyof typeof locationTypeLabels] ?? location.type}
              </Badge>
              <h3 className="text-lg font-bold text-white">{location.name}</h3>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <DiscordMarkdown text={location.description} className="mb-3 text-sm text-gray-400" />
          <div className="mb-3">
            <p className="mb-1 font-mono text-xs text-redlake-glow">HISTORIQUE</p>
            <DiscordMarkdown text={location.history} className="text-sm text-gray-500" />
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
        </div>
      ) : (
        <p className="text-center text-sm text-gray-600">Sélectionnez un point sur la carte.</p>
      )}
    </div>
  );
}
