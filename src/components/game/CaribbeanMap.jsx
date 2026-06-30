import React from "react";
import { PORTS, TRADE_ROUTES, PIRATE_ACTIVITY, getFaction, getPort } from "@/lib/mockData";
import { ROUTE_COLORS } from "@/lib/format";
import MapLegend from "./MapLegend";

const MAP_BG = "https://media.base44.com/images/public/6a43defde92c0d47de02330a/c5394dcd2_generated_image.png";

export default function CaribbeanMap({ selectedPortId, onSelectPort }) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-sm border border-line bg-[var(--sea)]">
      {/* Aged chart texture */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.55]"
        style={{ backgroundImage: `url(${MAP_BG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,16,22,0.35)] to-[rgba(8,16,22,0.65)]" />

      {/* SVG overlay for routes + ports (0–100 viewBox = percentage coords) */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        {/* Trade routes */}
        {TRADE_ROUTES.map((r) => {
          const a = getPort(r.from);
          const b = getPort(r.to);
          if (!a || !b) return null;
          return (
            <line
              key={r.id}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={ROUTE_COLORS[r.type] || ROUTE_COLORS.neutral}
              strokeWidth="0.35"
              strokeDasharray={r.type === "own" ? "0" : "1.4 1"}
              opacity="0.75"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {/* Pirate activity hotspots */}
      {PIRATE_ACTIVITY.map((p) => (
        <div
          key={p.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <span className={`text-lg ${p.intensity === "high" ? "pulse-dot" : "opacity-70"}`}>🏴‍☠️</span>
        </div>
      ))}

      {/* Ports */}
      {PORTS.map((port) => {
        const f = getFaction(port.controllingFaction);
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
              style={{ borderColor: f.color, backgroundColor: port.isMajorNeutral ? "#1c140d" : `${f.color}` }}
            >
              {port.isMajorNeutral && <span className="w-1 h-1 rounded-full bg-[var(--brass)]" />}
            </span>
            <span
              className={`mt-1 px-1.5 py-0.5 rounded-sm text-[10px] font-display whitespace-nowrap leading-none border ${
                selected ? "bg-[var(--wood-light)] text-brass-bright border-brass" : "bg-[rgba(18,13,9,0.78)] text-ink border-line"
              }`}
            >
              {f.flag} {port.name}
            </span>
          </button>
        );
      })}

      <MapLegend />
    </div>
  );
}