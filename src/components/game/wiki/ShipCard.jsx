import React from "react";
import { Ship } from "lucide-react";

// Kompakte Karte in der Schiffstypen-Liste. Klick öffnet die Detailseite.
export default function ShipCard({ ship, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="panel text-left p-3 hover:border-brass transition-colors flex flex-col gap-2 group"
    >
      <div className="aspect-[16/10] rounded-sm overflow-hidden picture-ground border border-line flex items-center justify-center">
        {ship.imageUrl ? (
          <img src={ship.imageUrl} alt={ship.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <Ship className="w-10 h-10 text-ink-dim" strokeWidth={1.2} />
        )}
      </div>
      <div>
        <div className="font-display text-ink text-base leading-tight group-hover:text-brass-bright transition-colors">{ship.name}</div>
        {ship.class && <div className="font-body-game text-[11px] uppercase tracking-[0.18em] text-ink-dim mt-0.5">{ship.class}</div>}
      </div>
      {ship.summary && <p className="font-serif-game text-sm text-ink-dim line-clamp-2">{ship.summary}</p>}
    </button>
  );
}