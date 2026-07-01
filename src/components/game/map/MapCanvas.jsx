import React, { useMemo } from "react";
import { LANDMASSES, polygonPath } from "@/lib/mapGeography";

// =============================================================================
// MapCanvas — zeichnet Meer, Landmassen, Flachwasser-Säume und das Seekarten-
// Gitternetz als ein einziges SVG (viewBox 0..100). preserveAspectRatio="none"
// füllt den Container; die per Prozent positionierten Hafen-Pins/Schiffe liegen
// exakt darüber. Strichbreiten bleiben dank non-scaling-stroke konstant.
// =============================================================================

const GRATICULE = [10, 20, 30, 40, 50, 60, 70, 80, 90];

export default function MapCanvas({ mode = "welt", factionByCode }) {
  const graticule = useMemo(
    () => GRATICULE.map((v) => ({ v })),
    []
  );

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id="seaGrad" cx="50%" cy="42%" r="75%">
          <stop offset="0%" stopColor="var(--sea-shallow)" />
          <stop offset="60%" stopColor="var(--sea)" />
          <stop offset="100%" stopColor="var(--sea-deep)" />
        </radialGradient>
        <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--land-hi)" />
          <stop offset="100%" stopColor="var(--land)" />
        </linearGradient>
      </defs>

      {/* Meer */}
      <rect x="0" y="0" width="100" height="100" fill="url(#seaGrad)" />

      {/* Gitternetz (Längen-/Breitengrade der Seekarte) */}
      <g stroke="var(--graticule)" strokeWidth="0.5" vectorEffect="non-scaling-stroke">
        {graticule.map(({ v }) => (
          <line key={`v${v}`} x1={v} y1="0" x2={v} y2="100" />
        ))}
        {graticule.map(({ v }) => (
          <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v} />
        ))}
      </g>

      {/* Flachwasser-Saum (breiter, weicher Umriss hinter dem Land) */}
      <g fill="none" stroke="var(--shoal)" strokeLinejoin="round" strokeWidth="2.4" vectorEffect="non-scaling-stroke">
        {LANDMASSES.map((m) => (
          <path key={`shoal-${m.id}`} d={polygonPath(m.points)} />
        ))}
      </g>

      {/* Landmassen */}
      <g strokeLinejoin="round" vectorEffect="non-scaling-stroke">
        {LANDMASSES.map((m) => {
          const politic = mode === "politisch" && m.faction;
          const facColor = politic ? factionByCode?.[m.faction]?.color : null;
          return (
            <path
              key={m.id}
              d={polygonPath(m.points)}
              fill={facColor || "url(#landGrad)"}
              fillOpacity={politic ? 0.72 : 1}
              stroke={facColor || "var(--coast)"}
              strokeWidth={politic ? 1.4 : 1}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </g>
    </svg>
  );
}
