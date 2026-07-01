import React from "react";
import { formatCountdown } from "@/lib/format";

// =============================================================================
// ShipToken — fahrendes Schiff auf der Karte. Der Rumpf zeigt in Fahrtrichtung
// (heading, 0° = Ost); darunter Name und Restzeit bis zur Ankunft. Position per
// left%/top%, damit das Symbol trotz gedehnter SVG-Karte unverzerrt bleibt.
// =============================================================================

export default function ShipToken({ ship }) {
  const rot = ship.heading || 0;
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none"
      style={{ left: `${ship.x}%`, top: `${ship.y}%` }}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        style={{ transform: `rotate(${rot}deg)`, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.7))" }}
      >
        {/* Kielwasser */}
        <path d="M2 12 L8 10.6 L8 13.4 Z" fill="rgba(230,200,120,0.35)" />
        {/* Rumpf (zeigt nach Ost) */}
        <path
          d="M7 9.5 L18 9.5 L21 12 L18 14.5 L7 14.5 Z"
          fill="var(--brass)"
          stroke="var(--wood-deep)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        {/* Segel */}
        <path d="M12.5 4 L12.5 9.5 L16.5 9.5 Z" fill="var(--ink)" stroke="var(--wood-deep)" strokeWidth="0.5" />
        <line x1="12.5" y1="4" x2="12.5" y2="12" stroke="var(--wood-deep)" strokeWidth="0.8" />
      </svg>
      <span className="mt-0.5 px-1 py-px rounded-sm text-[9px] font-display whitespace-nowrap bg-[rgba(11,17,22,0.85)] text-brass-bright border border-brass/60 flex items-center gap-1">
        {ship.shipName}
        <span className="text-ink-dim font-body-game">{formatCountdown(ship.etaSeconds)}</span>
      </span>
    </div>
  );
}
