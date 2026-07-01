import React from "react";

// =============================================================================
// PortMarker — detailliertes Hafen-Icon + Beschriftung. Das Glyph richtet sich
// nach dem Hafentyp (Fort / Handelshafen / Freibeuter / freier Hafen); der Ring
// trägt die Farbe der kontrollierenden Fraktion. Positionierung per left%/top%,
// deckungsgleich mit der SVG-Karte.
// =============================================================================

function PortGlyph({ type }) {
  // 24x24-Glyphen, hell (var(--ink)) auf farbigem Grund.
  switch (type) {
    case "fort":
      // Sternfort (Bastionen)
      return (
        <path
          d="M12 3 L14 6 L17 5 L17 9 L20 11 L17 13 L18 17 L14 16 L12 19 L10 16 L6 17 L7 13 L4 11 L7 9 L7 5 L10 6 Z"
          fill="currentColor"
        />
      );
    case "pirate":
      // Totenkopf
      return (
        <g fill="currentColor">
          <path d="M12 4c-4 0-6 2.6-6 6 0 2.2 1.2 3.6 2.4 4.4V16h7.2v-1.6C16.8 13.6 18 12.2 18 10c0-3.4-2-6-6-6Z" />
          <circle cx="9.6" cy="10" r="1.4" fill="var(--wood-deep)" />
          <circle cx="14.4" cy="10" r="1.4" fill="var(--wood-deep)" />
          <rect x="10.6" y="16.4" width="1.1" height="2.4" />
          <rect x="12.3" y="16.4" width="1.1" height="2.4" />
        </g>
      );
    case "neutral":
      // Waage / freier Handelshafen (Raute)
      return <path d="M12 4 L19 12 L12 20 L5 12 Z" fill="currentColor" />;
    default:
      // Anker (Handelshafen)
      return (
        <g stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5.5" r="1.8" fill="currentColor" stroke="none" />
          <line x1="12" y1="7.3" x2="12" y2="18.5" />
          <line x1="8.5" y1="10.5" x2="15.5" y2="10.5" />
          <path d="M5.5 14.5 C5.5 18 8.5 19.5 12 19.5 C15.5 19.5 18.5 18 18.5 14.5" />
        </g>
      );
  }
}

const TYPE_LABEL = {
  fort: "Fort",
  harbor: "Handelshafen",
  pirate: "Freibeuternest",
  neutral: "Freier Hafen",
};

// Bestverfügbare Ware (günstigster Einkauf) für die Ressourcenkarte.
function topResource(market) {
  if (!market || market.length === 0) return null;
  return market.reduce((best, m) => (m.buy < best.buy ? m : best), market[0]).good;
}

export default function PortMarker({ port, color, selected, onSelect, mode, shipHere }) {
  const res = mode === "ressourcen" ? topResource(port.market) : null;
  const size = selected ? 26 : 22;

  return (
    <button
      onClick={() => onSelect(port.id)}
      title={`${port.name} — ${TYPE_LABEL[port.type] || "Hafen"}`}
      className={`port-pin absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center ${selected ? "selected z-30" : "z-20"}`}
      style={{ left: `${port.x}%`, top: `${port.y}%` }}
    >
      <span
        className="rounded-full flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.55)]"
        style={{
          width: size,
          height: size,
          border: `2px solid ${color}`,
          background: "radial-gradient(circle at 35% 30%, var(--wood-light), var(--wood-deep))",
          color: selected ? "var(--brass-bright)" : "var(--ink)",
        }}
      >
        <svg width={size - 8} height={size - 8} viewBox="0 0 24 24">
          <PortGlyph type={port.type} />
        </svg>
        {shipHere && (
          <span
            className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-[var(--wood-deep)]"
            style={{ background: "var(--pos)" }}
            title="Eigenes Schiff im Hafen"
          />
        )}
      </span>

      <span className="mt-1 flex flex-col items-center leading-none">
        <span
          className={`px-1.5 py-0.5 rounded-sm text-[10px] font-display whitespace-nowrap border inline-flex items-center gap-1 ${
            selected
              ? "bg-[var(--wood-light)] text-brass-bright border-brass"
              : "bg-[rgba(11,17,22,0.82)] text-ink border-line"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-[1px]" style={{ background: color }} />
          {port.name}
        </span>
        {res && (
          <span className="mt-0.5 px-1 py-px rounded-sm text-[9px] font-body-game whitespace-nowrap bg-[rgba(11,17,22,0.78)] text-brass border border-line/70">
            {res}
          </span>
        )}
      </span>
    </button>
  );
}
