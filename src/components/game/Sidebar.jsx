import React from "react";
import {
  LayoutDashboard, Ship, Handshake, BookOpen, User,
  Coins, Store, Sailboat, Wrench, ScrollText, Anchor,
} from "lucide-react";

// Globales Hauptmenü (standortunabhängig).
const NAV = [
  { id: "uebersicht", label: "Übersicht", icon: LayoutDashboard },
  { id: "schiffe", label: "Schiffe", icon: Ship },
  { id: "diplomatie", label: "Diplomatie", icon: Handshake },
  { id: "wiki", label: "Wiki", icon: BookOpen },
  { id: "profil", label: "Profil", icon: User },
];

// Icons je Hafendienst (standortabhängig eingeblendet).
const SERVICE_ICONS = {
  handel: Coins,
  marktplatz: Store,
  schiffshaendler: Sailboat,
  ausruestung: Wrench,
  auftraege: ScrollText,
};

function SectionLabel({ children }) {
  return (
    <div className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-[0.22em] text-ink-dim font-display">
      {children}
    </div>
  );
}

function NavButton({ item, active, onSelect }) {
  const Icon = item.icon;
  const isActive = active === item.id;
  return (
    <button
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
}

// services: [{ id, label }] — die am aktuellen Hafen verfügbaren Dienste.
export default function Sidebar({ active, onSelect, overview = [], portName, services = [] }) {
  return (
    <aside className="w-56 shrink-0 nav-ground nav-line-r flex flex-col">
      <nav className="thin-scroll overflow-y-auto">
        <SectionLabel>Hauptmenü</SectionLabel>
        {NAV.map((item) => (
          <NavButton key={item.id} item={item} active={active} onSelect={onSelect} />
        ))}

        {/* Standortabhängige Hafendienste */}
        {services.length > 0 && (
          <>
            <div className="mx-4 my-2 brass-rule opacity-40" />
            <SectionLabel>
              <span className="inline-flex items-center gap-1.5">
                <Anchor className="w-3 h-3" /> Hafen{portName ? ` · ${portName}` : ""}
              </span>
            </SectionLabel>
            {services.map((svc) => (
              <NavButton
                key={svc.id}
                item={{ id: svc.id, label: svc.label, icon: SERVICE_ICONS[svc.id] || Coins }}
                active={active}
                onSelect={onSelect}
              />
            ))}
          </>
        )}

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
                  <span className={`font-display text-[13px] ${row.value > 0 ? "text-brass-bright" : "text-ink-dim"}`}>
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
