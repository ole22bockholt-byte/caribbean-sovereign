import React from "react";
import { ROUTE_COLORS } from "@/lib/format";

const ITEMS = [
  { label: "Eigene Schiffe", swatch: "var(--pos)", shape: "dot" },
  { label: "Verbündete", swatch: "var(--pos)", shape: "ring" },
  { label: "Feindlich", swatch: "var(--blood)", shape: "dot" },
  { label: "Neutrale", swatch: "#6b7280", shape: "dot" },
  { label: "Handelsrouten", swatch: ROUTE_COLORS.own, shape: "dash" },
  { label: "Seerouten", swatch: "var(--ink-dim)", shape: "line" },
];

export default function MapLegend() {
  return (
    <div className="absolute bottom-0 inset-x-0 z-30 flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 bg-[rgba(11,17,22,0.82)] border-t border-line backdrop-blur-sm">
      {ITEMS.map((it) => (
        <div key={it.label} className="flex items-center gap-2">
          {it.shape === "dash" ? (
            <span
              className="w-5 h-0"
              style={{ borderTop: `2px dashed ${it.swatch}` }}
            />
          ) : it.shape === "line" ? (
            <span className="w-5 h-0.5 rounded" style={{ backgroundColor: it.swatch }} />
          ) : it.shape === "ring" ? (
            <span
              className="w-2.5 h-2.5 rounded-full border-2"
              style={{ borderColor: it.swatch }}
            />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: it.swatch }} />
          )}
          <span className="text-[11px] text-ink-dim font-body-game whitespace-nowrap">{it.label}</span>
        </div>
      ))}
    </div>
  );
}
