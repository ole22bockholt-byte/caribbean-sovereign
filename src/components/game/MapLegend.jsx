import React from "react";
import { ROUTE_COLORS } from "@/lib/format";

// Legende passend zu den tatsächlich gezeichneten Kartenelementen.
const ITEMS = [
  { label: "Fort", swatch: "var(--brass)", shape: "ring" },
  { label: "Handelshafen", swatch: "var(--ink-dim)", shape: "ring" },
  { label: "Freibeuternest", swatch: "var(--blood)", shape: "ring" },
  { label: "Freier Hafen", swatch: "var(--pos)", shape: "ring" },
  { label: "Eigenes Schiff", swatch: "var(--brass-bright)", shape: "dot" },
  { label: "Seeweg", swatch: ROUTE_COLORS.own, shape: "dash" },
];

export default function MapLegend() {
  return (
    <div className="absolute bottom-0 inset-x-0 z-30 flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 bg-[rgba(11,17,22,0.82)] border-t border-line backdrop-blur-sm">
      {ITEMS.map((it) => (
        <div key={it.label} className="flex items-center gap-2">
          {it.shape === "dash" ? (
            <span className="w-5 h-0" style={{ borderTop: `2px dashed ${it.swatch}` }} />
          ) : it.shape === "ring" ? (
            <span className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: it.swatch }} />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: it.swatch }} />
          )}
          <span className="text-[11px] text-ink-dim font-body-game whitespace-nowrap">{it.label}</span>
        </div>
      ))}
    </div>
  );
}
