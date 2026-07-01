import React from "react";
import { LANDMASSES, polygonPath } from "@/lib/mapGeography";

// =============================================================================
// MapCanvas — zeichnet die Karte im Stil einer echten (gealterten) Seekarte:
//   • Meer mit „richtigem" Hintergrund: Tiefen-Verlauf + Wasser-/Papierstruktur.
//   • Land als warmes Pergament mit weichen, ORGANISCHEN Küsten (Displacement),
//     Relief-Struktur und Flachwasser-/Tiefenlinien statt kantiger blauer Flächen.
//
// WICHTIG: Nur die Darstellung ändert sich. Geometrie (LANDMASSES), Koordinaten
// (viewBox 0..100), Zoom und die per Prozent positionierten Häfen/Schiffe/Routen
// bleiben unverändert — Funktion und Navigation der Karte sind nicht betroffen.
// =============================================================================

const GRATICULE = [10, 20, 30, 40, 50, 60, 70, 80, 90];

export default function MapCanvas({ mode = "welt", factionByCode }) {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <radialGradient id="seaGrad" cx="50%" cy="42%" r="80%">
          <stop offset="0%" stopColor="var(--sea-shallow)" />
          <stop offset="55%" stopColor="var(--sea)" />
          <stop offset="100%" stopColor="var(--sea-deep)" />
        </radialGradient>
        <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--land-hi)" />
          <stop offset="100%" stopColor="var(--land)" />
        </linearGradient>

        {/* Breite Wasser-Tonvariation (Tiefen/Strömungen) */}
        <filter id="seaMottle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.028 0.045" numOctaves="3" seed="6" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
        {/* Feine Papier-/Wasserkörnung */}
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.5 0.5" numOctaves="2" seed="9" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
        {/* Heller Wasser-Schimmer */}
        <filter id="seaSheen" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="2" seed="15" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.7 0" />
        </filter>

        {/* Organische Küsten: sanftes Verzerren der Polygonkanten */}
        <filter id="coastWarp" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="2" seed="4" result="w" />
          <feDisplacementMap in="SourceGraphic" in2="w" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Land-Relief: dezente Schattierung auf der Landfläche */}
        <filter id="landRelief" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.12 0.12" numOctaves="3" seed="11" result="n" />
          <feColorMatrix in="n" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.22 0" result="m" />
          <feComposite in="m" in2="SourceGraphic" operator="in" result="mc" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="mc" />
          </feMerge>
        </filter>
      </defs>

      {/* Meer: Tiefen-Verlauf + Struktur (richtiger Hintergrund) */}
      <rect x="0" y="0" width="100" height="100" fill="url(#seaGrad)" />
      <rect x="0" y="0" width="100" height="100" fill="#000" filter="url(#seaMottle)" opacity="0.16" />
      <rect x="0" y="0" width="100" height="100" fill="#fff" filter="url(#seaSheen)" opacity="0.05" />
      <rect x="0" y="0" width="100" height="100" fill="#000" filter="url(#grain)" opacity="0.05" />

      {/* Gitternetz (Längen-/Breitengrade) */}
      <g stroke="var(--graticule)" strokeWidth="0.5" vectorEffect="non-scaling-stroke">
        {GRATICULE.map((v) => <line key={`v${v}`} x1={v} y1="0" x2={v} y2="100" />)}
        {GRATICULE.map((v) => <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v} />)}
      </g>

      {/* Land (organisch verzerrt) */}
      <g filter="url(#coastWarp)">
        {/* Flachwasser-/Tiefenlinien um die Küsten */}
        <g fill="none" stroke="var(--shoal)" strokeLinejoin="round">
          {LANDMASSES.map((m) => <path key={`s1-${m.id}`} d={polygonPath(m.points)} strokeWidth="3.4" opacity="0.5" />)}
          {LANDMASSES.map((m) => <path key={`s2-${m.id}`} d={polygonPath(m.points)} strokeWidth="1.8" opacity="0.7" />)}
        </g>

        {/* Landflächen mit Relief + Küstenlinie */}
        <g strokeLinejoin="round" filter="url(#landRelief)">
          {LANDMASSES.map((m) => {
            const politic = mode === "politisch" && m.faction;
            const facColor = politic ? factionByCode?.[m.faction]?.color : null;
            return (
              <path
                key={m.id}
                d={polygonPath(m.points)}
                fill={facColor || "url(#landGrad)"}
                fillOpacity={politic ? 0.75 : 1}
                stroke={facColor || "var(--coast)"}
                strokeWidth={politic ? 1.3 : 0.9}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
}
