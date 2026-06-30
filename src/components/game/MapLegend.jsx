import React from "react";
import { ROUTE_COLORS } from "@/lib/format";

const ITEMS = [
  { label: "Eigene Schiffe", swatch: "#caa65a", shape: "ship" },
  { label: "Verbündete", swatch: "#3f7d4f", shape: "dot" },
  { label: "Feinde", swatch: "#9b1c2e", shape: "dot" },
  { label: "Neutrale Häfen", swatch: "#6b7280", shape: "dot" },
  { label: "Handelsroute", swatch: ROUTE_COLORS.own, shape: "line" },
  { label: "Piratenaktivität", swatch: "#1f2937", shape: "skull" },
];

export default function MapLegend() {
  return (
    <div className="absolute bottom-3 left-3 panel rounded-sm px-3 py-2.5 backdrop-blur-sm bg-[rgba(18,13,9,0.82)]">
      <div className="font-display text-[10px] tracking-[0.18em] uppercase text-brass mb-2">Legende</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {ITEMS.map((it) => (
          <div key={it.label} className="flex items-center gap-2">
            {it.shape === "line" ? (
              <span className="w-5 h-0.5 rounded" style={{ backgroundColor: it.swatch }} />
            ) : it.shape === "skull" ? (
              <span className="text-xs leading-none">🏴‍☠️</span>
            ) : it.shape === "ship" ? (
              <span className="text-xs leading-none" style={{ color: it.swatch }}>⛵</span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: it.swatch }} />
            )}
            <span className="text-[11px] text-ink-dim font-body-game">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}