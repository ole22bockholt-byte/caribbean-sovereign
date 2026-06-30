import React from "react";
import { FileText, Hammer, Coins, ScrollText, Handshake, Store } from "lucide-react";

const ACTIONS = [
  { id: "report", label: "Bericht schreiben", icon: FileText },
  { id: "build", label: "Schiff bauen", icon: Hammer },
  { id: "trade", label: "Handel starten", icon: Coins },
  { id: "contract", label: "Auftrag erstellen", icon: ScrollText },
  { id: "diplomacy", label: "Diplomatie", icon: Handshake },
  { id: "market", label: "Marktübersicht", icon: Store },
];

export default function QuickActions({ onAction }) {
  return (
    <div className="flex items-center gap-2">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.id}
            onClick={() => onAction(a.id)}
            className="group flex items-center gap-2 px-3 py-2 rounded-sm bg-wood border border-line hover:border-brass hover:bg-wood-light transition-colors"
          >
            <Icon className="w-4 h-4 text-brass group-hover:text-brass-bright" strokeWidth={1.6} />
            <span className="font-body-game text-[13px] text-ink whitespace-nowrap">{a.label}</span>
          </button>
        );
      })}
    </div>
  );
}