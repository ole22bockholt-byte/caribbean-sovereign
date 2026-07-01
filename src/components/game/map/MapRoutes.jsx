import React from "react";
import { ROUTE_COLORS } from "@/lib/format";

// =============================================================================
// MapRoutes — zeichnet Seewege als gestrichelte Linien: laufende Reisen (Messing)
// und die geplante Vorschau-Route (heller, dünner). Gleiches Koordinatensystem
// wie MapCanvas (0..100), damit alles deckungsgleich liegt.
// =============================================================================

const toPolyline = (points) => (points || []).map((p) => `${p.x},${p.y}`).join(" ");

export default function MapRoutes({ sailing = [], planned = null }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* Geplante Route (Vorschau) */}
      {planned?.points?.length > 1 && (
        <polyline
          points={toPolyline(planned.points)}
          fill="none"
          stroke="var(--brass-bright)"
          strokeWidth="1"
          strokeOpacity="0.6"
          strokeDasharray="1.6 1.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      )}

      {/* Laufende Reisen */}
      {sailing.map((v) => (
        <polyline
          key={v.id}
          points={toPolyline(v.route)}
          fill="none"
          stroke={ROUTE_COLORS.own}
          strokeWidth="1.2"
          strokeOpacity="0.85"
          strokeDasharray="2 1.4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
