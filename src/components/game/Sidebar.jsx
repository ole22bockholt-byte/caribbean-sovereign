import React from "react";
import {
  LayoutDashboard, Map, ScrollText, Coins, Ship, Anchor, Home,
  Flag, Handshake, Store, Warehouse, Users, FileText, User, BookOpen,
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
  { id: "wiki", label: "Wiki", icon: BookOpen },
  { id: "profil", label: "Profil", icon: User },
];

function SectionLabel({ children }) {
  return (
    <div className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-[0.22em] text-ink-dim font-display">
      {children}
    </div>
  );
}

export default function Sidebar({ active, onSelect, overview = [] }) {
  return (
    <aside className="w-56 shrink-0 nav-ground nav-line-r flex flex-col">
      <nav className="thin-scroll overflow-y-auto">
        <SectionLabel>Hauptmenü</SectionLabel>
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors border-l-[3px] ${
                isActive
                  ? "border-brass bg-[var(--wood-light)] text-brass-bright"
                  : "border-transparent text-ink-dim hover:text-ink hover:bg-[rgba(230,200,120,0.05)]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.6} />
              <span className="font-body-game text-[15px] tracking-wide">{item.label}</span>
            </button>
          );
        })}

        {overview.length > 0 && (
          <>
            <div className="mx-4 my-2 brass-rule opacity-40" />
            <SectionLabel>Kurzübersicht</SectionLabel>
            <div className="px-4 pb-3 space-y-1.5">
              {overview.map((row) => (
                <button
                  key={row.label}
                  onClick={() => row.to && onSelect(row.to)}
                  className={`w-full flex items-center justify-between text-left ${row.to ? "hover:text-ink" : "cursor-default"}`}
                >
                  <span className="font-body-game text-[13px] text-ink-dim">{row.label}</span>
                  <span
                    className={`font-display text-[13px] ${
                      row.value > 0 ? "text-brass-bright" : "text-ink-dim"
                    }`}
                  >
                    {row.value}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="mt-auto px-4 py-3 nav-line-t text-[10px] text-ink-dim font-body-game tracking-widest text-center">
        ADMIRALITÄTSKARTE · v0.1
      </div>
    </aside>
  );
}
