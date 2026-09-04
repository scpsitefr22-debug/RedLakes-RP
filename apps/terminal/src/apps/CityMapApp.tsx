import { useState } from "react";
import { MapPin, Eye } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

interface District {
  id: string;
  label: string;
  note: string;
  watched?: boolean;
}

const DISTRICTS: District[] = [
  { id: "centre", label: "Centre-ville", note: "Zone neutre. Peu d'activité anormale rapportée." },
  {
    id: "industriel-sud",
    label: "Quartier industriel — Sud",
    note: "Deux entrepôts liés à la famille Moretti. Surveillance discrète recommandée.",
    watched: true,
  },
  { id: "vieux-port", label: "Vieux port", note: "Trafic nocturne inhabituel signalé par la police locale." },
  { id: "residentiel-est", label: "Résidentiel — Est", note: "Aucune activité liée à la Fondation." },
  { id: "zone-egouts", label: "Accès égouts municipaux", note: "Réseau souterrain non cartographié entièrement." },
];

export function CityMapApp() {
  const { gns } = useGNSRequired();
  const [selected, setSelected] = useState<string | null>("industriel-sud");
  const moretiWatching = Boolean(gns.flags.ch3_moretti_watching);
  const district = DISTRICTS.find((d) => d.id === selected) ?? null;

  return (
    <div className="flex h-full">
      <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto p-3">
        {DISTRICTS.map((d) => {
          const alerted = Boolean(d.watched && moretiWatching);
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelected(d.id)}
              className={`relative flex min-h-[70px] flex-col items-start justify-end gap-1 border p-2 text-left transition-colors ${
                selected === d.id
                  ? "border-dashboard-accent"
                  : alerted
                    ? "border-amber-500/50 bg-amber-500/5"
                    : "border-dashboard-border bg-[#0a1018]"
              }`}
            >
              {alerted && (
                <Eye className="absolute right-2 top-2 h-3.5 w-3.5 animate-pulse text-amber-400" />
              )}
              <MapPin className="h-3 w-3 opacity-70" />
              <span className="text-[10px] leading-tight text-foreground/90">{d.label}</span>
            </button>
          );
        })}
      </div>

      <div className="w-64 shrink-0 border-l border-dashboard-border bg-[#0a1018] p-3 text-[10px]">
        <p className="uppercase tracking-wider text-metal">REDLAKES — plan municipal</p>
        {district ? (
          <>
            <p className="mt-3 text-xs text-foreground">{district.label}</p>
            <p className="mt-2 leading-relaxed text-metal">{district.note}</p>
            {district.watched && moretiWatching && (
              <p className="mt-3 text-amber-400">
                Vous avez accepté un accord avec Moretti — ce secteur est désormais sous observation
                réciproque.
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 text-metal">Sélectionnez un quartier.</p>
        )}
      </div>
    </div>
  );
}
