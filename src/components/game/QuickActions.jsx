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
    <div className="flex items-center gap-1.5">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.id}
            onClick={() => onAction(a.id)}
            className="group flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-sm hover:bg-[rgba(230,200,120,0.06)] transition-colors min-w-[74px]"
          >
            <Icon className="w-5 h-5 text-brass group-hover:text-brass-bright" strokeWidth={1.5} />
            <span className="font-body-game text-[11px] text-ink-dim group-hover:text-ink whitespace-nowrap leading-none">
              {a.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
