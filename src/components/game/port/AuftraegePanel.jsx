import React from "react";
import { ScrollText, Coins, MapPin } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { formatGold } from "@/lib/format";
import PortServiceHeader from "./PortServiceHeader";

const TYPE_LABEL = {
  delivery: "Lieferung",
  transport: "Transport",
  escort: "Eskorte",
  combat: "Gefecht",
  bounty: "Kopfgeld",
  smuggle: "Schmuggel",
};

// Aufträge eines Hafens. Vollständige Auftragslogik folgt später; hier die
// standortabhängige Liste mit Annahme-Aktion (Leerzustand ohne Daten).
export default function AuftraegePanel({ port, factionByCode, contracts = [], onBack }) {
  const accept = (c) => {
    toast({ title: "Auftrag angenommen", description: `„${c.title}" — Abschluss und Belohnung folgen mit dem Auftrags-Backend.` });
  };

  return (
    <div className="panel rounded-sm h-full flex flex-col overflow-hidden">
      <PortServiceHeader icon={ScrollText} title="Aufträge" port={port} factionByCode={factionByCode} onBack={onBack} />
      <div className="flex-1 min-h-0 overflow-y-auto thin-scroll p-4">
        <p className="font-body-game text-sm text-ink-dim mb-3">
          Aufträge der Hafenverwaltung von {port?.name}.
        </p>
        {contracts.length === 0 ? (
          <div className="panel p-8 text-center font-serif-game text-ink-dim">
            Zurzeit keine Aufträge an diesem Hafen.
          </div>
        ) : (
          <div className="space-y-2">
            {contracts.map((c, i) => (
              <div key={c.id || i} className="panel p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-ink text-[15px]">{c.title}</span>
                    <span className="level-badge" style={{ color: "var(--brass)", borderColor: "var(--brass)" }}>
                      {TYPE_LABEL[c.type] || c.type || "Auftrag"}
                    </span>
                  </div>
                  {c.destinationName && (
                    <div className="text-[12px] text-ink-dim font-body-game mt-1 inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Ziel: {c.destinationName}
                    </div>
                  )}
                  {c.notes && <p className="font-serif-game text-sm text-ink-dim mt-1">{c.notes}</p>}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="inline-flex items-center gap-1 text-brass-bright font-display text-sm">
                    <Coins className="w-4 h-4" /> {formatGold(c.reward || 0)} G
                  </span>
                  <button onClick={() => accept(c)} className="brass-btn px-3 py-1.5 text-xs">Annehmen</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
