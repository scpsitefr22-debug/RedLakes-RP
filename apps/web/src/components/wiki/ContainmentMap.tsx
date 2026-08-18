import { SCPClass } from "@/data/scp";
import { cn } from "@/lib/utils";

const sectors: { id: SCPClass; label: string; x: number }[] = [
  { id: "Safe", label: "Confinement Standard A", x: 10 },
  { id: "Euclid", label: "Confinement Standard B", x: 145 },
  { id: "Keter", label: "Secteur Keter-02", x: 280 },
  { id: "Thaumiel", label: "Recherche Avancée", x: 415 },
  { id: "Apollyon", label: "Zone Verrouillée", x: 415 },
];

const highlightColor: Record<SCPClass, string> = {
  Safe: "#4ade80",
  Euclid: "#facc15",
  Keter: "#f87171",
  Thaumiel: "#c084fc",
  Apollyon: "#fb923c",
};

/**
 * Schema simplifie du Site-12 — la position derive de la classe de l'objet
 * (convention narrative), pas d'une donnee de localisation reelle en base.
 */
export function ContainmentMap({ scpClass }: { scpClass: SCPClass }) {
  const color = highlightColor[scpClass];

  return (
    <div className="panel-flat rounded-lg p-4">
      <p className="mb-3 font-mono text-[11px] font-bold tracking-widest text-gray-500">
        LOCALISATION — SITE-12
      </p>
      <svg viewBox="0 0 550 120" className="w-full">
        <rect x="0" y="0" width="550" height="120" fill="none" stroke="#3a3a3a" strokeWidth="1" />
        {sectors
          .filter((s) => s.id !== "Apollyon" || scpClass === "Apollyon")
          .filter((s) => s.id !== "Thaumiel" || scpClass === "Thaumiel")
          .map((sector) => {
            const active = sector.id === scpClass;
            return (
              <g key={sector.id}>
                <rect
                  x={sector.x}
                  y="25"
                  width="120"
                  height="70"
                  rx="4"
                  fill={active ? `${color}22` : "transparent"}
                  stroke={active ? color : "#3a3a3a"}
                  strokeWidth={active ? 2 : 1}
                >
                  {active && (
                    <animate
                      attributeName="stroke-opacity"
                      values="1;0.4;1"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  )}
                </rect>
                <text
                  x={sector.x + 60}
                  y="65"
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="monospace"
                  fill={active ? color : "#6b7280"}
                >
                  {sector.label}
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
}
