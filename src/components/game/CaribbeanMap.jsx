import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { factionFlag } from "@/lib/gameData";
import MapLegend from "./MapLegend";

const MAP_BG = "https://media.base44.com/images/public/6a43defde92c0d47de02330a/c5394dcd2_generated_image.png";

const MAP_TABS = [
  { id: "welt", label: "Weltkarte" },
  { id: "politisch", label: "Politische Karte" },
  { id: "ressourcen", label: "Ressourcenkarte" },
];

export default function CaribbeanMap({ ports, factionByCode, selectedPortId, onSelectPort }) {
  const [tab, setTab] = useState("welt");
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((z) => Math.min(1.8, +(z + 0.2).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(0.8, +(z - 0.2).toFixed(2)));

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
      <div className="relative flex-1 overflow-hidden bg-[var(--sea)]">
        <div
          className="absolute inset-0 origin-center transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.6]"
            style={{ backgroundImage: `url(${MAP_BG})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,39,50,0.25)] to-[rgba(11,17,22,0.6)]" />

          {/* Dekorative Meeresbeschriftung */}
          <span className="absolute left-[62%] top-[14%] font-serif-game italic text-[var(--ink-dim)] text-lg tracking-[0.35em] opacity-70 select-none pointer-events-none">
            KARIBISCHES MEER
          </span>
          <span className="absolute left-[18%] top-[74%] font-serif-game italic text-[var(--ink-dim)] text-base tracking-[0.35em] opacity-60 select-none pointer-events-none">
            KARIBISCHES MEER
          </span>

          {/* Häfen */}
          {(ports || []).map((port) => {
            const f = factionByCode?.[port.controllingFactionCode];
            const color = f?.color || "#8a8a8a";
            const selected = selectedPortId === port.id;
            return (
              <button
                key={port.id}
                onClick={() => onSelectPort(port.id)}
                className={`port-pin absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center ${selected ? "selected z-20" : "z-10"}`}
                style={{ left: `${port.x}%`, top: `${port.y}%` }}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: color, backgroundColor: port.isMajorNeutral ? "var(--wood-deep)" : color }}
                >
                  {port.isMajorNeutral && <span className="w-1 h-1 rounded-full bg-[var(--brass)]" />}
                </span>
                <span
                  className={`mt-1 px-1.5 py-0.5 rounded-sm text-[10px] font-display whitespace-nowrap leading-none border ${
                    selected ? "bg-[var(--wood-light)] text-brass-bright border-brass" : "bg-[rgba(11,17,22,0.78)] text-ink border-line"
                  }`}
                >
                  {factionFlag(port.controllingFactionCode)} {port.name}
                </span>
              </button>
            );
          })}
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
