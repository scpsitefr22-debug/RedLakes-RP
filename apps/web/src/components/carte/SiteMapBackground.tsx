/**
 * Fond cartographique stylisé de la carte interactive — remplace l'ancienne
 * grille CSS nue. Coordonnées calées sur le même repère que les pins
 * (x/y en pourcentage, viewBox 160x100 pour respecter l'aspect 16/10 du
 * conteneur) : complexe souterrain Site-12 au centre, égouts reliés par un
 * tunnel, zone urbaine à l'est, factions hostiles en périphérie, Red Lake
 * en bordure sud. Purement décoratif — les positions réelles des lieux
 * restent pilotées par l'API (/map), ceci ne fait qu'habiller le fond.
 */
export function SiteMapBackground() {
  return (
    <svg
      viewBox="0 0 160 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <pattern id="map-grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#8b0a0a" strokeOpacity="0.12" strokeWidth="0.15" />
        </pattern>
        <pattern id="map-city-grid" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#5c5c5c" strokeOpacity="0.35" strokeWidth="0.2" />
        </pattern>
        <pattern id="map-hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="3" stroke="#8b0a0a" strokeOpacity="0.25" strokeWidth="0.3" />
        </pattern>
        <radialGradient id="map-vignette" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      <rect width="160" height="100" fill="#050505" />
      <rect width="160" height="100" fill="url(#map-grid)" />

      {/* Red Lake — bande sud */}
      <path
        d="M 0 88 Q 30 80, 60 87 T 120 85 T 160 90 L 160 100 L 0 100 Z"
        fill="#8b0a0a"
        fillOpacity="0.08"
      />
      <path
        d="M 0 88 Q 30 80, 60 87 T 120 85 T 160 90"
        fill="none"
        stroke="#c41e1e"
        strokeOpacity="0.25"
        strokeWidth="0.4"
      />
      <text x="4" y="95" fontSize="2.8" fill="#c41e1e" fillOpacity="0.4" fontFamily="monospace" letterSpacing="0.15em">
        RED LAKE
      </text>

      {/* Zones hostiles — hachures */}
      <circle cx="128" cy="25" r="13" fill="url(#map-hatch)" />
      <circle cx="128" cy="25" r="13" fill="none" stroke="#8b0a0a" strokeOpacity="0.3" strokeWidth="0.3" strokeDasharray="1.2 0.8" />
      <circle cx="32" cy="35" r="12" fill="url(#map-hatch)" />
      <circle cx="32" cy="35" r="12" fill="none" stroke="#8b0a0a" strokeOpacity="0.3" strokeWidth="0.3" strokeDasharray="1.2 0.8" />

      {/* Complexe souterrain Site-12 — périmètre en pointillés */}
      <path
        d="M 58 22 L 92 22 L 96 38 L 88 58 L 62 58 L 52 46 L 54 30 Z"
        fill="#8b0a0a"
        fillOpacity="0.05"
        stroke="#c41e1e"
        strokeOpacity="0.4"
        strokeWidth="0.35"
        strokeDasharray="1.5 1"
      />
      <text x="56" y="20" fontSize="2.4" fill="#c41e1e" fillOpacity="0.5" fontFamily="monospace" letterSpacing="0.1em">
        COMPLEXE SOUTERRAIN — SITE-12
      </text>

      {/* Tunnel Site-12 → Égouts */}
      <path
        d="M 78 47 Q 68 53, 56 60"
        fill="none"
        stroke="#5c5c5c"
        strokeOpacity="0.5"
        strokeWidth="0.3"
        strokeDasharray="0.6 0.9"
      />

      {/* Zone urbaine — grille de rues */}
      <rect x="95" y="32" width="38" height="34" fill="url(#map-city-grid)" fillOpacity="0.5" />
      <rect
        x="95"
        y="32"
        width="38"
        height="34"
        fill="none"
        stroke="#5c5c5c"
        strokeOpacity="0.4"
        strokeWidth="0.3"
      />
      <text x="97" y="30.5" fontSize="2.4" fill="#9ca3af" fillOpacity="0.5" fontFamily="monospace" letterSpacing="0.1em">
        REDLAKES — SURFACE
      </text>

      {/* Anneaux radar pulsés depuis le cœur du Site-12 */}
      <circle cx="80" cy="45" r="6" fill="none" stroke="#c41e1e" strokeOpacity="0.35" strokeWidth="0.25" className="map-radar-ring" />
      <circle cx="80" cy="45" r="6" fill="none" stroke="#c41e1e" strokeOpacity="0.35" strokeWidth="0.25" className="map-radar-ring" style={{ animationDelay: "1.3s" }} />
      <circle cx="80" cy="45" r="6" fill="none" stroke="#c41e1e" strokeOpacity="0.35" strokeWidth="0.25" className="map-radar-ring" style={{ animationDelay: "2.6s" }} />

      {/* Rose des vents */}
      <g transform="translate(150, 10)" opacity="0.45">
        <circle r="6" fill="none" stroke="#5c5c5c" strokeWidth="0.25" />
        <path d="M 0 -6 L 1.2 0 L 0 6 L -1.2 0 Z" fill="#c41e1e" fillOpacity="0.6" />
        <text y="-8" fontSize="2.4" fill="#c41e1e" textAnchor="middle" fontFamily="monospace">N</text>
      </g>

      {/* Repères de coordonnées */}
      {[0, 20, 40, 60, 80, 100].map((v) => (
        <text key={`x-${v}`} x={(v / 100) * 160} y="99.2" fontSize="1.8" fill="#5c5c5c" fontFamily="monospace">
          {v}
        </text>
      ))}
      {[0, 20, 40, 60, 80].map((v) => (
        <text key={`y-${v}`} x="0.5" y={v + 2} fontSize="1.8" fill="#5c5c5c" fontFamily="monospace">
          {v}
        </text>
      ))}

      <rect width="160" height="100" fill="url(#map-vignette)" />
    </svg>
  );
}
