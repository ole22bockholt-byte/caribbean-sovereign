import React from "react";
import { ArrowLeft, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";

// Detail-„Page" pro Schiff. Rendert generisch alle gelieferten Felder, damit
// eigene Stats/Assets später ohne Code-Änderung erscheinen.
export default function ShipDetail({ ship, onBack }) {
  const stats = ship.stats && typeof ship.stats === "object" ? Object.entries(ship.stats) : [];

  return (
    <div className="max-w-3xl mx-auto p-1">
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-ink-dim hover:text-brass-bright hover:bg-transparent px-0 mb-3 font-body-game"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Zurück zur Übersicht
      </Button>

      <div className="panel overflow-hidden">
        <div className="aspect-[21/9] bg-wood-light border-b border-line flex items-center justify-center">
          {ship.imageUrl ? (
            <img src={ship.imageUrl} alt={ship.name} className="w-full h-full object-cover" />
          ) : (
            <Ship className="w-16 h-16 text-ink-dim" strokeWidth={1} />
          )}
        </div>

        <div className="p-5">
          <h1 className="font-display text-brass-bright text-3xl tracking-wide">{ship.name}</h1>
          {ship.class && <div className="font-body-game text-xs uppercase tracking-[0.22em] text-ink-dim mt-1">{ship.class}</div>}
          <div className="brass-rule mt-4 mb-5" />

          {stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {stats.map(([key, value]) => (
                <div key={key} className="bg-wood-light border border-line rounded-sm px-3 py-2.5 text-center">
                  <div className="font-display text-brass text-xl">{String(value)}</div>
                  <div className="font-body-game text-[10px] uppercase tracking-[0.16em] text-ink-dim mt-0.5">{key}</div>
                </div>
              ))}
            </div>
          )}

          {ship.summary && <p className="font-serif-game text-lg text-ink mb-4 italic">{ship.summary}</p>}
          {ship.description && (
            <p className="font-body-game text-[15px] text-ink-dim leading-relaxed whitespace-pre-line">{ship.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}