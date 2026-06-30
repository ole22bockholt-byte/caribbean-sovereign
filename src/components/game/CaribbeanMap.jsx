import React from "react";
import { factionFlag } from "@/lib/gameData";
import MapLegend from "./MapLegend";

const MAP_BG = "https://media.base44.com/images/public/6a43defde92c0d47de02330a/c5394dcd2_generated_image.png";

export default function CaribbeanMap({ ports, factionByCode, selectedPortId, onSelectPort }) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-sm border border-line bg-[var(--sea)]">
      {/* Aged chart texture */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.55]"
        style={{ backgroundImage: `url(${MAP_BG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,16,22,0.35)] to-[rgba(8,16,22,0.65)]" />

      {/* Ports */}
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
              style={{ borderColor: color, backgroundColor: port.isMajorNeutral ? "#1c140d" : color }}
            >
              {port.isMajorNeutral && <span className="w-1 h-1 rounded-full bg-[var(--brass)]" />}
            </span>
            <span
              className={`mt-1 px-1.5 py-0.5 rounded-sm text-[10px] font-display whitespace-nowrap leading-none border ${
                selected ? "bg-[var(--wood-light)] text-brass-bright border-brass" : "bg-[rgba(18,13,9,0.78)] text-ink border-line"
              }`}
            >
              {factionFlag(port.controllingFactionCode)} {port.name}
            </span>
          </button>
        );
      })}

      <MapLegend />
    </div>
  );
}