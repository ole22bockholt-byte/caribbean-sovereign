import React from "react";
import { ArrowLeft } from "lucide-react";
import { factionFlag } from "@/lib/gameData";

// Gemeinsame Kopfzeile aller Hafen-Dienste: Titel, Hafen/Fraktion, Zurück-Aktion
// und optional ein Element rechts (z. B. Gold-Anzeige).
export default function PortServiceHeader({ icon: Icon, title, port, factionByCode, onBack, right }) {
  const ctrl = port ? factionByCode?.[port.controllingFactionCode] : null;
  return (
    <div className="panel-header px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="text-ink-dim hover:text-brass-bright transition-colors shrink-0"
            title="Zurück zur Karte"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {Icon && <Icon className="w-5 h-5 text-brass shrink-0" strokeWidth={1.6} />}
        <div className="min-w-0">
          <h1 className="font-display text-brass-bright text-xl leading-none truncate">{title}</h1>
          {port && (
            <div className="mt-1 text-sm text-ink-dim font-body-game truncate">
              {factionFlag(port.controllingFactionCode)} {port.name} · {ctrl?.name || "Neutral"}
            </div>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}
