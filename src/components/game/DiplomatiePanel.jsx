import React from "react";
import { Handshake } from "lucide-react";
import { factionFlag } from "@/lib/gameData";

// Diplomatie (global). Übersicht der Fraktionen und der eigenen Zugehörigkeit.
// Verträge, Bündnisse und dynamische Beziehungswerte folgen später.
export default function DiplomatiePanel({ factions = [], player }) {
  const own = player?.factionCode;
  return (
    <div className="p-1">
      <div className="flex items-center gap-2 mb-1">
        <Handshake className="w-5 h-5 text-brass" strokeWidth={1.6} />
        <h1 className="font-display text-brass-bright text-2xl tracking-wide">Diplomatie</h1>
      </div>
      <div className="brass-rule w-56 mb-5" />

      <div className="panel p-4 mb-4">
        <p className="font-body-game text-sm text-ink-dim">
          Beziehungen zwischen den Mächten der Karibik. Bündnisse, Verträge und dynamische
          Beziehungswerte folgen in einem späteren Schritt — hier zunächst die Fraktionen und
          deine Zugehörigkeit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {factions.map((f) => {
          const isOwn = f.code === own;
          return (
            <div key={f.code} className={`panel p-3 flex items-center gap-3 ${isOwn ? "border-brass" : ""}`}>
              <span className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-lg shrink-0" style={{ borderColor: f.color }}>
                {factionFlag(f.code)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-ink text-[15px] truncate">{f.name}</div>
                <div className="mt-1 h-1.5 rounded-full bg-[var(--wood-deep)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "50%", backgroundColor: f.color }} />
                </div>
              </div>
              <span className="level-badge shrink-0" style={isOwn ? { color: "var(--brass)", borderColor: "var(--brass)" } : { color: "var(--ink-dim)", borderColor: "var(--line)" }}>
                {isOwn ? "Eigene Fraktion" : "Neutral"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
