import React from "react";
import { Wrench, Coins, PackageOpen } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { formatGold } from "@/lib/format";
import PortServiceHeader from "./PortServiceHeader";

// Preis eines Ausrüstungsteils herleiten (explizit oder aus der Stufe geschätzt).
export function equipmentPrice(item) {
  if (Number.isFinite(item?.price)) return item.price;
  const tier = (item?.class || "").split("-")[1] || "";
  const TIER = { F: 800, E: 1500, D: 2600, C: 4200, B: 6500, A: 9500, S: 14000 };
  return TIER[tier] || 1200;
}

function ItemCard({ item, price, onBuy }) {
  const stats = item.stats && typeof item.stats === "object" ? Object.entries(item.stats) : [];
  return (
    <div className="panel p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-ink text-[15px] leading-tight truncate">{item.name}</div>
          {item.slotLabel && <div className="font-body-game text-[11px] uppercase tracking-[0.16em] text-ink-dim mt-0.5">{item.slotLabel}</div>}
        </div>
        {item.class && <span className="level-badge shrink-0" style={{ color: "var(--brass)", borderColor: "var(--brass)" }}>{item.class}</span>}
      </div>
      {item.summary && <p className="font-serif-game text-sm text-ink-dim line-clamp-2">{item.summary}</p>}
      {stats.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {stats.map(([k, v]) => (
            <span key={k} className="text-[11px] font-body-game text-ink-dim bg-wood-light border border-line rounded-sm px-1.5 py-0.5">
              {k}: <span className="text-ink">{String(v)}</span>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="inline-flex items-center gap-1 text-brass-bright font-display text-sm">
          <Coins className="w-4 h-4" /> {formatGold(price)} G
        </span>
        <button onClick={onBuy} className="brass-btn px-3 py-1.5 text-xs">Kaufen</button>
      </div>
    </div>
  );
}

// Ausrüstungshändler — nur am Fraktions-Haupthafen. Verkauft Rumpf, Batterien,
// Decksgeschütze und Munition aus dem Ausrüstungskatalog.
export default function AusruestungPanel({ port, factionByCode, economy, equipment = [], onBack }) {
  const buy = (item) => {
    const price = equipmentPrice(item);
    const res = economy?.spend?.(price);
    if (!res?.ok) {
      toast({ title: "Kauf nicht möglich", description: res?.reason || "Unbekannter Fehler." });
      return;
    }
    toast({ title: "Ausrüstung gekauft", description: `${item.name} für ${formatGold(price)} G erworben.` });
  };

  return (
    <div className="panel rounded-sm h-full flex flex-col overflow-hidden">
      <PortServiceHeader
        icon={Wrench}
        title="Ausrüstungshändler"
        port={port}
        factionByCode={factionByCode}
        onBack={onBack}
        right={
          <span className="inline-flex items-center gap-1.5 text-brass-bright font-display text-sm shrink-0">
            <Coins className="w-4 h-4" /> {formatGold(economy?.effectiveGold ?? 0)} G
          </span>
        }
      />
      <div className="flex-1 min-h-0 overflow-y-auto thin-scroll p-4">
        <p className="font-body-game text-sm text-ink-dim mb-3">
          Nur am Haupthafen: {port?.name} rüstet deine Schiffe mit Rumpf, Geschützen und Munition aus.
        </p>
        {equipment.length === 0 ? (
          <div className="panel p-8 text-center text-ink-dim">
            <PackageOpen className="w-8 h-8 mx-auto mb-2 opacity-50" strokeWidth={1.2} />
            <p className="font-serif-game">Der Ausrüstungskatalog wird noch angebunden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {equipment.map((item, i) => (
              <ItemCard key={item.id || i} item={item} price={equipmentPrice(item)} onBuy={() => buy(item)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
