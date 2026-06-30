import React from "react";
import {
  LayoutDashboard, Map, ScrollText, Coins, Ship, Anchor, Home,
  Flag, Handshake, Store, Warehouse, Users, FileText,
} from "lucide-react";

const NAV = [
  { id: "uebersicht", label: "Übersicht", icon: LayoutDashboard },
  { id: "weltkarte", label: "Weltkarte", icon: Map },
  { id: "auftraege", label: "Aufträge", icon: ScrollText },
  { id: "handel", label: "Handel", icon: Coins },
  { id: "schiffe", label: "Schiffe", icon: Ship },
  { id: "flotte", label: "Flotte", icon: Anchor },
  { id: "siedlung", label: "Siedlung", icon: Home },
  { id: "fraktion", label: "Fraktion", icon: Flag },
  { id: "diplomatie", label: "Diplomatie", icon: Handshake },
  { id: "markt", label: "Markt", icon: Store },
  { id: "lager", label: "Lager", icon: Warehouse },
  { id: "charaktere", label: "Charaktere", icon: Users },
  { id: "berichte", label: "Berichte", icon: FileText },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="w-56 shrink-0 bg-wood-deep border-r border-line flex flex-col">
      <div className="px-4 py-5 border-b border-line">
        <div className="font-display text-brass-bright text-lg tracking-[0.14em] leading-tight">KARIBIK</div>
        <div className="font-display text-ink-dim text-xs tracking-[0.32em]">ANNO 1765</div>
        <div className="brass-rule mt-3" />
      </div>
      <nav className="flex-1 py-3 thin-scroll overflow-y-auto">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-l-2 ${
                isActive
                  ? "border-brass bg-wood-light text-brass-bright"
                  : "border-transparent text-ink-dim hover:text-ink hover:bg-wood"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.6} />
              <span className="font-body-game text-[15px] tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-line text-[10px] text-ink-dim font-body-game tracking-widest text-center">
        ADMIRALITÄTSKARTE · v0.1
      </div>
    </aside>
  );
}