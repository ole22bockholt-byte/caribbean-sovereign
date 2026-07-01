import React, { useMemo, useState } from "react";
import { Coins, TrendingUp, TrendingDown, Minus, Plus, Package, ShoppingCart } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { formatGold, levelFor } from "@/lib/format";
import PortServiceHeader from "./PortServiceHeader";

const TrendIcon = ({ t }) =>
  t === "up" ? <TrendingUp className="w-3.5 h-3.5 text-[var(--pos)]" /> :
  t === "down" ? <TrendingDown className="w-3.5 h-3.5 text-[var(--blood)]" /> :
  <Minus className="w-3.5 h-3.5 text-ink-dim" />;

// Verfügbarkeit je Ware aus dem lokalen Preisniveau ableiten (günstig = reichlich).
function withAvailability(market) {
  if (!market || market.length === 0) return [];
  const prices = market.map((m) => m.buy);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  return market.map((m) => ({
    ...m,
    level: levelFor(Math.round((1 - (m.buy - min) / span) * 100)),
  }));
}

const toneColor = (tone) =>
  tone === "pos" ? "var(--pos)" : tone === "neg" ? "var(--blood)" : tone === "dim" ? "var(--ink-dim)" : "var(--brass)";

// Händler: Warenhandel gegen die (persistente) Hafenwirtschaft. Preise stammen
// aus port.market (Backend); Käufe/Verkäufe laufen über die Wirtschafts-Schicht.
export default function HaendlerPanel({ port, factionByCode, economy, onBack }) {
  const goods = useMemo(() => withAvailability(port?.market || []), [port]);
  const [selected, setSelected] = useState(goods[0]?.good || null);
  const [qty, setQty] = useState(1);

  const row = goods.find((g) => g.good === selected) || goods[0] || null;
  const cargoOf = (good) => economy?.cargo?.[good] || 0;

  const doTrade = (side) => {
    if (!row) return;
    const unitPrice = side === "buy" ? row.buy : row.sell;
    const res = economy?.trade?.({ side, good: row.good, qty, unitPrice });
    if (!res?.ok) {
      toast({ title: "Handel nicht möglich", description: res?.reason || "Unbekannter Fehler." });
      return;
    }
    toast({
      title: side === "buy" ? "Eingekauft" : "Verkauft",
      description: `${qty} × ${row.good} für ${formatGold(qty * unitPrice)} G ${side === "buy" ? "gekauft" : "verkauft"}.`,
    });
  };

  return (
    <div className="panel rounded-sm h-full flex flex-col overflow-hidden">
      <PortServiceHeader
        icon={Coins}
        title="Händler"
        port={port}
        factionByCode={factionByCode}
        onBack={onBack}
        right={
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-brass-bright font-display text-sm">
              <Coins className="w-4 h-4" /> {formatGold(economy?.effectiveGold ?? 0)} G
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink-dim font-body-game text-sm">
              <Package className="w-4 h-4" /> {economy?.cargoUsed ?? 0} Ladung
            </span>
          </div>
        }
      />

      <div className="flex-1 min-h-0 flex">
        {/* Warenliste */}
        <div className="flex-1 min-w-0 overflow-y-auto thin-scroll p-4">
          <p className="font-body-game text-sm text-ink-dim mb-3">
            Der Händler von {port?.name} kauft und verkauft nach lokaler Hafenwirtschaft.
          </p>
          {goods.length === 0 ? (
            <div className="panel p-6 text-center font-serif-game text-ink-dim">Keine Handelsdaten für diesen Hafen.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ware</th>
                  <th>Verfügbarkeit</th>
                  <th className="!text-right">Einkauf</th>
                  <th className="!text-right">Verkauf</th>
                  <th className="!text-right">Trend</th>
                  <th className="!text-right">Laderaum</th>
                </tr>
              </thead>
              <tbody>
                {goods.map((g) => {
                  const active = g.good === selected;
                  return (
                    <tr
                      key={g.good}
                      onClick={() => { setSelected(g.good); setQty(1); }}
                      className={`cursor-pointer ${active ? "!bg-[rgba(230,200,120,0.08)]" : ""}`}
                    >
                      <td className="font-serif-game text-[14px] text-ink">{g.good}</td>
                      <td>
                        <span className="level-badge" style={{ color: toneColor(g.level.tone), borderColor: toneColor(g.level.tone) }}>
                          {g.level.label}
                        </span>
                      </td>
                      <td className="text-right text-ink">{g.buy} G</td>
                      <td className="text-right text-ink-dim">{g.sell} G</td>
                      <td><div className="flex justify-end"><TrendIcon t={g.trend} /></div></td>
                      <td className="text-right text-brass">{cargoOf(g.good)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Order-Komponist */}
        {row && (
          <div className="w-[260px] shrink-0 border-l border-line p-4 flex flex-col gap-3 bg-[rgba(11,17,22,0.35)]">
            <div className="font-display text-[10px] tracking-[0.16em] uppercase text-brass inline-flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" /> Handelsposten
            </div>
            <div className="font-serif-game text-xl text-brass-bright">{row.good}</div>
            <div className="grid grid-cols-2 gap-2 text-sm font-body-game">
              <div className="bg-wood-light border border-line rounded-sm px-2 py-1.5">
                <div className="text-[10px] uppercase tracking-wider text-ink-dim">Einkauf</div>
                <div className="text-ink">{row.buy} G</div>
              </div>
              <div className="bg-wood-light border border-line rounded-sm px-2 py-1.5">
                <div className="text-[10px] uppercase tracking-wider text-ink-dim">Verkauf</div>
                <div className="text-ink">{row.sell} G</div>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink-dim mb-1 font-body-game">Menge</div>
              <div className="flex items-center gap-2">
                <button className="ghost-btn !px-2" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="w-3.5 h-3.5" /></button>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
                  className="w-full text-center bg-[var(--wood-light)] border border-line rounded-sm px-2 py-1 text-ink font-display focus:outline-none focus:border-brass"
                />
                <button className="ghost-btn !px-2" onClick={() => setQty((q) => q + 1)}><Plus className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            <div className="mt-1 space-y-2">
              <button className="brass-btn w-full py-2 text-sm" onClick={() => doTrade("buy")}>
                Kaufen · {formatGold(qty * row.buy)} G
              </button>
              <button className="ghost-btn w-full py-2 text-sm" onClick={() => doTrade("sell")}>
                Verkaufen · {formatGold(qty * row.sell)} G
              </button>
            </div>
            <p className="text-[11px] text-ink-dim font-body-game mt-auto leading-snug">
              Laderaum: {cargoOf(row.good)} × {row.good}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
