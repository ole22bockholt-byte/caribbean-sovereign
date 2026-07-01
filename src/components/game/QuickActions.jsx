import React from "react";
import { Coins, Store, Sailboat, Wrench, ScrollText, Handshake } from "lucide-react";

// Aktionsleiste: die vier standortabhängigen Hafendienste + Diplomatie (global).
// Nicht verfügbare Dienste werden ausgegraut.
const ACTIONS = [
  { id: "handel", label: "Händler", icon: Coins },
  { id: "marktplatz", label: "Marktplatz", icon: Store },
  { id: "schiffshaendler", label: "Schiffshändler", icon: Sailboat },
  { id: "ausruestung", label: "Ausrüstung", icon: Wrench },
  { id: "auftraege", label: "Aufträge", icon: ScrollText },
  { id: "diplomatie", label: "Diplomatie", icon: Handshake, global: true },
];

export default function QuickActions({ onAction, availability = {} }) {
  return (
    <div className="flex items-center gap-1.5">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        const enabled = a.global || availability[a.id];
        return (
          <button
            key={a.id}
            onClick={() => enabled && onAction(a.id)}
            disabled={!enabled}
            title={enabled ? a.label : `${a.label} — an diesem Hafen nicht verfügbar`}
            className={`group flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-sm transition-colors min-w-[74px] ${
              enabled ? "hover:bg-[rgba(230,200,120,0.06)]" : "opacity-35 cursor-not-allowed"
            }`}
          >
            <Icon className={`w-5 h-5 ${enabled ? "text-brass group-hover:text-brass-bright" : "text-ink-dim"}`} strokeWidth={1.5} />
            <span className={`font-body-game text-[11px] whitespace-nowrap leading-none ${enabled ? "text-ink-dim group-hover:text-ink" : "text-ink-dim"}`}>
              {a.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
