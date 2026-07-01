import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { SEA_LABELS, LANDMASSES } from "@/lib/mapGeography";
import MapCanvas from "./map/MapCanvas";
import MapRoutes from "./map/MapRoutes";
import PortMarker from "./map/PortMarker";
import ShipToken from "./map/ShipToken";
import MapLegend from "./MapLegend";
import mapOverlay from "@/assets/map-overlay.png";

const MAP_TABS = [
  { id: "welt", label: "Weltkarte" },
  { id: "politisch", label: "Politische Karte" },
  { id: "ressourcen", label: "Ressourcenkarte" },
];

// Landmassen mit Beschriftung (für die dezenten Insel-Namen).
const LAND_LABELS = LANDMASSES.filter((m) => m.label);

export default function CaribbeanMap({
  ports,
  factionByCode,
  selectedPortId,
  onSelectPort,
  sailing = [],
  plannedRoute = null,
  shipPortIds = [],
}) {
  const [tab, setTab] = useState("welt");
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((z) => Math.min(1.8, +(z + 0.2).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(0.8, +(z - 0.2).toFixed(2)));

  const shipHereSet = new Set(shipPortIds);

  return (
    <div className="panel rounded-sm h-full flex flex-col overflow-hidden">
      {/* Kartentabs */}
      <div className="panel-header game-tabs px-1">
        {MAP_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`game-tab ${tab === t.id ? "is-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Kartenfläche */}
      <div className="relative flex-1 overflow-hidden bg-[var(--sea-deep)]">
        <div
          className="absolute inset-0 origin-center transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Meer + Land + Gitternetz */}
          <MapCanvas mode={tab} factionByCode={factionByCode} />

          {/* Dekoratives Seekarten-Overlay (antiker Chart-Stil). Der schwarze
              Bildhintergrund wird per „screen"-Blendmodus transparent, sodass nur
              die Messing-Gravuren über der Karte liegen. pointer-events: none hält
              Häfen, Schiffe und Routen voll funktional. */}
          <img
            src={mapOverlay}
            alt=""
            aria-hidden="true"
            draggable="false"
            className="absolute inset-0 w-full h-full pointer-events-none select-none"
            style={{ mixBlendMode: "screen", opacity: 0.9 }}
          />

          {/* Seewege (geplant + laufend) */}
          <MapRoutes sailing={sailing} planned={plannedRoute} />

          {/* Insel-/Meeresbeschriftungen */}
          {LAND_LABELS.map((m) => (
            <span
              key={`ll-${m.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 font-display tracking-[0.25em] text-[var(--ink-dim)] opacity-70 select-none pointer-events-none z-10"
              style={{ left: `${m.labelAt[0]}%`, top: `${m.labelAt[1]}%`, fontSize: 10 }}
            >
              {m.label}
            </span>
          ))}
          {SEA_LABELS.map((s, i) => (
            <span
              key={`sl-${i}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 font-serif-game italic tracking-[0.35em] text-[var(--ink-dim)] opacity-60 select-none pointer-events-none z-10"
              style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size }}
            >
              {s.text}
            </span>
          ))}

          {/* Häfen */}
          {(ports || []).map((port) => {
            const f = factionByCode?.[port.controllingFactionCode];
            const color = f?.color || "#8a8a8a";
            return (
              <PortMarker
                key={port.id}
                port={port}
                color={color}
                selected={selectedPortId === port.id}
                onSelect={onSelectPort}
                mode={tab}
                shipHere={shipHereSet.has(port.id)}
              />
            );
          })}

          {/* Fahrende Schiffe */}
          {sailing.map((v) => (
            <ShipToken key={v.id} ship={v} />
          ))}
        </div>

        {/* Zoom-Steuerung */}
        <div className="absolute bottom-14 right-3 flex flex-col rounded-sm overflow-hidden border border-line z-30">
          <button
            onClick={zoomIn}
            className="w-8 h-8 flex items-center justify-center bg-[var(--wood-light)] text-brass hover:text-brass-bright hover:bg-[var(--wood)] transition-colors"
            title="Vergrößern"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-line" />
          <button
            onClick={zoomOut}
            className="w-8 h-8 flex items-center justify-center bg-[var(--wood-light)] text-brass hover:text-brass-bright hover:bg-[var(--wood)] transition-colors"
            title="Verkleinern"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Legende */}
        <MapLegend />
      </div>
    </div>
  );
}
